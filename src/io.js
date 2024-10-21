const { Server } = require("socket.io");
const IO = (server) => {
  const io = new Server(server, {
    transport: ["websocket"],
    cors: { origin: "*" },
  });

  //when connection is made , we will have access to a (callback) socket object
  io.on("connection", async (socket) => {
    console.log(socket.id);
    socket.on("message", (message) => {
      console.log("Connecteeed");
      socket.send(`Roger that! ${message}`);
    });

    socket.on("disconnect", () => {
      socket.send("User logged out ");
    });
  });
  return io;
};

module.exports = { IO };
