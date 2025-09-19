const { getIO } = require("../utlis/socketInstance");

module.exports.joinRoom = async ({
  roomId,
  activeRooms,
  userSockets,
  ids,
  socket,
  socketToRoom,
  userLocationMap,
}) => {
  const io = getIO();
  try {
    if (!activeRooms[roomId]) {
      activeRooms[roomId] = [];
    }
    if (activeRooms[roomId].length < 2) {
      activeRooms[roomId].push(ids);
      socketToRoom[ids] = roomId;
      socket.join(roomId);
      const partnerSocketId = activeRooms[roomId].find((id) => id !== ids);
      if (partnerSocketId) {
        const partnerUserId = [...userSockets.entries()].find(
          ([_, s]) => s.id === partnerSocketId
        )?.[0];
        const lastLocation = userLocationMap.get(partnerUserId);
        if (lastLocation) {
          io.emit("receive-location", {
            from: partnerSocketId,
            location: lastLocation,
          });
        }
      }
      if (activeRooms[roomId].length === 2) {
        io.to(roomId).emit("room-ready", { id: roomId });
      }
    } else {
      io.emit("room-full");
    }
  } catch (err) {
    console.error("❌ Error in joinRoom:", err);
    io.to(ids).emit("error", "Failed to join room");
  }
};
