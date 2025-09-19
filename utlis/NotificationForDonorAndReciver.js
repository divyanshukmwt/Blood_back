const { userFinder } = require("./UserFinder");
const EmailSender = require("./EmailSender");
const emailTemplate = require("../Email_Template/Emails");
const bloodRequestModel = require("../Models/Recivent-Model");
module.exports.NotifyUsers = async ({reciventId, donorId, id})=>{
    try{
        const reciver = await userFinder({
            key: "_id",
            query: reciventId
        })
        const donor = await userFinder({
            key: "_id",
            query: donorId
        })
        const post = await bloodRequestModel.findById(id)
        await EmailSender.sendEmail({
          email: reciver.email,
          sub: "Blood Request Accepted By Donar 🎉",
          mess: emailTemplate.ReciventEmail({
            name: donor.name,
            number: post.DonarNumber,
            type: post.bloodType,
          }),
        });
        await EmailSender.sendEmail({
          email: donor.email,
          sub: "Blood Request Accepted By You ❤️",
          mess: emailTemplate.DonarEmail({
            name: reciver.name,
            number: post.reciverNumber,
            type: post.bloodType,
          }),
        });
    }catch(err){
        console.log(err);
    }
}