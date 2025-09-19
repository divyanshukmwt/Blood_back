const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minlength: [5, "Email must be at least 5 characters long"],
  },
  password: {
    type: String,
    required: true,
    minlength: [5, "Password must be at least 5 characters long"],
    selected: false,
  },
  profilepic: {
    type: String,
    default: null,
  },
  pictype: {
    type: String,
    default: "image/png",
  },
  GSTN: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  phone: {
    type: Number,
    unique: true,
    default: null,
    min: [1000000000, "Phone number is not valid!"],
    max: [9999999999, "Phone number is not valid!"],
  },
  gender: {
    type: String,
    default: null,
    selected: false,
  },
  age: {
    type: Number,
    default: null,
    selected: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  serverOnOff: {
    type: Boolean,
    default: false,
  },
  delayTimer:{
    type:Number,
    default:60
  }
});

adminSchema.methods.GenerateToken = function () {
    const token = jwt.sign(
        { 
            email: this.email 
        },
        process.env.JWT_KEY, {
            expiresIn: process.env.ADMIN_TOKEN_EXPIRE,
        });
    return token;
};

adminSchema.methods.ComparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, Number(process.env.SALT_NUMBER));
};

const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;