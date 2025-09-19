const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  adminRegister,
  adminLogin,
  adminProfile,
  uploadProfilePic,
  AllUserAndAllRequestCount,
  seeAllUser,
  ticketSender,
  ticketMaker,
} = require("../controllers/AdminAuthController");
const adminIsLoggedInMiddleware = require('../Middleware/adminIsLoggedInMiddleware');
const upload = require("../config/multer-config");

router.post('/register', [body('fullname').isLength({min: 5}).withMessage('Name must be at least 5 characters long'), body('email').isEmail().withMessage('Email is not valid!'), body('password').isLength({min: 8, max: 25}).withMessage('Password must be at least 8 characters long')], adminRegister );
router.post('/login', [body('email').isEmail().withMessage('Email is not valid!'), body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),], adminLogin );
router.get('/admin-profile',adminIsLoggedInMiddleware, adminProfile);
router.post("/adminPic",adminIsLoggedInMiddleware, upload.single("profilepic"), uploadProfilePic);
router.post("/allcounts", adminIsLoggedInMiddleware, AllUserAndAllRequestCount);
router.post("/seeAllUser",adminIsLoggedInMiddleware,seeAllUser)
router.post("/ticket", adminIsLoggedInMiddleware, ticketSender)
router.post("/ticket-maker", adminIsLoggedInMiddleware, ticketMaker)
module.exports = router;