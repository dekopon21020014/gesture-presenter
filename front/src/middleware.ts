import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from './lib/auth';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;

    if (url.pathname.startsWith('/mypage')) {
        return authenticateUser(req);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/mypage/:path*'],
};
