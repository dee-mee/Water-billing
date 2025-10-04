import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import useAuth from '../hooks/useAuth';

const AdminUserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const adminData = await api.fetchAllAdmins();
            setAdmins(adminData);
        } catch (err) {
            setError('Failed to fetch admin users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail) {
            setError('Name and email are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await api.addAdmin(newName, newEmail);
            setNewName('');
            setNewEmail('');
            await fetchAdmins(); // Refresh the list
            alert(`Admin "${newName}" added successfully.`);
        } catch (err: any) {
            setError(err.message || 'Failed to add admin.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRemoveAdmin = async (adminId: string, adminName: string) => {
        if (window.confirm(`Are you sure you want to remove admin "${adminName}"?`)) {
            try {
                await api.removeAdmin(adminId);
                await fetchAdmins(); // Refresh the list
                 alert(`Admin "${adminName}" removed successfully.`);
            } catch (err) {
                setError('Failed to remove admin.');
            }
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Admin</h2>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" value={newName} onChange={(e) => setNewName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                        </div>
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="text-right">
                         <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-gray-400">
                            {isSubmitting ? 'Adding...' : 'Add Admin'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Administrators</h2>
                 {loading ? <p>Loading admins...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admins.map(admin => (
                                    <tr key={admin.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                                                disabled={admin.id === currentUser?.id}
                                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
                                                title={admin.id === currentUser?.id ? "You cannot remove yourself" : ""}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUserManagement;
