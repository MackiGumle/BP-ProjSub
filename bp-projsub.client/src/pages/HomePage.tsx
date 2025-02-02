import { useAuth } from "@/context/UserContext";
import axios from "axios";
import { useState } from "react";
import { UnauthorizedPage } from "./errorPages/UnauthorizedPage";
import { AdminPage } from "./admin/AdminPage";
import { TeacherPage } from "./teacher/TeacherPage";
import { StudentPage } from "./student/StudentPage";
import { Navigate, Outlet } from "react-router-dom";
import AppPage from "@/components/App-page";



const HomePage = () => {
    const { user } = useAuth();

    if (user === null) {
        return (
            <Navigate to="/login" />
        );
    }

    if (user.roles.includes("Admin")) {
        return (
            <AdminPage />
        );
    }

    if (user.roles.includes("Teacher") || user.roles.includes("Student")) {
        return (
            // <TeacherPage />
            <AppPage >
                <Outlet />
            </AppPage>

        );
    }

    return (
        <>
            <UnauthorizedPage />
        </>
    );
}

export default HomePage;