const adminModel = require("../Models/Admin-Model");
const adminService = require("../Services/admin.service");
const {validationResult} = require("express-validator");
const userModel = require("../Models/User-Model");
const bloodRequestModel = require("../Models/Recivent-Model");
const TicketPostModel = require("../Models/ticket-Raiser");
const moment = require("moment");
const {sendBackMail} = require("../utlis/EmailSender");

module.exports.adminRegister = async( req, res ) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const adminNumber = await adminModel.find();
        if(adminNumber.length >= 1) return res.status(406).send('Admin already exists');
        const {fullname, email, password} = req.body;
        const hashedPassword = await adminModel.hashPassword(password);
        const admin = await adminService.createAdmin({
            fullname,
            email,
            password: hashedPassword
        });
        const token = admin.GenerateToken();
        delete admin._doc.password;
        res.status(201).send({admin, token});
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server error');
    }
};

module.exports.adminLogin = async( req, res ) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const {email, password} = req.body;
        const admin = await adminModel.findOne({email});
        if(!admin) return res.status(401).json({ error: "Invalid email or password" });
        const isMatch = await admin.ComparePassword(password);
        if(!isMatch) return res.status(401).json({ error: "Invalid email or password" });
        const token = await admin.GenerateToken();
        delete admin._doc.GSTN;
        delete admin._doc.active;
        delete admin._doc.address;
        delete admin._doc.age;
        delete admin._doc.createdAt;
        delete admin._doc.gender;
        delete admin._doc.password;
        delete admin._doc.phone;
        delete admin._doc.__v;
        delete admin._doc._id;
        delete admin._doc.otpCode;
        delete admin._doc.otpExpiry;
        return res.status(200).json({admin, token})
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server error');
    }   
};

module.exports.adminProfile = async( req, res ) => {
   return res.status(200).json({ user: req.admin });
};

module.exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }
    const Admin = req.admin;
    const Useradmin = await adminModel.findOne({email: Admin.email});
    if (!Useradmin) return res.status(404).json({ message: "User not found" });

    Useradmin.profilepic = req.file.buffer.toString("base64");
    Useradmin.pictype = req.file.mimetype;
    await Useradmin.save();
    delete Useradmin._doc.GSTN;
    delete Useradmin._doc.active;
    delete Useradmin._doc.address;
    delete Useradmin._doc.age;
    delete Useradmin._doc.createdAt;
    delete Useradmin._doc.gender;
    delete Useradmin._doc.password;
    delete Useradmin._doc.phone;
    delete Useradmin._doc.__v;
    delete Useradmin._doc._id;
    delete Useradmin._doc.otpCode;
    delete Useradmin._doc.otpExpiry;
    return res.status(200).json({ Useradmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.AllUserAndAllRequestCount = async (req,res)=>{
  try{
    const Admin = req.admin;
    const validAdmin = await adminModel.findOne({email: Admin.email})

    if(!validAdmin) return res.status(401).json("Unauthorized")
      const users = await userModel.find();
      const UserCount = users.length;
      const request = await bloodRequestModel.find();
      const requestCount = request.length;
      const Tickets = await TicketPostModel.find();
      const ticketCounst = Tickets.length;
      res.status(200).json({UserCount,requestCount, ticketCounst});
  }catch(err){
    console.log(err);
    res.status(500).json("Unable to find!");
  }
}

module.exports.seeAllUser = async (req, res) => {
  try{
    const Admin = req.admin;
    const verifyAdmin = await adminModel.findOne({email: Admin.email});
    if(!verifyAdmin) return res.status(401).json(" ⚠️ Unauthorized Admin! ")
    const allUser = await userModel.find();
    const filterData = allUser.map((item) => ({
      _id: item._id,
      name: item.name,
      email: item.email,
      block: item.block,
      profilepic: item.profilepic,
      pictype: item.pictype,
    }));
    return res.status(200).json(filterData);
  }catch(err){
    console.log(err);
    res.status(500).json(" ❌ Can't gate the Data! ")
  }
} ;

module.exports.ticketSender = async (req,res) => {
  try{
    const allTicket = await TicketPostModel.find().sort({date: -1}).lean();
    const ticketData = allTicket.map((ticket) => {
      return {
        ticketTitle: ticket.ticketTitle,
        ticketDescription: ticket.ticketDescription,
        date: ticket.date,
        time: ticket.time,
      };
    });
    return res.status(200).json(ticketData);
  } catch(err){
    console.error(err);
  }
};

module.exports.ticketMaker = async (req, res) => {
  try{
    const admin = req.admin;
    const validAdmin = await adminModel.findOne({email: admin.email})
    if(!validAdmin) return res.status(401).json("Unauthorized");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("LT");
    const { ticketTitle, description } = req.body;
     const ticket = await TicketPostModel.create({
       userId: validAdmin._id,
       ticketTitle: ticketTitle,
       ticketDescription: description,
       date,
       time,
     });
     await ticket.save();
     await sendBackMail({
       email: admin.email,
       sub: ticketTitle,
       mess: `Ticket Message: <br> ${description}`,
     });
  }catch(err){
    console.log(err);
  }
};