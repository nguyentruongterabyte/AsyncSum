
require( 'dotenv' ).config();
const express = require( 'express' )
const app = express();
const path = require( 'path' );
const cors = require( 'cors' );
const cookieParser = require( 'cookie-parser' );
const mongoose = require( 'mongoose' );
const { Server } = require( 'socket.io' );

const { logger } = require( './middleware/logEvents' );
const errorHandler = require('./middleware/errorHandler' );
const corsOptions = require( './config/corOptions' );
const credentials = require( './middleware/credentials' );
const connectDB = require( './config/dbConn' );
const { connectWebsocket } = require( './config/wsConn' );
const verifyJWT = require( './middleware/verifyJWT' );

const PORT = process.env.PORT || 8080;
const WS_PORT = process.env.WS_PORT || 3500;
let sum = 0;
// Connect to MongoDB
connectDB();
//  custom middleware logger
app.use( logger );

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use( cors( corsOptions ) );

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type': 'application/x-www-form-urlencoded'
app.use( express.urlencoded( { extended: false } ) );

// built-in middleware for json
app.use( express.json() );

// middleware for cookies
app.use( cookieParser() );

// routes
app.use( '/auth', require( './routes/auth' ) );
app.use( '/register', require( './routes/register' ) );
app.use( '/change-password', require( './routes/changePassword' ) );

app.use( errorHandler );
// Websocket server
const io = new Server( {
  cors: {
    origin: corsOptions.origin,
    allowedHeaders: [],
  },
});

sum = connectWebsocket( io, sum );

mongoose.connection.once( 'open', () => {
  console.log( 'Connected to MongoDB' );
  app.listen(PORT, () => console.log( `Server is running on port ${PORT}` ) );
  io.listen( WS_PORT );
  console.log(`Websocket server is listening on port ${WS_PORT}`)
})