const User = require( '../model/User' );

const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );

const handleLogin = async ( req, res ) => {
  const { username, password } = req.body;
  if ( !username || !password ) return res.status( 400 ).json( { 'message': 'Vui lòng cung cấp tài khoản và mật khẩu!' } );
  const foundUser = await User.findOne( { username } ).exec();
  if ( !foundUser ) return res.sendStatus( 401 );
  const match = await bcrypt.compare( password, foundUser.password );
  if ( match ) {
    const roles = Object.values( foundUser.roles );
    // create JWTs
    const accessToken = jwt.sign(
      {
        "userInfo":
        {
          "username": foundUser.username,
          "roles": roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' } // 30s
    );
    const refreshToken = jwt.sign(
      { "username": foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log( result );
    res.cookie( 'jwt', refreshToken, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: 'None', secure: true } );
    res.json( { accessToken, firstName: foundUser.firstName, lastName: foundUser.lastName } );
  } else {
    res.sendStatus( 401 );
  }
}

module.exports = {handleLogin}