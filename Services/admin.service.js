const adminModel = require("../Models/Admin-Model");

module.exports.createAdmin = async (
    {
        fullname,
        email,
        password
    }
)=>{

    if(!fullname || !email || !password){
        throw new Error("All fields are required!");
    }

    const admin = await adminModel.create({
        fullname,
        email,
        password
    });

    return admin;
}