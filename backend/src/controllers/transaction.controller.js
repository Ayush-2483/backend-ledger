const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');

function isValidAmount(amount) {
    return typeof amount === 'number' && Number.isFinite(amount) && amount > 0;
}

/**
 * Create a new transaction
 * THE 10-STEP TRANSFER FLOW : 
 * 1.Validate the request 
 * 2.Validate idempotency key
 * 3.Check account status
 * 4.Derive sender balance from ledger 
 * 5.Create transaction(PENDING)
 * 6.Create DEBIT ledger entry for sender
 * 7.Create CREDIT ledger entry for receiver
 * 8.Mark transaction as COMPLETED
 * 9.Commit MongoDB session
 * 10.Send email notification
 */

async function createTransaction(req,res){
  /*
   * 1.Validate the request 
   */

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if(!fromAccount || !toAccount || !isValidAmount(amount) || !idempotencyKey){
        return res.status(400).json({
            message:"From account, to account, amount and idempotency key are required"
        })
    }

    if (!mongoose.Types.ObjectId.isValid(fromAccount) || !mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({ message: "Invalid account ID" });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
        user: req.user._id
    });
    const toUserAccount = await accountModel.findById(toAccount).populate("user", "email name");

    if(!fromUserAccount || !toUserAccount){
        return res.status(404).json({
            message:"Invalid from account or to account"
        })
    }

/*
   * 2.Validate Idempotency key
*/

    const isTransactionAlreadyExists = await transactionModel.findOne({idempotencyKey:idempotencyKey});
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already completed",
                transaction:isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "PENDING"){
         return  res.status(200).json({
                message:"Transaction is still in progress",
                transaction:isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "FAILED"){
          return  res.status(500).json({
                message:"Transaction processing failed",
                transaction:isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
           return res.status(500).json({
                message:"Transaction has been reversed",
                transaction:isTransactionAlreadyExists
            })
        }

    }

    /*
   * 3.Check account status
   */
  if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
        message:"Both accounts must be ACTIVE to perform transaction"
    })
  }

/*
* 4.Derive sender balance from ledger
*/
const balance = await fromUserAccount.getBalance();

if(balance < amount){
    return res.status(400).json({
        message:`Insufficient balance. Current balance is ${balance}, Requested amount is ${amount}`
    })
}

/*
* 5.Create transaction(PENDING)-9.Commit MongoDB session
*/
const session = await mongoose.startSession();
session.startTransaction();

let transaction;

try {
    [transaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }], { session });

    await ledgerModel.create([{
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session });

    await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();

    if (error.code === 11000) {
        const existingTransaction = await transactionModel.findOne({ idempotencyKey });
        return res.status(200).json({
            message: "Transaction already exists for this idempotency key",
            transaction: existingTransaction
        });
    }

    return res.status(500).json({
        message: "Transaction processing failed",
        error: error.message
    });
} finally {
    session.endSession();
}

/*
* 10.Send email notification
*/
await emailService.sendTransactionEmail(req.user.email, req.user.name,amount,toAccount);

if (toUserAccount.user && toUserAccount.user.email !== req.user.email) {
    await emailService.sendTransactionEmail(
        toUserAccount.user.email,
        toUserAccount.user.name,
        amount,
        toAccount
    );
}

return res.status(201).json({
    message:"Transaction completed successfully",
    transaction:transaction
})
    
}

async function createInitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body;

    // 1. Validate request
    if (!toAccount || !isValidAmount(amount) || !idempotencyKey) {
        return res.status(400).json({
            message: "To account, amount and idempotency key are required"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({ message: "Invalid account ID" });
    }

    const existingTransaction = await transactionModel.findOne({ idempotencyKey });
    if (existingTransaction) {
        return res.status(200).json({
            message: "Transaction already exists for this idempotency key",
            transaction: existingTransaction
        });
    }

    // 2. Find receiver account
    const toUserAccount = await accountModel.findById(toAccount).populate("user", "email name");

    if (!toUserAccount) {
        return res.status(404).json({
            message: "Invalid toAccount"
        });
    }

    if (toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: "Destination account must be ACTIVE" });
    }

    // 3. Find the authenticated SYSTEM user's account
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    });

    if (!fromUserAccount) {
        return res.status(404).json({
            message: "System user account not found"
        });
    }

    // 4. Start session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // 5. Create transaction
        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount: toAccount,
            amount: amount,
            idempotencyKey: idempotencyKey,
            status: "PENDING"
        });

        await transaction.save({ session });

        // 6. Debit SYSTEM account
        const debitLedgerEntry = new ledgerModel({
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        });

        await debitLedgerEntry.save({ session });

        // 7. Credit USER account
        const creditLedgerEntry = new ledgerModel({
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        });

        await creditLedgerEntry.save({ session });

        // 8. Complete transaction
        transaction.status = "COMPLETED";

        await transaction.save({ session });

        // 9. Commit
        await session.commitTransaction();

        await emailService.sendTransactionEmail(
            toUserAccount.user.email,
            toUserAccount.user.name,
            amount,
            toAccount
        );

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction
        });

    } catch (error) {

        await session.abortTransaction();

        if (error.code === 11000) {
            const existingTransaction = await transactionModel.findOne({ idempotencyKey });
            return res.status(200).json({
                message: "Transaction already exists for this idempotency key",
                transaction: existingTransaction
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Initial funds transaction failed",
            error: error.message
        });

    } finally {
        session.endSession();
    }
}

async function getUserTransactions(req, res) {
    const userAccounts = await accountModel.find({ user: req.user._id }).select("_id");
    const accountIds = userAccounts.map((account) => account._id);

    const transactions = await transactionModel.find({
        $or: [
            { fromAccount: { $in: accountIds } },
            { toAccount: { $in: accountIds } }
        ]
    })
        .populate("fromAccount", "user")
        .populate("toAccount", "user")
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json({ transactions });
}



module.exports = { createTransaction, createInitialFundsTransaction, getUserTransactions }