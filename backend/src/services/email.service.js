require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,

  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify()
  .then(() => {
    console.log("Email server is ready to send messages");
  })
  .catch((error) => {
    console.error("Email verification failed");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
  });



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("EMAIL SENT");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);

    return info;

  } catch (error) {
    console.error("EMAIL SEND ERROR");
    console.error("Code:", error.code);
    console.error("Response:", error.response);
    console.error("Message:", error.message);

    throw error; // VERY IMPORTANT
  }
};


async function sendRegistrationEmail(userEmail, name){
    const subject='Welcome to Backend Ledger!';
    const text=`Hello ${name},\n\nThank you for registering with Backend Ledger.We 're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
    const html=`<p>Hello ${name},</p><p>Thank you for registering with Backend Ledger. We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team !!</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name,amount, toAccount){
  const subject='Transaction Successful!';
  const text=`Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
  const html=`<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team !</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name,amount, toAccount,){
  const subject='Transaction Failed!';
  const text=`Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} has failed. Please try again.\n\nBest regards,\nThe Backend Ledger Team`;
  const html=`<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} has failed. Please try again.</p><p>Best regards,<br>The Backend Ledger Team !</p>`;

  
  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail };