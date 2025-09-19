// utils/Socket.io.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const {userFinder} = require("../utlis/UserFinder");
const userModel = require("../Models/User-Model");

const {acceptRequest} = require("../soketAllFunctions/acceptRequest");
const { deletePost } = require("../soketAllFunctions/deleteRequest");
const {requestAccepted} = require("../soketAllFunctions/requestAccepted");
const {joinRoom} = require("../soketAllFunctions/joinRoom");
const {shareLocation} = require("../soketAllFunctions/shareLocation");
const {requestPartnerLocation} = require("../soketAllFunctions/requestPartnerLocation");
const {Disconnected} = require("../soketAllFunctions/disconnect");
const {blockUnblockUser} = require("../soketAllFunctions/blockUnblock");
const {serverSetting} = require("../soketAllFunctions/serverSettings");
const {timerChange} = require("../soketAllFunctions/timerChange");

const { setIO } = require("./socketInstance");
const { acceptOrDenayRequest } = require("../soketAllFunctions/acceptOrDenayRequest");
const { otpValidation } = require("../soketAllFunctions/OtpValidation");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://bright-naiad-c80c24.netlify.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setIO(io); // 👈 store socket instance globally

  const userSockets = new Map();
  const activeRooms = {};
  const socketToRoom = {};
  const userLocationMap = new Map();
  const partnerSocketId = null;

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.userToken ||
        socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_KEY);
      if (!decoded) return next(new Error("Authentication error"));

      const user = await userFinder({ key: "email", query: decoded.email });
      socket.user = user._id;
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user;

    const customer = await userFinder({ key: "_id", query: socket.user });

    userModel.findById(userId).then((user) => {
      if (user) {
        socket.bloodgroup = user.bloodgroup;
        userSockets.set(userId.toString(), socket);
      }
    });

    socket.on("seeAllowRequest", async (data)=>{
      try{
        await acceptOrDenayRequest(userId, data);
      } catch(err){
        console.error("Error in blood-request handler:", err);
      }
    });

    socket.on("blood-request", async (data) => {
      try {
        await acceptRequest({data: data, userSockets, userId});
      } catch (err) {
        console.error("Error in blood-request handler:", err);
      }
    });

    socket.on("delete-Post", async (id) => {
      try {
        await deletePost({ id, customer, userSockets, user: socket.user });
      } catch (err) {
        console.error("Error in delete-Post handler:", err);
      }
    });

    socket.on("accepted-request", async (data) => {
      try {
        await requestAccepted({ data, userSockets, socket });
      } catch (err) {
        console.error("Error in accepted-request handler:", err);
      }
    });

    socket.on("join-room", async (data) => {
      try {
        await joinRoom({
          roomId: data,
          activeRooms,
          userSockets,
          ids: socket.id,
          socket,
          socketToRoom,
          userLocationMap,
        });
      } catch (err) {
        console.error("Error in join-room handler:", err);
      }
    });

    socket.on("share-location", async (data) => {
      try {
        await shareLocation({
          id: data.id,
          location: data.location,
          socket,
          userSockets,
          userLocationMap,
          activeRooms,
          partnerSocketId,
        });
      } catch (err) {
        console.error("Error in share-location handler:", err);
      }
    });

    socket.on("request-partner-location", async (data) => {
      try {
        await requestPartnerLocation({
          id: data.id,
          activeRooms,
          partnerSocketId,
        });
      } catch (err) {
        console.error("Error in partner-location handler:", err);
      }
    });
    
    socket.on("Timer-Change", async (time) => {
      try {
        console.log(time)
        await timerChange({time, socket});
      } catch (err) {
        console.error("Error in timer-change handler:", err);
      }
    });
    
    socket.on("blockUnblock-user", async (data) => {
      try {
        await blockUnblockUser(data);
      } catch (err) {
        console.error("Error in blockUnblock-user handler:", err);
      }
    });
    
    socket.on("server-req", async (email) => {
      try {
        await serverSetting(email);
      } catch (err) {
        console.error("Error in server-req handler:", err);
      }
    });

    socket.on("otp-sender", async (data)=>{
      try{
        await otpValidation(data);
      } catch(err){
        console.log(err);
      }
    });

    socket.on("disconnect", () => {
      try {
        Disconnected({
          userSockets,
          socket,
          activeRooms,
          socketToRoom,
        });
      } catch (err) {
        console.error("Error in disconnect handler:", err);
      }
    });
  });

  return io;
};

module.exports = { initSocket };
