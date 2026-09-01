const express = require('express');
const authRouter = require('./routes/auth.routes')

const app = express(); // server ka instance

app.use(express.json());  //express server req.body ke andr ke data ko nahi padh skta 

app.use("/api/auth",authRouter) 




module.exports = app;

