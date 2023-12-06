const User = require('../model/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res, next) => {
  const cookies = req.cookies;
  console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Vui lòng cung cấp tài khoản và mật khẩu!' });
  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) return res.sendStatus(401);
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
      {
        userInfo: {
          username: foundUser.username,
          roles: roles,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }, // 30s
    );
    const newRefreshToken = jwt.sign({ username: foundUser.username }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    // Changed to let keyword
    let newRefreshTokenArray = !cookies.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      /*
        Scenario added here:
          1) User logs in but never uses RT does not logout
          2) RT is stolen
          3) If 1 & 2, reuse detection is needed to all RTs when user logs in
      */

      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({ refreshToken }).exec();

      // Detected refresh token reuse!
      if (!foundToken) {
        console.log('attempted refresh token reuse at login!');
        newRefreshTokenArray = [];
      }

      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    }

    // Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await foundUser.save();
    console.log(result);
    res.cookie('jwt', newRefreshToken, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
  next();
};

module.exports = { handleLogin };
