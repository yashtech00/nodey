import type { Request, Response } from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { comparePassword } from '../utils/comparePassword.js';

// Helper: Send token in header
const sendTokenResponse = (user: any, res: Response, statusCode = 200) => {
  const token = generateToken(user._id);

  res
    .status(statusCode)
    .header('Authorization', `Bearer ${token}`)
    .json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  sendTokenResponse(user, res, 201);
});

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await comparePassword(password, user.password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  sendTokenResponse(user, res);
});

// @desc Get current user
// @route GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});