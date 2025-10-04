import React, { useState, useEffect } from 'react';
import { Bill } from '../types';

interface BillFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bill: Omit<Bill, 'id' | 'customerId'> | Bill) => void;
    bill: Bill | null; // Pass a bill object to edit, or null to add
}

type BillFormData = Omit<Bill, 'id' | 'customerId'>;

const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSave, bill }) => {
    const [formData, setFormData] = useState<BillFormData>({
        period: '',
        previousReading: 0,
        currentReading: 0,
        consumption: 0,
        rate: 1.5,
        amountDue: 0,
        dueDate: '',
        status: 'Pending Approval',
        approved: false,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (bill) {
            setFormData({
                period: bill.period,
                previousReading: bill.previousReading,
                currentReading: bill.currentReading,
                consumption: bill.consumption,
                rate: bill.rate,
                amountDue: bill.amountDue,
                dueDate: bill.dueDate.split('T')[0], // Format for date input
                status: bill.status,
                approved: bill.approved ?? false,
            });
        } else {
            // Reset form for adding a new bill
            setFormData({
                period: '',
                previousReading: 0,
                currentReading: 0,
                consumption: 0,
                rate: 1.5,
                amountDue: 0,
                dueDate: '',
                status: 'Pending Approval',
                approved: false,
            });
        }
    }, [bill, isOpen]);
    
    useEffect(() => {
        const consumption = formData.currentReading - formData.previousReading;
        if (consumption >= 0) {
            setFormData(prev => ({
                ...prev,
                consumption,
                amountDue: consumption * prev.rate,
            }));
        }
    }, [formData.currentReading, formData.previousReading, formData.rate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if(type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({
                ...prev,
                [name]: name.includes('Reading') || name === 'rate' ? parseFloat(value) || 0 : value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        let dataToSave : Omit<Bill, 'id' | 'customerId'> | Bill = formData;

        if (bill) {
           dataToSave = { ...bill, ...formData };
        }
        
        onSave(dataToSave);
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-primary">{bill ? 'Edit Bill' : 'Add New Bill'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="period" className="block text-sm font-medium text-gray-700">Billing Period</label>
                            <input type="text" name="period" value={formData.period} onChange={handleChange} placeholder="e.g., September 2024" required className="mt-1 form-input"/>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="mt-1 form-input"/>
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="previousReading" className="block text-sm font-medium text-gray-700">Previous Reading</label>
                            <input type="number" name="previousReading" value={formData.previousReading} onChange={handleChange} required className="mt-1 form-input"/>
                        </div>
                        <div>
                            <label htmlFor="currentReading" className="block text-sm font-medium text-gray-700">Current Reading</label>
                            <input type="number" name="currentReading" value={formData.currentReading} onChange={handleChange} required className="mt-1 form-input"/>
                        </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-md">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                                <p className="text-gray-500">Consumption (m³)</p>
                                <p className="font-bold text-gray-800">{formData.consumption.toFixed(2)}</p>
                           </div>
                           <div>
                                <p className="text-gray-500">Amount Due (KES)</p>
                                <p className="font-bold text-gray-800">{formData.amountDue.toFixed(2)}</p>
                           </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate (per m³)</label>
                            <input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleChange} required className="mt-1 form-input"/>
                        </div>
                        <div>
                           <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 form-input">
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center">
                           <input id="approved" name="approved" type="checkbox" checked={formData.approved} onChange={handleChange} className="h-4 w-4 text-primary-dark border-gray-300 rounded focus:ring-primary"/>
                           <label htmlFor="approved" className="ml-2 block text-sm text-gray-900">Approved</label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400">
                            {submitting ? 'Saving...' : 'Save Bill'}
                        </button>
                    </div>
                </form>
            </div>
            {/* Simple styling for form inputs */}
            <style>{`
                .form-input {
                    display: block;
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .form-input:focus {
                    outline: none;
                    --tw-ring-color: #0077b6;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                    border-color: var(--tw-ring-color);
                }
            `}</style>
        </div>
    );
};

export default BillFormModal;