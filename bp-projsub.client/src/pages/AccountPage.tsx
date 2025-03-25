import { useAuth } from "@/context/UserContext";
import { UnauthorizedPage } from "./errorPages/UnauthorizedPage";
import { Navigate } from "react-router-dom";
import AppPage from "@/components/App-page";
import { ChangePasswordPage } from "./ChangePasswordPage";



const AccountPage = () => {
    const { user } = useAuth();

    if (user === null) {
        return (
            <Navigate to="/login" />
        );
    }

    if (user.roles.includes("Admin")) {
        return (
            // <Outlet />
            <ChangePasswordPage />
        );
    }

    if (user.roles.includes("Teacher") || user.roles.includes("Student")) {
        return (
            <AppPage >
                <ChangePasswordPage />
            </AppPage>
        );
    }

    return (
        <>
            <UnauthorizedPage />
        </>
    );
}

export default AccountPage;