const {userFinder} = require("../utlis/UserFinder");
const {getIO} = require("../utlis/socketInstance");
module.exports.otpValidation = async data => {
    const io = getIO();
    try{
        const {email, otp} = data;
        const user = await userFinder({key: "email", query: email});
        if (
          user.forgeterOtp == otp &&
          user.forgeterOtpExpiry > new Date(Date.now())
        ) {
          await user.save();
          io.emit("otp-result", { result: true });
        } else {
          io.emit("otp-result", { result: false });
        }
    }catch(err){
        console.log(err);
    }
}