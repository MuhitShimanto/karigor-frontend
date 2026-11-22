import { NextRequest, NextResponse } from 'next/server';
import { SafeUser } from '@/types/auth';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'karigor_token';
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isRegister = body.action === 'register';
    const targetUrl = `${BACKEND_URL}/auth/${isRegister ? 'register' : 'login'}`;

    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: json?.message || 'Authentication failed',
          errorDetails: json?.errorDetails,
        },
        { status: backendRes.status }
      );
    }

    const { token, user } = json.data as { token: string; user: SafeUser };

    const res = NextResponse.json({
      success: true,
      message: json?.message || 'Authenticated successfully',
      data: { user },
    });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_IN_SECONDS,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to reach authentication service',
        errorDetails: err instanceof Error ? err.message : null,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: true, data: { user: null } });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!backendRes.ok) {
      const res = NextResponse.json({ success: true, data: { user: null } });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    const json = await backendRes.json();
    return NextResponse.json({
      success: true,
      data: { user: json.data as SafeUser },
    });
  } catch {
    return NextResponse.json({ success: true, data: { user: null } });
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
    message: 'Signed out successfully',
  });

  res.cookies.delete(COOKIE_NAME);
  return res;
}
