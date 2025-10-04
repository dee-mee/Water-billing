import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-start gap-4">
        <div className="bg-secondary p-3 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const statsData = await api.getDashboardStats();
            setStats(statsData);
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    if (loading) return <p className="text-center p-8">Loading dashboard...</p>;

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
                <StatCard title="Bills Awaiting Payment" value={stats?.billsAwaitingPayment ?? 0} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>} />
                <StatCard title="Total Amount Overdue" value={`KES ${stats?.totalOverdueAmount.toFixed(2) ?? '0.00'}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            </div>
        </div>
    );
};

export default AdminDashboard;