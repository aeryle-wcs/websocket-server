const socket = require('socket.io-client')('http://localhost:8080');
const Logger = require('./utils/Logger');
const logger = new Logger(__filename);

const user = {
  username: 'Henlo'
};

socket.emit('registerAsOnline', user.username);

socket.on('registerAsOnline', function registerAsOnline() {
  logger.debug('Is online');

  socket.emit('sendMessage', { sender: user.username, recipient: 'Aeryle', content: 'Bh' });
});
