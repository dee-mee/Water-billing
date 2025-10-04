import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { MeterMetric } from '../types';
import ExportButton from './common/ExportButton';

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

const MetricsPage: React.FC = () => {
    const [metrics, setMetrics] = useState<MeterMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const metricsData = await api.fetchAllMeterMetrics();
            setMetrics(metricsData);
        } catch (error) {
            console.error("Failed to fetch meter metrics:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredMetrics = useMemo(() => {
        return metrics.filter(metric =>
            metric.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            metric.customerAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            metric.meterNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [metrics, searchTerm]);

    const totalConsumptionAllMeters = useMemo(() => {
        return metrics.reduce((total, metric) => total + metric.totalConsumption, 0);
    }, [metrics]);

    const preparedMetricsDataForExport = filteredMetrics.map(m => ({
        'Meter Number': m.meterNumber,
        'Customer Name': m.customerName,
        'Account Number': m.customerAccountNumber,
        'Total Consumption (m³)': m.totalConsumption.toFixed(2),
    }));


    if (loading) return <div className="text-center p-8">Loading metrics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Meter Metrics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard 
                    title="Total Meters" 
                    value={metrics.length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} 
                />
                <StatCard 
                    title="Total Consumption (All Time)" 
                    value={`${totalConsumptionAllMeters.toFixed(2)} m³`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>} 
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by customer, account, or meter no..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                     <ExportButton data={preparedMetricsDataForExport} fileName="meter_metrics.csv" />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Meter No.</th>
                                <th className="th">Customer</th>
                                <th className="th">Account No.</th>
                                <th className="th text-right">Total Consumption (m³)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMetrics.map(metric => (
                                <tr key={metric.meterNumber}>
                                    <td className="td font-mono">{metric.meterNumber}</td>
                                    <td className="td font-medium text-gray-900">{metric.customerName}</td>
                                    <td className="td">{metric.customerAccountNumber}</td>
                                    <td className="td text-right font-bold">{metric.totalConsumption.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                .th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; }
                .td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #495057; }
            `}</style>
        </div>
    );
};

export default MetricsPage;