const {getIO} = require("../utlis/socketInstance");
module.exports.requestPartnerLocation = async ()=>{
    const io = getIO();
    try{
        const partnerSocketId = activeRooms[id]?.find((sid) => sid !== socket.id);
        if (partnerSocketId) {
        io.to(partnerSocketId).emit("request-partner-location");
        }
    }catch(err){

    }
}