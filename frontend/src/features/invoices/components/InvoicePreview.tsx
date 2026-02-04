import React, { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface InvoicePreviewProps {
    data: any;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
    const [html, setHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Debounced preview fetching
    useEffect(() => {
        const fetchPreview = async () => {
            // Small delay to avoid flickering/spamming while typing
            const timeoutId = setTimeout(async () => {
                if (!data.clientId && !data.items?.length) return;

                setLoading(true);
                try {
                    // Calculate derived totals client-side first for immediate feedback (optional), 
                    // but we want server parity.
                    // We pass the raw form data. Server enriches it.
                    const response = await api.post('/invoices/preview', data);
                    setHtml(response.data);
                } catch (error) {
                    console.error('Failed to fetch preview', error);
                } finally {
                    setLoading(false);
                }
            }, 800);

            return () => clearTimeout(timeoutId);
        };

        fetchPreview();
    }, [data]); // Re-fetch when data changes

    if (!data.clientId && (!data.items || data.items.length === 0)) {
        return (
            <div className="h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                Start editing to see the preview...
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden min-h-[800px]">
            {loading && (
                <div className="w-full bg-indigo-50 text-indigo-700 text-xs py-1 text-center font-medium">
                    Refreshing preview...
                </div>
            )}
            {html ? (
                <div
                    dangerouslySetInnerHTML={{ __html: html }}
                    className="prose max-w-none p-8"
                />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                    Loading template...
                </div>
            )}
        </div>
    );
};
