const mongoose = require("mongoose");

const ticketPost = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
  },
  ticketTitle: {
    type: String,
    required: true,
  },
  ticketDescription: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: null,
  },
  time: {
    type: String,
    default: null,
  },
});

const TicketPostModel = mongoose.model("ticketPost", ticketPost);

module.exports = TicketPostModel;