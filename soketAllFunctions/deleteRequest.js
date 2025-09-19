const bloodRequestModel = require("../Models/Recivent-Model");
const userModel = require("../Models/User-Model");
const { getIO } = require("../utlis/socketInstance");

module.exports.deletePost = async ({ id, customer, userSockets, user }) => {
  const io = getIO();
  try {
    const post = await bloodRequestModel.findById(id);
    if (!post) return io.emit("error", "Post not found");

    if (post.status === "pending") {
      customer.bloodRequest = customer.bloodRequest.filter(
        (reqId) => reqId.toString() !== id
      );
      await customer.save();
    }

    await bloodRequestModel.findByIdAndDelete(id);

    const updatedReceiverData = await userModel
      .findById(user)
      .populate({
        path: "bloodRequest",
        model: "recipient",
        select: "-password -__v",
      })
      .populate({
        path: "Donate",
        model: "recipient",
        select: "-password -__v",
      })
      .lean();

    if (updatedReceiverData) {
      delete updatedReceiverData.password;
    }

    io.emit("update-Post", updatedReceiverData);

    const matchingPendingPosts = await bloodRequestModel
      .find({ status: "pending", bloodType: post.bloodType })
      .populate({
        path: "reciventId",
        model: "user",
        select: "-password -__v",
        populate: {
          path: "bloodRequest",
          model: "recipient",
          select: "-password -__v",
        },
      });

    const filteredPosts = matchingPendingPosts.filter(
      (item) => item.reciventId?._id.toString() !== user.toString()
    );

    filteredPosts.forEach((item) => {
      item.reciventId?.bloodRequest?.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    });


    userSockets.forEach((s, id) => {
      if (s.bloodgroup === post.bloodType && id !== user.toString()) {
        s.emit("new-post", filteredPosts);
      }
    });
  } catch (err) {
    console.error("❌ Error in delete-Post:", err);
    const io = getIO();
    io.to(user.toString()).emit("error", "Failed to delete post");
  }
};
