import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { MeterMetric, Customer } from '../types';
import ExportButton from './common/ExportButton';
import CustomerFormModal from './CustomerFormModal';

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
    
    // Modal states
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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

    const handleOpenCustomerModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsCustomerModalOpen(true);
    };

    const handleCloseCustomerModal = () => {
        setIsCustomerModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSaveCustomer = async (customer: Omit<Customer, 'id'> | Customer) => {
        try {
            if ('id' in customer) {
                await api.updateCustomer(customer);
                alert("Customer/Meter details updated successfully!");
            } else {
                await api.addCustomer(customer);
                alert("New Customer/Meter added successfully!");
            }
            fetchData();
        } catch (error) {
            console.error("Failed to save customer:", error);
            alert("An error occurred while saving the customer.");
        } finally {
            handleCloseCustomerModal();
        }
    };
    
    const handleDeleteCustomer = async (customerId: string, customerName: string) => {
        if (window.confirm(`Are you sure you want to delete "${customerName}"? Their meter and all billing data will also be removed.`)) {
             try {
                await api.removeCustomer(customerId);
                alert("Customer and associated meter removed successfully!");
                fetchData();
            } catch (error) {
                console.error("Failed to delete customer:", error);
                alert("An error occurred while deleting the customer.");
            }
        }
    };

    const filteredMetrics = useMemo(() => {
        return metrics.filter(metric =>
            metric.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            metric.customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            metric.customer.meterNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [metrics, searchTerm]);

    const totalConsumptionAllMeters = useMemo(() => {
        return metrics.reduce((total, metric) => total + metric.totalConsumption, 0);
    }, [metrics]);

    const preparedMetricsDataForExport = filteredMetrics.map(m => ({
        'Meter Number': m.customer.meterNumber,
        'Customer Name': m.customer.name,
        'Account Number': m.customer.accountNumber,
        'Total Consumption (m³)': m.totalConsumption.toFixed(2),
    }));


    if (loading) return <div className="text-center p-8">Loading metrics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Meter Metrics & Management</h1>
            
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
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                         <input
                            type="text"
                            placeholder="Search by customer, account, or meter no..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                         <ExportButton data={preparedMetricsDataForExport} fileName="meter_metrics.csv" />
                         <button onClick={() => handleOpenCustomerModal()} className="btn-primary">Add New Meter</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Meter No.</th>
                                <th className="th">Customer</th>
                                <th className="th">Account No.</th>
                                <th className="th text-right">Total Consumption (m³)</th>
                                <th className="th text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMetrics.map(metric => (
                                <tr key={metric.customer.meterNumber}>
                                    <td className="td font-mono">{metric.customer.meterNumber}</td>
                                    <td className="td font-medium text-gray-900">{metric.customer.name}</td>
                                    <td className="td">{metric.customer.accountNumber}</td>
                                    <td className="td text-right font-bold">{metric.totalConsumption.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenCustomerModal(metric.customer)} className="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                                        <button onClick={() => handleDeleteCustomer(metric.customer.id, metric.customer.name)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCustomerModalOpen && (
                <CustomerFormModal 
                    isOpen={isCustomerModalOpen} 
                    onClose={handleCloseCustomerModal} 
                    onSave={handleSaveCustomer} 
                    customer={editingCustomer} 
                />
            )}

            <style>{`
                .btn-primary { padding: 0.5rem 1rem; background-color: #0077b6; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.3s; }
                .btn-primary:hover { background-color: #023e8a; }
                .th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; }
                .td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #495057; }
            `}</style>
        </div>
    );
};

export default MetricsPage;