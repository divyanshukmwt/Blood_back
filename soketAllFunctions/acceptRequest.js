const { createBloodRequest } = require("../Services/blood.service");
const { getIO } = require("../utlis/socketInstance");
const userModel = require("../Models/User-Model");
const bloodRequestModel = require("../Models/Recivent-Model");

module.exports.acceptRequest = async ({ data, userSockets, userId }) => {
  const io = getIO();
  try {
    const { bloodGroup, number, date, Time, urgency } = data;
    const bloodReq = await createBloodRequest({
      reciventId: userId,
      bloodType: bloodGroup,
      number,
      date,
      time: Time,
      urgency,
    });
    if (!bloodReq) {
      console.log("❌ Blood request not created");
      return io.emit("blood-request-error", {
        message: "Invalid Request",
      });
    }
    
    await bloodReq.save();
    const customer = await userModel.findById(userId);
    customer.bloodRequest.push(bloodReq._id);
    await customer.save();

    const allPost = await userModel
      .findById(userId)
      .populate({
        path: "bloodRequest",
        model: "recipient",
        select: "-password -__v",
      })
      .lean();

    allPost.bloodRequest?.sort((a, b) => new Date(b.date) - new Date(a.date));

    const DonatePost = await bloodRequestModel
      .find({ bloodType: bloodGroup, status: "pending" })
      .populate({
        path: "reciventId",
        model: "user",
        select: "-password -__v",
        populate: {
          path: "bloodRequest",
          model: "recipient",
          select: "-password -__v",
        },
      })
      .sort({ date: -1 })
      .lean();

    DonatePost.forEach((item) => {
      item.reciventId?.bloodRequest?.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    });
    const filterData = DonatePost.filter(
      (item) => item.reciventId._id.toString() === userId.toString()
    );
    userSockets.forEach((s, id) => {
      if (id !== userId.toString() && s.bloodgroup === bloodGroup) {
        s.emit("new-post", filterData);
      }
    });

    const targetSocket = userSockets.get(userId.toString());
    if (targetSocket) {
      targetSocket.emit("allPost", allPost);
    } else {
      console.log(`⚠️ Socket not found for userId: ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error in blood-request:", error.message);
    io.emit("blood-request-error", {
      message: "Internal Server Error",
    });
  }
};
