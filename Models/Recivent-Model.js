const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  reciventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  donarId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  bloodType: {
    type: String,
    required: true,
    default: null,
  },
  status: {
    type: String,
    default: "pending",
  },
  reciverNumber:{
    type: Number,
    default: null
  },
  DonarNumber: {
    type: Number,
    default:null
  },
  date: {
    type: String,
    default: null,
  },
  time: {
    type: String,
    default: null,
  },
  urgency: {
    type: String,
    default: null,
  }
});

const bloodRequestModel = mongoose.model("recipient", recipientSchema);

module.exports = bloodRequestModel;