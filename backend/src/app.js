const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');



const app = express(); // server ka instance

app.use(express.json());  //express server req.body ke andr ke data ko nahi padh skta 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

/*
* - Routes Requires
*/
const authRouter = require('./routes/auth.routes')
const accountRouter = require('./routes/account.routes')
const transactionRouter = require('./routes/transaction.routes')
/*
* - Use Routes
*/
app.use("/api/accounts", accountRouter);
app.use("/api/auth",authRouter) 
app.use("/api/transactions", transactionRouter);

app.get('/{*splat}', (req, res, next) => {
	if (req.path.startsWith('/api/')) return next();
	return res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});




module.exports = app;

