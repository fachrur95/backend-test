import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, userService, tokenService } from '../services';
import exclude from '../utils/exclude';
import { User } from '@prisma/client';
import { CookieOptions } from 'express';
import config from '../config/config';

const cookieOptions = (expires: Date): CookieOptions => {
  return {
    httpOnly: true,
    signed: true,
    expires,
    secure: config.env === "production" //--> SET TO TRUE ON PRODUCTION
  }
}

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await userService.createUser(name, email, password);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie(
    'jwt', tokens.access.token, cookieOptions(tokens.access.expires)
  ).status(httpStatus.CREATED).send({ user: userWithoutPassword, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.cookie(
    'jwt', tokens.access.token, cookieOptions(tokens.access.expires)
  ).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  if (!req.signedCookies['jwt']) {
    return res.status(httpStatus.UNAUTHORIZED).send({
      error: 'Invalid jwt'
    })
  }
  await authService.logout(req.body.refreshToken);
  res
    .clearCookie('jwt')
    .status(httpStatus.OK)
    .send({ message: 'You have logged out' });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.cookie(
    'jwt', tokens.access.token, cookieOptions(tokens.access.expires)
  ).send({ ...tokens });
});

const userInfo = catchAsync(async (req, res) => {
  const user = req.user as User;
  res.send(user);
})

export default {
  register,
  login,
  logout,
  refreshTokens,
  userInfo,
};
