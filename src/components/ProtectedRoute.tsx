
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const ProtectedRoute: React.FC = () => {
    const { user } = useData();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};
