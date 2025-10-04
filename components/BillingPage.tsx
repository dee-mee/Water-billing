import React, { useState, useCallback } from 'react';
import { api } from '../services/api';
import BulkUploadModal from './BulkUploadModal';

const BillingPage: React.FC = () => {
    const [isSendingReminders, setIsSendingReminders] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

    // We need a dummy fetchData to pass to the modal success handler,
    // or we can just show an alert. Let's alert for simplicity.
    const handleBulkUploadSuccess = () => {
        setIsBulkUploadModalOpen(false);
        alert("Bulk upload processed successfully! New bills have been created.");
    };

    const handleSendReminders = async () => {
        setIsSendingReminders(true);
        try {
            const count = await api.sendAllPaymentReminders();
            alert(`${count} payment reminder(s) sent successfully.`);
        } catch (error) {
            console.error("Failed to send reminders:", error);
            alert('An error occurred while sending reminders.');
        } finally {
            setIsSendingReminders(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Billing Tools</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Billing Operations</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 p-4 border rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Send Payment Reminders</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Send SMS reminders to all customers with unpaid or overdue bills. This action will message multiple users.
                        </p>
                        <button
                            onClick={handleSendReminders}
                            disabled={isSendingReminders}
                            className="btn-accent"
                        >
                            {isSendingReminders ? 'Sending...' : 'Send All Reminders'}
                        </button>
                    </div>

                    <div className="flex-1 p-4 border rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Bulk Upload Readings</h3>
                         <p className="text-sm text-gray-600 mb-4">
                            Upload an Excel or CSV file to update multiple meter readings and generate new bills at once.
                        </p>
                        <button onClick={() => setIsBulkUploadModalOpen(true)} className="btn-secondary">
                            Open Bulk Upload
                        </button>
                    </div>
                </div>
            </div>

            {isBulkUploadModalOpen && (
                <BulkUploadModal
                    isOpen={isBulkUploadModalOpen}
                    onClose={() => setIsBulkUploadModalOpen(false)}
                    onSuccess={handleBulkUploadSuccess}
                />
            )}
            
            <style>{`
                .btn-secondary { padding: 0.5rem 1rem; background-color: #e9ecef; color: #023e8a; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.3s; }
                .btn-secondary:hover { background-color: #ced4da; }
                .btn-accent { padding: 0.5rem 1rem; background-color: #00b4d8; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.3s; }
                .btn-accent:hover { background-color: #0096c7; }
                .btn-accent:disabled { background-color: #6c757d; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default BillingPage;
