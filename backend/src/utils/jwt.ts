import jwt, { SignOptions } from "jsonwebtoken";

export function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "1h" } as SignOptions
  );
}

export function generateRefreshToken(userId: string, tokenId: string) {
  const secret = process.env.JWT_REFRESH_SECRET as string;

  return jwt.sign(
    {
      userId,
      tokenId,
    } as object,
    secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    } as SignOptions
  );
}
