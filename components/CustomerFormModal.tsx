import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Omit<Customer, 'id'> | Customer) => void;
    customer: Customer | null;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        meterNumber: '',
        phone: '',
        lastReading: 0,
        lastReadingDate: new Date().toISOString().split('T')[0],
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                accountNumber: customer.accountNumber,
                meterNumber: customer.meterNumber,
                phone: customer.phone,
                lastReading: customer.lastReading,
                lastReadingDate: customer.lastReadingDate.split('T')[0],
            });
        } else {
            setFormData({
                name: '',
                accountNumber: '',
                meterNumber: '',
                phone: '',
                lastReading: 0,
                lastReadingDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [customer, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lastReading' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const dataToSave = customer ? { ...customer, ...formData } : formData;
        onSave(dataToSave);
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-primary">{customer ? 'Edit Customer' : 'Add New Customer'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="label">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="accountNumber" className="label">Account Number</label>
                            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="meterNumber" className="label">Meter Number</label>
                            <input type="text" name="meterNumber" value={formData.meterNumber} onChange={handleChange} required className="form-input"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="label">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="2547XXXXXXXX" className="form-input"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="lastReading" className="label">Initial/Last Reading</label>
                           <input type="number" name="lastReading" value={formData.lastReading} onChange={handleChange} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="lastReadingDate" className="label">Last Reading Date</label>
                            <input type="date" name="lastReadingDate" value={formData.lastReadingDate} onChange={handleChange} required className="form-input"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400">
                            {submitting ? 'Saving...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .form-input { display: block; width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
                .form-input:focus { outline: none; --tw-ring-color: #0077b6; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: var(--tw-ring-color); }
            `}</style>
        </div>
    );
};

export default CustomerFormModal;