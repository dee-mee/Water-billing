import React from 'react';
import Header from './common/Header';
import Sidebar from './common/Sidebar';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../types';

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

const BillingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const AllBillsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="7" width="18" height="11" rx="2" ry="2" />
        <path d="M16.5 12.5h-9" />
        <path d="M12 10v5" />
        <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </svg>
);

const AdminUsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const MetricsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const AnalyticsIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
);


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const adminLinks = [
        { path: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/admin/customers', label: 'Customers', icon: <UsersIcon /> },
        { path: '/admin/billing', label: 'Billing Tools', icon: <BillingIcon /> },
        { path: '/admin/all-bills', label: 'All Bills', icon: <AllBillsIcon /> },
        { path: '/admin/metrics', label: 'Metrics', icon: <MetricsIcon /> },
        { path: '/admin/users', label: 'Admin Users', icon: <AdminUsersIcon /> }
    ];

    const customerLinks = [
        { path: '/dashboard', label: 'My Dashboard', icon: <DashboardIcon /> },
        { path: '/billing-history', label: 'Billing History', icon: <BillingIcon /> },
        { path: '/usage-analytics', label: 'Usage Analytics', icon: <AnalyticsIcon /> },
        { path: '/profile', label: 'My Profile', icon: <ProfileIcon /> },
    ];
    
    const links = user ? (user.role === UserRole.ADMIN ? adminLinks : customerLinks) : [];

    if (!user) {
        // Layout for logged-out pages like Login
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow container mx-auto p-4 md:p-8">
                    {children}
                </main>
                <footer className="text-center p-4 text-neutral-dark text-sm">
                    © 2024 AquaTrack. All rights reserved.
                </footer>
            </div>
        );
    }
    
    // Layout for logged-in pages with sidebar
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar links={links} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
                    {children}
                    <footer className="text-center p-4 text-neutral-dark text-sm mt-8">
                        © 2024 AquaTrack. All rights reserved.
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default Layout;