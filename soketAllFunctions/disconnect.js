module.exports.Disconnected = ({
  userSockets,
  socket,
  activeRooms,
  socketToRoom,
}) => {
  userSockets.delete(socket.user?.toString());
  const roomId = socketToRoom[socket.id];
  if (roomId) {
    activeRooms[roomId] = activeRooms[roomId].filter(
      (sid) => sid !== socket.id
    );
    delete socketToRoom[socket.id];
    if (activeRooms[roomId].length > 0) {
      socket.to(roomId).emit("partner-disconnected");
    } else {
      delete activeRooms[roomId];
    }
    console.log(`❌ Socket ${socket.id} left room ${roomId}`);
  }
};