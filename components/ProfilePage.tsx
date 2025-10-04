import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../services/api';
import { CustomerProfile } from '../types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string, phone: string }) => Promise<void>;
    profile: CustomerProfile;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, profile }) => {
    const [name, setName] = useState(profile.name);
    const [phone, setPhone] = useState(profile.phone);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await onSave({ name, phone });
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-primary">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="label">Full Name</label>
                        <input type="text" name="name" value={name} onChange={e => setName(e.target.value)} required className="form-input"/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="label">Phone Number</label>
                        <input type="tel" name="phone" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="2547XXXXXXXX" className="form-input"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`
                .label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .form-input { display: block; width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
                .btn-primary { padding: 0.5rem 1rem; background-color: #0077b6; color: white; border-radius: 0.5rem; font-weight: 600; }
                .btn-secondary { padding: 0.5rem 1rem; background-color: #e9ecef; color: #023e8a; border-radius: 0.5rem; font-weight: 600; }
            `}</style>
        </div>
    );
};


const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const profileData = await api.fetchCustomerProfile(user.id);
                setProfile(profileData);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSaveProfile = async (data: { name: string, phone: string }) => {
        if (!user) return;
        try {
            await api.updateCustomerProfile(user.id, data);
            await fetchProfile(); // Refresh profile data
            setIsModalOpen(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("An error occurred while updating your profile.");
        }
    };
    

    if (loading) return <div className="text-center p-8">Loading your profile...</div>;
    if (!profile) return <div className="text-center p-8 text-red-500">Could not load profile information.</div>;


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary">Edit Profile</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <InfoItem label="Full Name" value={profile.name} />
                    <InfoItem label="Email Address" value={profile.email} />
                    <InfoItem label="Phone Number" value={profile.phone} />
                    <InfoItem label="Account Number" value={profile.accountNumber} />
                    <InfoItem label="Meter Number" value={profile.meterNumber} />
                </div>
            </div>
            {isModalOpen && (
                <EditProfileModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProfile}
                    profile={profile}
                />
            )}
             <style>{`
                .btn-primary { padding: 0.5rem 1rem; background-color: #0077b6; color: white; border-radius: 0.5rem; font-weight: 600; }
            `}</style>
        </div>
    );
};

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="py-2 border-b">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
    </div>
);

export default ProfilePage;