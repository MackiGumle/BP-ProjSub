import App from "@/App";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
// import RegisterPage from "@/pages/RegisterPage";
import { NotFoundPage } from "@/pages/errorPages/NotFoundPage";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <NotFoundPage />,
        children: [
            { path: "", element: <ProtectedRoute> <HomePage/> </ProtectedRoute>},
            // { path: "register", element: <RegisterPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/student", element: <ProtectedRoute role={["Student"]}> StudentPage </ProtectedRoute> },
            { path: "/teacher", element: <ProtectedRoute role={["Teacher"]}> TeacherPage </ProtectedRoute> },
            { path: "/admin", element: <ProtectedRoute role={["Admin"]}> AdminPage </ProtectedRoute> },


        ],
    },
]);