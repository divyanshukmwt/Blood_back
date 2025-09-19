const bloodRequestModel = require("../Models/Recivent-Model");

module.exports.donateInformation = async (req, res) => {
  try {
    const userId = req.user;
    const allRequest = await bloodRequestModel
      .find({ status: "pending", bloodType: userId.bloodgroup })
      .populate({
        path: "reciventId",
        model: "user",
        select: "-password -__v",
      });

    const filterData = allRequest.filter(
      (item) => item.reciventId._id.toString() !== userId._id.toString()
    );
    res.status(200).json(filterData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};
