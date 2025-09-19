module.exports.OtpGenerator = () => {
  return Math.trunc(
    Math.random() * +process.env.Multiplier + +process.env.Adder
  );
};
