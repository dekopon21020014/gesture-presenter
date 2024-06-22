"use client"

import React from 'react';

const MyPage = () => {
    const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault(); // デフォルトのリンク動作を防ぐ
        try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'GET',
                credentials: 'include', // cookieを送信するために必要
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                // ログアウト成功
                window.location.href = '/login'; // ログインページにリダイレクト
                console.error('Logout successfully');
            } else {
                // ログアウト失敗
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }

    }

    return (
        <div>
            <h1>My Page</h1>
            <p>This is a protected page that only authenticated users can access.</p>
            <a href="/logout" onClick={handleLogout}>logout</a>
        </div>
    );
};

export default MyPage;
