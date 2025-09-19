const adminModel = require("../Models/Admin-Model");
const {getIO} = require("../utlis/socketInstance");
module.exports.serverSetting = async (email) => {
  try {
    const admin = await adminModel.findOne({ email });
    if (!admin) return socket.emit("error", "Admin not found");
    admin.serverOnOff = !admin.serverOnOff;
    await admin.save();
    delete admin._doc.password;
    const io = getIO();
    io.emit("server-res", admin);
  } catch (error) {
    console.error("Server toggle error:", error);
    socket.emit("error", "Internal server error while toggling server state");
  }
};