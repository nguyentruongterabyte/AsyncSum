const User = require( '../model/User' );

const bcrypt = require('bcrypt');

const handleNewUser = async ( req, res ) => {
  const {username, password, firstName, lastName} = req.body;
  if ( !username || !password || !firstName || !lastName ) return res.status( 400 ).json( { 'message': 'Vui lòng cung cấp đầy đủ thông tin!'} )
  const duplicate = await User.findOne({username}).exec();
  if ( duplicate ) return res.sendStatus( 409 ); // conflict
  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash( password, 10 );
    // create and store the new user
    const result = await User.create( {
      username,
      password: hashedPwd,
      firstName,
      lastName,
    } )
    res.status( 201 ).json( { 'success': `Thêm thành công tài khoản ${ username }!` } );
   } catch ( err ) {
    res.status( 500 ).json( { 'message': err.message } );
  }
}

module.exports = { handleNewUser };