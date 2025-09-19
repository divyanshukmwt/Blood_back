const bloodRequestModel = require("../Models/Recivent-Model");

module.exports.createBloodRequest = async ({
  reciventId,
  bloodType,
  number,
  date,
  time,
  urgency,
}) => {
  try {
    if (!bloodType) throw new Error("The field are required!");
    const newBloodRequest = await bloodRequestModel.create({
      reciventId,
      bloodType,
      reciverNumber: number,
      date,
      time,
      urgency,
    });
    return newBloodRequest;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating blood request");
  }
};