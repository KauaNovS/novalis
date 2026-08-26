import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  return NextResponse.json({
    DATABASE_URL_set: dbUrl.length > 0,
    DATABASE_URL_length: dbUrl.length,
    DATABASE_URL_starts_with: dbUrl.slice(0, 15),
    DIRECT_URL_set: directUrl.length > 0,
    DIRECT_URL_length: directUrl.length,
    DIRECT_URL_starts_with: directUrl.slice(0, 15),
    JWT_SECRET_set: (process.env.JWT_SECRET || '').length > 0,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}
