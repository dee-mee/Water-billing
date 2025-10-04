import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { BillWithCustomerInfo, Bill } from '../types';
import BillFormModal from './BillFormModal';
import ExportButton from './common/ExportButton';
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

const AllBillsPage: React.FC = () => {
    const [allBills, setAllBills] = useState<BillWithCustomerInfo[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [approvalFilter, setApprovalFilter] = useState('all');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const billsData = await api.fetchAllBills();
            setAllBills(billsData);
        } catch (error) {
            console.error("Failed to fetch all bills:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredBills = useMemo(() => {
        return allBills.filter(bill => {
            const matchesSearch = searchTerm === '' ||
                bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.customerAccountNumber.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
            
            const matchesApproval = approvalFilter === 'all' ||
                (approvalFilter === 'approved' && bill.approved) ||
                (approvalFilter === 'pending' && !bill.approved);

            return matchesSearch && matchesStatus && matchesApproval;
        });
    }, [allBills, searchTerm, statusFilter, approvalFilter]);

    const preparedBillDataForExport = filteredBills.map(b => ({
        'Customer Name': b.customerName,
        'Account Number': b.customerAccountNumber,
        'Period': b.period,
        'Amount Due': b.amountDue.toFixed(2),
        'Due Date': new Date(b.dueDate).toLocaleDateString(),
        'Status': b.status,
        'Approved': b.approved ? 'Yes' : 'No',
        'Consumption (m³)': b.consumption,
        'Previous Reading': b.previousReading,
        'Current Reading': b.currentReading,
    }));

    const handleOpenModal = (bill: Bill | null = null) => {
        setEditingBill(bill);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBill(null);
    };

    const handleSaveBill = async (bill: Omit<Bill, 'id' | 'customerId'> | Bill) => {
        try {
            if ('id' in bill) {
                await api.updateBill(bill);
                alert('Bill updated successfully!');
            } else {
                // This page is for editing existing bills, adding is done on customer page
                throw new Error("Cannot add a bill without a customer context from this page.");
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
    
    const handleExportInvoice = async (bill: Bill) => {
        setExportingId(bill.id);
        try {
            const profile = await api.fetchCustomerProfile(bill.customerId);
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


    if (loading) return <div className="text-center p-8">Loading all bills...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">All Bills Management</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="space-y-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search by customer name or account..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-input flex-grow"
                        />
                        <ExportButton data={preparedBillDataForExport} fileName="all_bills.csv" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input">
                            <option value="all">All Statuses</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                        <select value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)} className="form-input">
                            <option value="all">All Approval</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Customer</th>
                                <th className="th">Period</th>
                                <th className="th">Amount</th>
                                <th className="th">Status</th>
                                <th className="th">Approval</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBills.map(bill => (
                                <tr key={bill.id}>
                                    <td className="td font-medium text-gray-900">
                                        <div>{bill.customerName}</div>
                                        <div className="text-xs text-gray-500">{bill.customerAccountNumber}</div>
                                    </td>
                                    <td className="td">{bill.period}</td>
                                    <td className="td">KES {bill.amountDue.toFixed(2)}</td>
                                    <td className="td"><BillStatusBadge status={bill.status} /></td>
                                    <td className="td">
                                        {bill.approved ? <span className="text-green-600 font-semibold">Approved</span> : <span className="text-gray-600">Pending</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        {!bill.approved && (
                                            <button onClick={() => handleApproveBill(bill.id)} className="btn-approve">Approve</button>
                                        )}
                                        <button onClick={() => handleOpenModal(bill)} className="btn-edit">Edit</button>
                                        <button
                                            onClick={() => handleExportInvoice(bill)}
                                            disabled={exportingId === bill.id}
                                            className="btn-export"
                                        >
                                            {exportingId === bill.id ? '...' : 'Export'}
                                        </button>
                                        <button onClick={() => handleDeleteBill(bill.id)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && editingBill && (
                <BillFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveBill}
                    bill={editingBill}
                />
            )}
             <style>{`
                .form-input { display: block; width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
                .th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; }
                .td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #495057; }
                .btn-approve, .btn-edit, .btn-delete, .btn-export { font-weight: 600; }
                .btn-approve { color: #8b5cf6; } .btn-approve:hover { color: #7c3aed; }
                .btn-edit { color: #3b82f6; } .btn-edit:hover { color: #2563eb; }
                .btn-delete { color: #ef4444; } .btn-delete:hover { color: #dc2626; }
                .btn-export { color: #16a34a; } .btn-export:hover { color: #15803d; }
                .btn-export:disabled { color: #9ca3af; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default AllBillsPage;