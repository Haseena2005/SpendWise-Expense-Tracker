const nodemailer = require('nodemailer');

/**
 * Sends an email notification to the user using Ethereal (mock SMTP for dev/testing)
 */
const sendEmailNotification = async (userEmail, subject, text) => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    const info = await transporter.sendMail({
      from: '"SpendWise Alerts" <alerts@spendwise.com>',
      to: userEmail,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">SpendWise Alert</h2>
          <p style="font-size: 16px;">${text}</p>
          <br/>
          <p style="font-size: 12px; color: #888;">This is an automated message from your personal finance manager.</p>
        </div>
      `,
    });

    console.log("-----------------------------------------");
    console.log("📧 Email Notification Sent: %s", info.messageId);
    console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

module.exports = { sendEmailNotification };
