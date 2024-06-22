import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers' // サーバコンポーネントでcookieを使いたいときに必要


export async function verifyToken(): Promise<boolean> {
    try {        
        const response = await fetch('http://back:8080/verify-token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies().toString(),
            },
            credentials: 'include', // cookieを受け取るために必要
        });        
  
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {        
        console.error('Error while verifying token:', error);
        return false;
    }
}

export async function authenticateUser(req: NextRequest) {
    const token = req.cookies.get('loginUserIdKey');
    if (!token || !(await verifyToken())) { // tokenのstring
        const redirectUrl = new URL('/signup', req.url);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}
