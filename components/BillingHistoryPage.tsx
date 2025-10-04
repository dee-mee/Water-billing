import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../services/api';
import { Bill } from '../types';
import { generateInvoicePDF } from './InvoiceGenerator';

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

const PaymentModal: React.FC<{ bill: Bill; onClose: () => void; onPaymentSuccess: () => void }> = ({ bill, onClose, onPaymentSuccess }) => {
    const [phone, setPhone] = useState('');
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    
    const handlePay = async () => {
        if (!/^\d{10,12}$/.test(phone)) {
            setError('Please enter a valid phone number (e.g., 254712345678).');
            return;
        }
        setError('');
        setPaying(true);
        const success = await api.payBill(bill.id, phone);
        setPaying(false);
        if (success) {
            onPaymentSuccess();
        } else {
            setError('Payment failed. Please try again.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-2 text-primary">Pay Bill with M-Pesa</h3>
                <p className="text-gray-600 mb-4">You are paying <span className="font-bold">KES {bill.amountDue.toFixed(2)}</span> for {bill.period}.</p>
                <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 254712345678" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handlePay} disabled={paying} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400">
                        {paying ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const BillingHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);

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

    const filteredAndSortedBills = useMemo(() => {
        const filtered = statusFilter === 'all'
            ? bills
            : bills.filter(b => b.status === statusFilter);
        
        return filtered.sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [bills, statusFilter, sortOrder]);

    const handlePaymentSuccess = () => {
        setSelectedBill(null);
        fetchBills();
        alert('Payment successful! Your bill has been updated.');
    };

    const handleExportInvoice = async (bill: Bill) => {
        if (!user) return;
        setExportingId(bill.id);
        try {
            const profile = await api.fetchCustomerProfile(user.id);
            if (profile) {
                generateInvoicePDF(profile, bill);
            } else {
                throw new Error("Could not fetch customer profile for invoice.");
            }
        } catch (error) {
            console.error("Failed to generate invoice:", error);
            alert("Could not generate PDF invoice. Please try again.");
        } finally {
            setExportingId(null);
        }
    };

    if (loading) return <div className="text-center p-8">Loading billing history...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Billing History</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input">
                        <option value="all">All Statuses</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                     <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="form-input">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Period</th>
                                <th className="th">Due Date</th>
                                <th className="th">Amount</th>
                                <th className="th">Status</th>
                                <th className="th text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedBills.map(bill => (
                                <tr key={bill.id}>
                                    <td className="td font-medium text-gray-900">{bill.period}</td>
                                    <td className="td">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                    <td className="td font-semibold">KES {bill.amountDue.toFixed(2)}</td>
                                    <td className="td"><BillStatusBadge status={bill.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        {(bill.status === 'Unpaid' || bill.status === 'Overdue') && (
                                            <button onClick={() => setSelectedBill(bill)} className="text-green-600 hover:text-green-800 font-semibold">
                                                Pay Now
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleExportInvoice(bill)}
                                            disabled={exportingId === bill.id}
                                            className="text-primary hover:text-primary-dark font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {exportingId === bill.id ? 'Exporting...' : 'Export'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {selectedBill && <PaymentModal bill={selectedBill} onClose={() => setSelectedBill(null)} onPaymentSuccess={handlePaymentSuccess} />}
            <style>{`
                .form-input { display: block; width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
                .th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; }
                .td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #495057; }
            `}</style>
        </div>
    );
};

export default BillingHistoryPage;