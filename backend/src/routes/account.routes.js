const express = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");


const router = express.Router()

/*
* - POST /api/accounts
* - Create a new account for the authenticated user
* - protected route, requires authentication
*/

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController);


/**
 * -GET /api/accounts/
 * -GET all accounts of the logged-in user
 * -Protected Route
 */

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsController)

/**
 * -GET /api/accounts/balance/:accountID
 * 
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)
module.exports = router