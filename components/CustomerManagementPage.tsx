import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Customer } from '../types';
import { Link } from 'react-router-dom';
import CustomerFormModal from './CustomerFormModal';
import ExportButton from './common/ExportButton';

const CustomerManagementPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const customerData = await api.fetchAllCustomers();
            setCustomers(customerData);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
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
                alert("Customer updated successfully!");
            } else {
                await api.addCustomer(customer);
                alert("Customer added successfully!");
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
        if (window.confirm(`Are you sure you want to delete "${customerName}"? All their billing data will also be removed.`)) {
             try {
                await api.removeCustomer(customerId);
                alert("Customer removed successfully!");
                fetchData();
            } catch (error) {
                console.error("Failed to delete customer:", error);
                alert("An error occurred while deleting the customer.");
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.meterNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const preparedCustomerDataForExport = filteredCustomers.map(c => ({
        'Name': c.name,
        'Account Number': c.accountNumber,
        'Meter Number': c.meterNumber,
        'Phone': c.phone,
        'Last Reading': c.lastReading,
        'Last Reading Date': new Date(c.lastReadingDate).toLocaleDateString(),
    }));

    if (loading) return <p className="text-center p-8">Loading customers...</p>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
                    <button onClick={() => handleOpenCustomerModal()} className="btn-primary">Add Customer</button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                     <input
                        type="text"
                        placeholder="Search by name, account, or meter no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <ExportButton data={preparedCustomerDataForExport} fileName="customers.csv" />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Name</th>
                                <th className="th">Account No.</th>
                                <th className="th">Meter No.</th>
                                <th className="th">Last Reading</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td className="td font-medium text-gray-900">
                                      <Link to={`/admin/customer/${customer.id}`} className="text-primary hover:underline">
                                        {customer.name}
                                      </Link>
                                    </td>
                                    <td className="td">{customer.accountNumber}</td>
                                    <td className="td">{customer.meterNumber}</td>
                                    <td className="td">{customer.lastReading} <span className="text-xs">({new Date(customer.lastReadingDate).toLocaleDateString()})</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenCustomerModal(customer)} className="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                                        <button onClick={() => handleDeleteCustomer(customer.id, customer.name)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
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
                .th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; letter-spacing: 0.05em; }
                .td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #495057; }
            `}</style>
        </div>
    );
};

export default CustomerManagementPage;