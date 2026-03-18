import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// This is a proxy route to handle API calls from the frontend to the backend
// It helps with CORS issues during development and provides a single endpoint

export async function GET(
  request: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  const path = params.proxy.join('/');
  const url = `${API_URL}/api/${path}${request.nextUrl.search}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        ...Object.fromEntries(request.headers),
        host: new URL(API_URL).host,
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from backend' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  const path = params.proxy.join('/');
  const url = `${API_URL}/api/${path}`;
  
  try {
    const body = await request.json();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
        host: new URL(API_URL).host,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to send data to backend' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  const path = params.proxy.join('/');
  const url = `${API_URL}/api/${path}`;
  
  try {
    const body = await request.json();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
        host: new URL(API_URL).host,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to update data on backend' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  const path = params.proxy.join('/');
  const url = `${API_URL}/api/${path}`;
  
  try {
    const body = await request.json();
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
        host: new URL(API_URL).host,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to patch data on backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  const path = params.proxy.join('/');
  const url = `${API_URL}/api/${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...Object.fromEntries(request.headers),
        host: new URL(API_URL).host,
      },
    });
    
    if (response.ok) {
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(data, {
          status: response.status,
        });
      } else {
        return new NextResponse(null, {
          status: response.status,
        });
      }
    } else {
      const error = await response.json();
      return NextResponse.json(error, {
        status: response.status,
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data on backend' },
      { status: 500 }
    );
  }
}