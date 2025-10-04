import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Customer, Bill } from '../types';
import BillFormModal from './BillFormModal';

const BillStatusBadge: React.FC<{ status: Bill['status'] }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        Paid: "bg-green-100 text-green-800",
        Unpaid: "bg-yellow-100 text-yellow-800",
        Overdue: "bg-red-100 text-red-800",
        'Pending Approval': "bg-blue-100 text-blue-800"
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const ApprovalStatus: React.FC<{ approved: boolean }> = ({ approved }) => {
    return approved ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Approved
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Pending
      </span>
    );
};


const CustomerDetailPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);

    const fetchData = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const [customerData, billsData] = await Promise.all([
                api.getCustomerById(customerId),
                api.fetchBillsForCustomer(customerId)
            ]);
            setCustomer(customerData);
            setBills(billsData);
        } catch (error) {
            console.error("Failed to fetch customer data:", error);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (bill: Bill | null = null) => {
        setEditingBill(bill);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBill(null);
    };
    
    const handleSaveBill = async (bill: Omit<Bill, 'id' | 'customerId'> | Bill) => {
        if (!customerId) return;

        const billToSave = { ...bill, customerId };

        try {
            if ('id' in billToSave && billToSave.id) {
                await api.updateBill(billToSave as Bill);
                 alert('Bill updated successfully!');
            } else {
                await api.addBill(billToSave as Omit<Bill, 'id'>);
                 alert('Bill added successfully!');
            }
            fetchData();
        } catch (error) {
            console.error("Failed to save bill:", error);
            alert('An error occurred while saving the bill.');
        } finally {
            handleCloseModal();
        }
    };
    
    const handleDeleteBill = async (billId: string) => {
        if (window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
            try {
                await api.deleteBill(billId);
                alert('Bill deleted successfully!');
                fetchData();
            } catch (error) {
                console.error("Failed to delete bill:", error);
                alert('An error occurred while deleting the bill.');
            }
        }
    };
    
    const handleApproveBill = async (billId: string) => {
         if (window.confirm("Are you sure you want to approve this bill?")) {
            try {
                await api.approveBill(billId);
                alert('Bill approved successfully!');
                fetchData();
            } catch (error) {
                console.error("Failed to approve bill:", error);
                alert('An error occurred while approving the bill.');
            }
        }
    }

    const handleMarkAsPaid = async (billId: string) => {
        if (window.confirm("Are you sure you want to mark this bill as paid?")) {
            try {
                const success = await api.markBillAsPaid(billId);
                if (success) {
                    alert('Bill marked as paid!');
                    fetchData();
                } else {
                    alert('Failed to mark bill as paid. The bill must be approved first.');
                }
            } catch (error) {
                console.error("Failed to mark as paid:", error);
                alert('An error occurred.');
            }
        }
    }


    if (loading) return <div className="text-center p-8">Loading customer details...</div>;
    if (!customer) return <div className="text-center p-8 text-red-500">Customer not found.</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
                        <p className="text-gray-500">Account: {customer.accountNumber} | Meter: {customer.meterNumber}</p>
                    </div>
                    <Link to="/admin/customers" className="text-primary hover:underline">&larr; Back to Customer List</Link>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Billing History</h2>
                    <button onClick={() => handleOpenModal()} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-primary-dark transition-colors">
                        Add New Bill
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {bills.map(bill => (
                                <tr key={bill.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.period}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES {bill.amountDue.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><BillStatusBadge status={bill.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><ApprovalStatus approved={bill.approved ?? false} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        {!bill.approved && (
                                            <button onClick={() => handleApproveBill(bill.id)} className="text-purple-600 hover:text-purple-800">Approve</button>
                                        )}
                                        {bill.status !== 'Paid' && bill.approved && (
                                            <button onClick={() => handleMarkAsPaid(bill.id)} className="text-green-600 hover:text-green-800">Mark Paid</button>
                                        )}
                                        <button onClick={() => handleOpenModal(bill)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                        <button onClick={() => handleDeleteBill(bill.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <BillFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveBill}
                    bill={editingBill}
                />
            )}
        </div>
    );
};

export default CustomerDetailPage;