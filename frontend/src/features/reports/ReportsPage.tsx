import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, AlertCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    api.get('/reports/dashboard'),
                    api.get('/reports/revenue')
                ]);
                setStats(statsRes.data);
                setRevenueData(chartRes.data);
            } catch (error) {
                console.error('Failed to load reports', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your business performance and revenue.</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats?.overdueAmount || 0)}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full text-red-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Open Invoices</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats?.openInvoicesCount || 0}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Overview (Last 6 Months)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#F9FAFB' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar
                                dataKey="amount"
                                fill="#4F46E5"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
