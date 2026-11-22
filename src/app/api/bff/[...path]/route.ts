import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'karigor_token';

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await context.params;
  const pathSegments = resolvedParams.path || [];
  const targetPath = '/' + pathSegments.join('/');
  const query = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${targetPath}${query}`;

  const token = req.cookies.get(COOKIE_NAME)?.value;

  const headers = new Headers();
  headers.set(
    'Content-Type',
    req.headers.get('content-type') || 'application/json'
  );
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = req.method;
  let body: BodyInit | undefined = undefined;

  if (!['GET', 'HEAD'].includes(method)) {
    try {
      const text = await req.text();
      if (text) {
        body = text;
      }
    } catch {
      // body empty or stream error
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        'Content-Type':
          backendRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not connect to backend service',
        errorDetails: error instanceof Error ? error.message : null,
      },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, context);
}
