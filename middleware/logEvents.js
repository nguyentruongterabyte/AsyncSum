const { format } = require( 'date-fns' );
const { v4: uuid } = require( 'uuid' );
const fs = require( 'fs' );
const fsPromises = require( 'fs' ).promises;

const logEvents = async ( message, logName ) => {
  const currentDate = new Date();

  const dateTime = `${ format( currentDate, 'ddMMyyyy hh:mm:ss' ) }`;
  const logItem = `${ dateTime }\t${ uuid() }\t${ message }`;
  console.log( logItem );
  try {
    if ( !fs.existsSync( path.join( __dirname, '..', 'logs' ) ) ) {
      await fsPromises.mkdir( path.join( __dirname, '..', 'logs' ) );
    }
    await fsPromises.appendFile( path.join( __dirname, '..', 'logs', logName ), `${ logItem }\n` );
   } catch ( err ) {
    
  }
}

const logger = ( req, res, next ) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
  console.log( `${ req.method }\t${ req.path }` );
  next();
}

module.exports = { logger, logEvents };