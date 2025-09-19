module.exports.shareLocation = async ({
    id,
    location,
    socket,
    userSockets,
    userLocationMap,
    activeRooms,
    partnerSocketId
    }) => {
    try {
        userLocationMap.set(socket.user.toString(), location);
        socket.to(id).emit("receive-location", {
            from: socket.id,
            location,
        });
        partnerSocketId = activeRooms[id]?.find((sid) => sid !== socket.id);
        if (partnerSocketId) {
            const partnerUserId = [...userSockets.entries()].find(
                ([_, s]) => s.id === partnerSocketId
            )?.[0];
            const partnerLocation = userLocationMap.get(partnerUserId);
            if (partnerLocation) {
                socket.emit("receive-location", {
                    from: partnerSocketId,
                    location: partnerLocation,
                });
            }
        }
    }catch (err){
        console.log("❌ Error in shareLocation:", err);
        socket.emit("error", "Failed to share location");
    }
};