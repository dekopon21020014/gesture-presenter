'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PdfViewer() {
    const [pdfUrl, setPdfUrl] = useState('');
    const params = useParams();
    const id = params.id;

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                // GinサーバーのURLに合わせて調整
                const response = await fetch(`http://localhost:8080/api/pdf/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (error) {
                console.error('Error fetching PDF:', error);
            }
        };

        fetchPdf();
    }, []);

    return (
        <div>
            {pdfUrl ? (
                <iframe src={pdfUrl} width="100%" height="100%" style={{ minHeight: '80vh' }}></iframe>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
