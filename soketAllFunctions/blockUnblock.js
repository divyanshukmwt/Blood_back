const {userFinder} = require("../utlis/UserFinder")
const userModel = require("../Models/User-Model");
const {getIO} = require("../utlis/socketInstance");
const {cleanUser} = require("../utlis/cleanUser")
module.exports.blockUnblockUser = async (data) => {
  const user = await userFinder({ 
    key: "_id",
    query: data, 
    includePopulate: true });
    user.block = !user.block;
    await user.save();
    const cleanedUser = cleanUser(user);
    const allUser = await userModel.find();
    const filterData = allUser.map((item) => ({
    _id: item._id,
    name: item.name,
    email: item.email,
    block: item.block,
    profilepic: item.profilepic,
    pictype: item.pictype,
  }));
  const io = getIO();
  io.emit("updateBlock-center", cleanedUser);
  io.emit("Update-blockUser", filterData);
};
