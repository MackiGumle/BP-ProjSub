import { useAuth } from "@/context/UserContext";
import { UnauthorizedPage } from "@/pages/errorPages/UnauthorizedPage";
import { Navigate, useLocation } from "react-router-dom";


export function ProtectedRoute({ role = null, children }: { role?: string[] | null, children: React.ReactNode }) {
    const { hasRole, isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn())
        return <Navigate to="/login" replace state={{ path: location.pathname }} />;

    if (role === null || role.some(r => hasRole(r)))
        return <>{children}</>;
    else
        return <UnauthorizedPage />
}