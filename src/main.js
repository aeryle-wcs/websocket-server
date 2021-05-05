const server = require("http").createServer();
const Logger = require("./utils/Logger");
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

const { onlineUsers, messages } = require("./utils/CONSTANTS");
const logger = new Logger();

io.on("connection", function connection(socket) {
  console.log(
    [...io.sockets.sockets].length,
    [...io.sockets.sockets].filter((s) => s?.data?.username)
  );

  // When the user connects, add him to the list of online users
  socket.on("user:connect", function userConnect(username) {
    logger.info(username, "came online");

    socket.data = { username };
    onlineUsers.add(socket.data.username);
    io.emit("user:connect", [...onlineUsers]);
  });

  socket.on("disconnect", function disconnect() {
    onlineUsers.delete(socket.data.username);
    io.emit("user:disconnect", [...onlineUsers]);
  });

  socket.on("user:disconnect", function userDisconnect() {
    logger.info(socket.data.username, "went offline");

    onlineUsers.delete(socket.data.username);
    io.emit("user:disconnect", [...onlineUsers]);
  });

  socket.on("chat:open", function chatOpen(recipient) {
    socket.emit(
      "chat:open",
      messages?.[socket.data.username]?.[recipient] || []
    );
  });

  socket.on("chat:delete", function chatDelete(recipient) {
    messages[socket.data.username][recipient] = [];

    socket.emit("chat:delete");
  });

  socket.on("message:create", function messageCreate(recipient, content) {
    const date = Date.now();

    const createMessage = (sender, recipient) => {
      messages[sender] = {
        [recipient]: [
          {
            from: socket.data.username,
            content,
            date,
          },
        ],
      };
    };

    if (!messages?.[socket.data.username]?.[recipient]) {
      createMessage(socket.data.username, recipient);
    } else {
      messages[socket.data.username][recipient].push({
        from: socket.data.username,
        content,
        date,
      });
    }

    if (!messages?.[recipient]?.[socket.data.username]) {
      createMessage(recipient, socket.data.username);
    } else {
      messages[recipient][socket.data.username].push({
        from: socket.data.username,
        content,
        date,
      });
    }

    const recipientSocket = [...io.sockets.sockets].find(
      ([, s]) => s.data.username === recipient
    );

    socket.emit("message:create", messages[socket.data.username][recipient]);
    if (recipientSocket) {
      recipientSocket[1].emit("message:new");
      recipientSocket[1].emit(
        "message:create",
        messages[recipient][socket.data.username]
      );
    }
  });

  socket.on("message:delete", function messageDelete(recipient, index) {
    const removedMessage = messages[socket.data.username][recipient].splice(
      index,
      1
    )[0];

    const recipientIndex = messages[recipient][socket.data.username].findIndex(
      (msg) => msg.date === removedMessage.date
    );

    if (recipientIndex > -1) {
      messages[recipient][socket.data.username].splice(recipientIndex, 1);
    }

    const recipientSocket = [...io.sockets.sockets].find(
      ([, s]) => s.data.username === recipient
    );

    socket.emit("message:delete", messages[socket.data.username][recipient]);
    if (recipientSocket) {
      recipientSocket[1].emit(
        "message:delete",
        messages[recipient][socket.data.username]
      );
    }
  });
});

server.listen(8080);
