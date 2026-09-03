const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger entry must be associated with an account"],
        index: true,
        immutable: true,
    },
    amount:{
        type: Number,
        required: [true, "Amount is required for ledger entry"],
        immutable: true,
        min: [0, "Amount must be a positive number"]
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger entry must be associated with a transaction"],
        index: true,
        immutable: true,
    },
    type:{
        type: String,
        enum: {
            values:["CREDIT", "DEBIT"],
            message: "Ledger entry type can be either CREDIT or DEBIT",
        },
        required: [true, "Ledger entry type is required"],
        immutable: true,
    }
})

function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted.");
}

ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);



const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;