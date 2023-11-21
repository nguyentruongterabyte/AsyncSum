const connectWebsocket = ( io, sum ) => {
  io.on( 'connection', ( socket ) => {
    console.log( 'someone connected ' + socket.id );
    socket.on( 'disconnect', () => {
      console.log( 'somemone has left ' + socket.id);
    } );

    socket.on( 'send', ( counter ) => {
      sum += parseInt( counter );
      io.emit( 'received', sum );
      console.log( sum );
    } );
    socket.on('subscribe', (data) => {
      console.log(data.id, data.fullName);
    })
  } );
  return sum;
}

module.exports = { connectWebsocket };