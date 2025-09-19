const { userFinder } = require("../utlis/UserFinder");
const moment = require("moment");
const {getIO} = require("../utlis/socketInstance");

module.exports.acceptOrDenayRequest = async (userId, data) => {
  const io = getIO();
    try {
    const { date, Time } = data;
    const user = await userFinder({
      key: "_id",
      query: userId,
      includePopulate: true,
    });

    const lastRequest = user.bloodRequest[(user.bloodRequest.length - 1)];
    if (user.bloodRequest.length == 0 ) {
      return io.emit("allowingResult", { result: true });
    }

    const lastRequestMoment = moment(
      `${lastRequest.date} ${lastRequest.time}`,
      "DD/MM/YYYY hh:mm A"
    )
    const nextAllowedTime = lastRequestMoment
      .clone()
      .add(user.delayTime, "seconds");
      const newRequestMoment = moment(`${date} ${Time}`, "DD/MM/YYYY hh:mm A");

    if (newRequestMoment < nextAllowedTime) {
        const duration = moment.duration(
          nextAllowedTime.diff(newRequestMoment)
        );
        const hours = duration.hours().toString().padStart(2,"0");
        const minutes = duration.minutes().toString().padStart(2,"0");        
        return io.emit("allowingResult", {
            hours, minutes, result: false
        });
    } else {
        return io.emit("allowingResult", { result: true});
    }
  } catch (err) {
    console.log("❌ Error in acceptOrDenayRequest:", err.message);
  }
};
