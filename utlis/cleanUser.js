module.exports.cleanUser = (user)=>{
      const {
        password,
        otp,
        otpExpiry,
        emergencycontact,
        gender,
        age,
        googleId,
        createdAt,
        updatedAt,
        __v,
        ...safeUser
      } = user._doc;
      return safeUser;
}