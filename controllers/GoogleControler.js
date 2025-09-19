const {userFinder} = require("../utlis/UserFinder");
const { OAuth2Client } = require("google-auth-library");
const Otp = require("../utlis/OtpFunction");
const EmailSender = require("../utlis/EmailSender");
const emailTemplate = require("../Email_Template/Emails");
const userService = require("../Services/user.service");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userModel = require("../Models/User-Model");
const {cleanUser} = require("../utlis/cleanUser");

module.exports.verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ error: "Email not found in token" });
    }

    let user = await userFinder({key:"email", query: email});
    const otp = Otp.OtpGenerator();

    if (!user) {
      const password = process.env.PASSWORD;
      const hashedPassword = await userModel.hashPassword(password);
      user = await userService.createUser({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry: new Date(Date.now() + 60 * 1000),
      });

      await user.save();

      await EmailSender.sendEmail({
        email: user.email,
        sub: "OTP Verification 📫",
        mess: emailTemplate.registerEmail(otp),
      });

      const cleanedUser = cleanUser(user);
      return res.status(201).json(cleanedUser);
    } else {
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 60 * 1000);
      await user.save();

      await EmailSender.sendEmail({
        email: user.email,
        sub: "🔢Login OTP🔢",
        mess: emailTemplate.loginEmail(otp),
      });

      const cleanedUser = cleanUser(user);
      return res.status(200).json(cleanedUser);
    }
  } catch (error) {
    console.error("Google token verify error:", error);
    return res.status(400).json({ error: "Invalid Google token" });
  }
};
