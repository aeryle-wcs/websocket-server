const socket = require('socket.io-client')('http://localhost:8080');
const Logger = require('./utils/Logger');
const logger = new Logger(__filename);

socket.emit('registerAsOnline', 'Henlo');

socket.once('registerAsOnline', function registerAsOnline() {
  logger.debug('Is online');

  socket.emit('sendMessage', { sender: 'Henlo', recipient: 'Aeryle', content: 'Bh' });

  socket.on('sendMessages', (msg) => logger.debug(msg));
});
