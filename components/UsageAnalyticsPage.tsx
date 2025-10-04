import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../services/api';
import { Bill } from '../types';
import UsageChart from './UsageChart';

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


const UsageAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = useCallback(async () => {
        if (user) {
            setLoading(true);
            const userBills = await api.fetchBillsForCustomer(user.id);
            setBills(userBills);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const analyticsData = useMemo(() => {
        if (bills.length === 0) {
            return {
                averageConsumption: 0,
                highestConsumption: 0,
                highestConsumptionPeriod: 'N/A',
            };
        }
        
        const totalConsumption = bills.reduce((sum, bill) => sum + bill.consumption, 0);
        const highestBill = bills.reduce((max, bill) => bill.consumption > max.consumption ? bill : max, bills[0]);

        return {
            averageConsumption: totalConsumption / bills.length,
            highestConsumption: highestBill.consumption,
            highestConsumptionPeriod: highestBill.period,
        };
    }, [bills]);

    if (loading) return <div className="text-center p-8">Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Usage Analytics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Average Monthly Consumption" 
                    value={`${analyticsData.averageConsumption.toFixed(2)} m³`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                />
                <StatCard 
                    title="Highest Consumption" 
                    value={`${analyticsData.highestConsumption.toFixed(2)} m³`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 3 9h3v7h6v-7h3l3-9H3zM5 14h14"/></svg>}
                />
                 <StatCard 
                    title="Highest Consumption Period" 
                    value={analyticsData.highestConsumptionPeriod} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Consumption History (m³)</h2>
                <UsageChart data={bills.slice().reverse()} />
            </div>
        </div>
    );
};

export default UsageAnalyticsPage;