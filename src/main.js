const server = require("http").createServer();
const Logger = require("./utils/Logger");
const io = require("socket.io")(server, {
  cors: { origin: "http://localhost:3000" },
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
      console.log("add recipient");
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
});

//   socket.on('sendMessage', async function sendMessage({ sender, recipient, content }) {
//     if (!messages?.[sender]?.[recipient]) {
//       createMessage(recipient, sender);
//     } else {
//       logger.debug('La conversation existe');
//
//       messages?.[recipient]?.[sender].push({ from: sender, content, date });
//     }
//
//     socket.emit('returnMessages', messages[sender][recipient]);
//
//     console.log([ ...io.sockets.sockets ].length);
//
//     const otherUser = [ ...(io.sockets.sockets) ].find(socket => socket.data.username === recipient);
//     otherUser?.emit('returnMessages', messages[sender][recipient]);
//
//     console.log(messages[sender][recipient], messages[recipient][sender]);
//   });

server.listen(8080);
