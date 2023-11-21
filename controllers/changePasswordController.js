const User = require( '../model/User' );

const bcrypt = require( 'bcrypt' );

const handleChangePassword = async ( req, res ) => { 
  const { username, oldPassword, newPassword } = req.body;
  if ( !username || !oldPassword || !newPassword ) return res.status( 400 ).json( { 'message': 'Vui lòng nhập đầy đủ thông tin!' } );
  const foundUser = await User.findOne( { username } ).exec();
  if ( !foundUser ) return res.sendStatus( 401 );
  const match = await bcrypt.compare( oldPassword, foundUser.password );
  if ( match ) {
    try {
      const hashedPwd = await bcrypt.hash( newPassword, 10 );
      foundUser.password = hashedPwd;
      const result = await foundUser.save();
      console.log( result );
      res.status( 201 ).json( {'success': `Đổi mật khẩu thành công tài khoản ${ username }!` } );
    } catch ( err ) {
      res.status( 500 ).json({'message': err.message});
    }
  } else {
    res.sendStatus( 401 );
  }
}

module.exports = { handleChangePassword };