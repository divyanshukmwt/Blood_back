const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.HOSTER_CLR,
  port: Number(process.env.PORT_CLR),
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000, 
  socketTimeout: 10000,
});


module.exports.sendEmail = async ({ email, sub, mess }) => {
    try {
      return await transporter.sendMail({
        from: process.env.SENDER_CLR,
        to: email,
        subject: sub,
        html: mess,
      })
    } catch (error) {
      console.error("Error sending email: ", error.message);
    }
};

module.exports.sendBackMail = async ({ email, sub, mess }) => {
  try {
    return await transporter.sendMail({
      from: email,
      to: process.env.SENDER_CLR,
      subject: sub,
      html: mess,
    });
  } catch (error) {
    console.error("error", "Error sending email: ", error.message);
    console.error("Error sending email: ", error.message);
  }
};