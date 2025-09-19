const adminModel = require("../Models/Admin-Model");
const userModel = require("../Models/User-Model");
const { getIO } = require("../utlis/socketInstance");
const timeMap = {
  "60s": 60,
  "2min": 120,
  "5min": 300,
  "10min": 600,
  "30min": 1800,
  "1hr":3600
};

module.exports.timerChange = async ({time,socket}) => {
  const delayTimer = timeMap[time];
  const io = getIO();
  if (!delayTimer) {
    console.log("❌ Invalid time value:", time);
    return;
  }

  try {
    const admin = await adminModel.findOne();
    admin.delayTimer = delayTimer;
    await admin.save();
    socket.emit("ChangeTime", admin);
    await userModel.updateMany({}, { $set: { delayTime : delayTimer} });
    const allUser = await userModel.find();
    allUser.map(user=>{
      io.emit("delayTime", delayTimer);
    })
  } catch (error) {
    console.error("Error updating delayTimer:", error);
  }
};
