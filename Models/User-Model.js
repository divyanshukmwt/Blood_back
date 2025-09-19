const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
      select: false,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    profilepic: {
      type: String,
      default: null,
    },
    pictype: {
      type: String,
      default: "image/png",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    emergencycontact: {
      type: Number,
      default: null,
    },
    bloodgroup: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
      select: false,
    },
    gender: {
      type: String,
      default: null,
      select: false,
    },
    weight: {
      type: Number,
      default: null,
      select: false,
    },
    height: {
      type: Number,
      default: null,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    bloodRequest: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recipient",
      },
    ],
    Donate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recipient",
      },
    ],
    block: {
      type: Boolean,
      default: false,
    },
    number: {
      type: Number,
      default: null,
    },
    delayTime: {
      type: Number,
      default: null,
    },
    forgeterOtp: {
      type: Number,
      default: null,
    },
    forgeterOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// JWT Generation
userSchema.methods.GenerateToken = function () {
  return jwt.sign({ email: this.email }, process.env.JWT_KEY, {
    expiresIn: process.env.EXPIRE_DATE,
  });
};

// Password compare
userSchema.methods.ComparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Static method for hashing
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, +process.env.SALT_NUMBER);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;