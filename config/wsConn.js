const { v4: uuid } = require('uuid');
const User = require('../model/User');

const connectWebsocket = (io, sum) => {
  io.on('connection', (socket) => {
    console.log('someone connected ' + socket.id);
    socket.on('disconnect', () => {
      console.log('someone has left ' + socket.id);
    });

    socket.on('send', (data) => {
      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const number = data.number;
      if (number && number >= 1 && number <= 10) {
        sum += parseInt(number);
        console.log(sum);
        io.emit('received', {
          id: uuid(),
          username: data.username,
          sum,
          fullName: data.fullName,
          number: data.number,
          time: `${hours}:${minutes}`,
        });
      } else {
        socket.emit('error', {
          errorId: uuid(),
          message: !number ? 'Hãy nhập 1 số!' : 'Hãy nhập số trong phạm vi từ 1 đến 10!',
        });
      }
      // console.log(sum);
    });
    socket.on('subscribe', (data) => {
      console.log(data.username);
    });
  });
  return sum;
};

module.exports = { connectWebsocket };
