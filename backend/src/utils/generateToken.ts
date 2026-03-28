import jwt, { type SignOptions } from 'jsonwebtoken';

export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRE as SignOptions['expiresIn'] || '30d',
  };

  return jwt.sign({ id }, secret, options);
};