import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavLinkItem {
    path: string;
    label: string;
    icon: React.ReactElement;
}

interface SidebarProps {
    links: NavLinkItem[];
}

const WaterDropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ links }) => {
    const navLinkClasses = 'flex items-center gap-4 px-4 py-3 rounded-lg text-gray-200 hover:bg-primary-light hover:text-white transition-colors duration-200';
    const activeNavLinkClasses = 'bg-primary text-white font-semibold shadow-inner';

    return (
        <aside className="hidden md:flex flex-col w-64 bg-primary-dark shrink-0">
            <div className="flex items-center justify-center gap-3 h-16 border-b border-primary-light/20">
                <WaterDropIcon />
                <h1 className="text-2xl font-bold text-white tracking-tight">AquaTrack</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {links.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`
                                }
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
