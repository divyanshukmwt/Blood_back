const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const { initSocket } = require("./utlis/Socket.io");


dotenv.config();

const app = require("./app");
const server = http.createServer(app);

initSocket(server);


const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
