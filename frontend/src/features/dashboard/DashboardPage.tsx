import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { DollarSign, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalRevenue: number;
    overdueAmount: number;
    openInvoicesCount: number;
    recentInvoices: any[];
}

export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex h-64 items-center justify-center text-gray-400">Loading dashboard...</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                <Link to="/invoices/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm">
                    + New Invoice
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Overdue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Overdue Invoices</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats?.overdueAmount || 0)}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Open Invoices */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Open Invoices</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.openInvoicesCount || 0}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                    <Link to="/invoices" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center font-medium">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-50">
                    {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                        stats.recentInvoices.map((inv) => (
                            <Link key={inv.id} to={`/invoices/${inv.id}`} className="block">
                                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{inv.client.name}</p>
                                        <p className="text-xs text-gray-500">{inv.number} • {new Date(inv.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
