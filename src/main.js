const server = require('http').createServer();
const Logger = require('./utils/Logger');
const logger = new Logger(__filename);

const allowedOrigins = {origin: 'http://localhost:3000'};
const io = require('socket.io')(server, {cors: allowedOrigins});

const messages = {};
const usersOnline ={};

io.on('connection', function connection(socket) {

  socket.on('registerAsOnline', function registerAsOnline(username){
    logger.debug(`${username} is online with id ${socket.id}`);
    socket.data.username = username;
    const user = {};
    user.id = socket.id;
    usersOnline[username] = user;
    socket.emit('usersOnline', usersOnline);
  });

  socket.on('openConversation', function openConversation(interlocutors){
    console.log(`Une conversation s'ouvre entre ${interlocutors.sender} et ${interlocutors.recipient}`);
    if (messages?.[interlocutors.sender]?.[intermocutors.recipient]){
      socket.emit('history', messages[interlocutors.sender][interlocutors.recipient]);
    }else{
      socket.emit('history', []);
    }
  })
  
  socket.on('sendMessage', function sendMessage({ sender, recipient, content }) {
    logger.debug(`${sender} a écrit ${content} à ${recipient}`);
    
    if (!messages?.[sender]){
      messages[sender] = {};
      messages[sender][recipient] = [];
      messages[sender][recipient].push({from: sender, content: content, date: Date.now()});
    } else if (!messages?.[sender]?.[recipient]){
      messages[sender][recipient] = [];
      messages[sender][recipient].push({from: sender, content: content, date: Date.now()});
    }else {
      logger.debug('La conversation existe');
      messages[sender][recipient].push({from: sender, content: content, date: Date.now()});
    }
    
    if (!messages?.[recipient]){
      messages[recipient] = {};
      messages[recipient][sender] = [];
      messages[recipient][sender].push({from: sender, content: content, date: Date.now()});
    } else if (!messages?.[sender]?.[recipient]){
      messages[sender][recipient] = [];
      messages[sender][recipient].push({from: sender, content: content, date: Date.now()});
    } else {
      logger.debug('La conversation existe');
      messages[recipient][sender].push({from: sender, content: content, date: Date.now()});
    }
    const otherUser = [...io.sockets.sockets.values()].find(socket => socket.data.username === recipient);
    otherUser?.emit('returnMessages', messages[sender][recipient]);
    socket.emit('returnMessages', messages[sender][recipient]);
    console.log(messages[sender][recipient], messages[recipient][sender]);
  });

});

server.listen(8080);