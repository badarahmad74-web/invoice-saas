import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { InvoicePreview } from './components/InvoicePreview';
import { ArrowLeft, Download, Mail, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

export const InvoiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await api.get(`/invoices/${id}`);
                setInvoice(response.data);
            } catch (error) {
                console.error('Failed to load invoice', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handleDownloadPdf = async () => {
        try {
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoice.number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Failed to download PDF', error);
            setMessage({ type: 'error', text: 'Failed to download PDF' });
        }
    };

    const handleSendEmail = async () => {
        if (!confirm(`Send invoice to ${invoice.client?.email || 'client'}?`)) return;

        setSending(true);
        setMessage(null);
        try {
            await api.post(`/invoices/${id}/email`);
            setMessage({ type: 'success', text: 'Email sent successfully!' });
        } catch (error) {
            console.error('Failed to send email', error);
            setMessage({ type: 'error', text: 'Failed to send email. Check server logs.' });
        } finally {
            setSending(false);
        }
    };

    const handlePayNow = async () => {
        try {
            const response = await api.post('/payments/create-link', { invoiceId: id });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Failed to create payment link', error);
            setMessage({ type: 'error', text: 'Failed to create payment link' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Invoice {invoice.number}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {invoice.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {message && (
                        <div className={`flex items-center text-sm px-3 py-1 rounded-full ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                            {message.text}
                        </div>
                    )}

                    {/* Pay Now Button (Only if not PAID) */}
                    {invoice.status !== 'PAID' && (
                        <button
                            onClick={handlePayNow}
                            className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                        </button>
                    )}

                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>

                    <button
                        onClick={handleSendEmail}
                        disabled={sending}
                        className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm disabled:opacity-50 transition-colors"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        {sending ? 'Sending...' : 'Send Invoice'}
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                <div className="w-full max-w-[210mm]">
                    {/* We pass the invoice object. InvoicePreview expects the form data shape, 
                    but our API returns a compatible shape (except for date strings vs Date objects).
                    The Backend Preview endpoint handles enrichment, so we just pass the ID or Data.
                    Actually, InvoicePreview sends the data it receives to POST /preview.
                    Since we have the full invoice object, let's pass that.
                 */}
                    <InvoicePreview data={invoice} />
                </div>
            </div>
        </div>
    );
};
