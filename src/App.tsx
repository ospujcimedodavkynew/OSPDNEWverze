import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useData } from './context/DataContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Rentals from './components/Rentals';
import Customers from './components/Customers';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import NewRentalForm from './components/NewRentalForm';
import ContractView from './components/ContractView';
import CustomerFormPublic from './components/CustomerFormPublic';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardIcon, FleetIcon, RentalsIcon, CalendarIcon, CustomersIcon, SettingsIcon } from './components/Icons';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navItems = [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/fleet', label: 'Vozový park', icon: <FleetIcon /> },
        { path: '/rentals', label: 'Půjčovné', icon: <RentalsIcon /> },
        { path: '/customers', label: 'Zákazníci', icon: <CustomersIcon /> },
        { path: '/calendar', label: 'Kalendář', icon: <CalendarIcon /> },
        { path: '/settings', label: 'Nastavení', icon: <SettingsIcon /> },
    ];

    return (
        <aside className="w-64 bg-surface text-text-primary flex flex-col shadow-lg">
            <div className="p-6 text-2xl font-bold border-b border-border">
                RentalAdmin
            </div>
            <nav className="flex-grow p-4">
                <ul>
                    {navItems.map(item => (
                        <li key={item.path}>
                            <Link 
                                to={item.path} 
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                    location.pathname === item.path 
                                    ? 'bg-primary text-white' 
                                    : 'hover:bg-background'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};


const App: React.FC = () => {
    const { session, loading } = useData();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Načítání...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/public/request" element={<CustomerFormPublic />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/fleet" element={<AppLayout><Fleet /></AppLayout>} />
                <Route path="/rentals" element={<AppLayout><Rentals /></AppLayout>} />
                <Route path="/rentals/new" element={<AppLayout><NewRentalForm /></AppLayout>} />
                <Route path="/rentals/contract/:id" element={<AppLayout><ContractView /></AppLayout>} />
                <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
                <Route path="/calendar" element={<AppLayout><CalendarView /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            </Route>
            
            <Route path="*" element={<Navigate to={session ? "/" : "/login"} />} />
        </Routes>
    );
};

export default App;