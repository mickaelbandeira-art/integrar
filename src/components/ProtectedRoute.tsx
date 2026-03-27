import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/localStorage';
import { toast } from "sonner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = getCurrentUser();

    if (!user) {
        toast.error("Por favor, faça o check-in primeiro.");
        return <Navigate to="/checkin" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
