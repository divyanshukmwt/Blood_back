let express = require('express');
let router = express.Router();
const { body } = require('express-validator');
const UserAuthController = require('../controllers/UserAuthController');
const isLoggedInMiddleware = require("../Middleware/isLoggedInMiddleware");
const upload = require("../config/multer-config");

router.post('/register', [body('name').isLength({min: 6}).withMessage('Name must be at least 6 characters long'), body('email').isEmail(), body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),], UserAuthController.registerUser );
router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password too short"),
  UserAuthController.loginUser
);
router.post("/picture-upload",isLoggedInMiddleware, upload.single("profilepic"), UserAuthController.uploadProfilePic );
router.get('/profile',isLoggedInMiddleware,UserAuthController.GetProfile);
router.post("/otp-verify", UserAuthController.varifyOtp);
router.post("/resendOtp", UserAuthController.reSendOtp);
router.post("/alldets", isLoggedInMiddleware, UserAuthController.alldets);
router.post("/forgetPass", UserAuthController.forgetPassword);
router.post("/updatePassword", UserAuthController.updatePassword);
router.post("/contactUs", isLoggedInMiddleware, UserAuthController.ContactUs)

module.exports = router;