import { useAuth } from "@/context/UserContext";
import { UnauthorizedPage } from "@/pages/errorPages/UnauthorizedPage";
import { Navigate } from "react-router-dom";


export function ProtectedRoute({ role = null, children }: { role?: string[] | null, children: React.ReactNode }) {
    const { hasRole, isLoggedIn } = useAuth();

    if (!isLoggedIn())
        return <Navigate to="/login" />;
    
    if (role === null || role.some(r => hasRole(r)))
        return <>{children}</>;
    else
        return <UnauthorizedPage />
}