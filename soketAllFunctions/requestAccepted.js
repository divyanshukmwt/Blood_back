const bloodRequestModel = require("../Models/Recivent-Model");
const userModel = require("../Models/User-Model");
const { userFinder } = require("../utlis/UserFinder");
const {NotifyUsers} = require("../utlis/NotificationForDonorAndReciver");
module.exports.requestAccepted = async ({ data, userSockets }) => {
  try {
    const { postId, donarId, donarNumber } = data;

    const post = await bloodRequestModel.findById(postId);
    if (!post) {
      console.log(`❌ Post with ID ${postId} not found.`);
      return;
    }

    post.status = "Accepted";
    post.donarId = donarId;
    post.DonarNumber = donarNumber;
    await post.save();

    const donor = await userFinder({
      key: "_id",
      query: donarId,
    });

    donor.Donate.push(postId);
    await donor.save();

    // Fetch all pending posts with matching blood type
    const allPendingPosts = await bloodRequestModel
      .find({ status: "pending", bloodType: donor.bloodgroup })
      .populate({
        path: "reciventId",
        model: "user",
        select: "-password -__v",
      });

    const filteredPosts = allPendingPosts.filter(
      (item) => item.reciventId?._id.toString() !== donarId.toString()
    );

    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const donorSocket = userSockets.get(donarId.toString());
    if (donorSocket) {
      console.log(`📡 Emitting "newUpdate" event to donor ${donarId}`);
      donorSocket.emit("newUpdate", filteredPosts);
    } else {
      console.log(`❌ Donor socket not found for userId: ${donarId}`);
    }

    // Send updates to the receiver
    const receiverUser = await userModel
      .findById(post.reciventId.toString())
      .populate({
        path: "bloodRequest",
        model: "recipient",
        select: "-password -__v",
      });

    const receiverSocket = userSockets.get(receiverUser._id.toString());
    if (receiverSocket) {
      receiverSocket.emit("reciver-update", receiverUser);
    } else {
      console.log(
        `❌ Receiver socket not found for userId: ${receiverUser._id}`
      );
    }
    NotifyUsers({reciventId: post.reciventId, donorId: post.donarId , id: postId})
  } catch (err) {
    console.error("❌ Error in requestAccepted:", err.message);
  }
};

