import React, { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface Client {
    id: string;
    name: string;
    email: string;
}

interface ClientSelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export const ClientSelect: React.FC<ClientSelectProps> = ({ value, onChange, error }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await api.get('/clients');
                setClients(response.data);
            } catch (err) {
                console.error('Failed to load clients', err);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    if (loading) return <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.name}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            <div className="mt-1 text-right">
                {/* Placeholder for future "Add Client" modal */}
                <span className="text-xs text-indigo-600 hover:text-indigo-500 cursor-pointer">+ New Client</span>
            </div>
        </div>
    );
};
