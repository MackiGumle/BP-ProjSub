import App from "@/App";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ActivateAccountPage from "@/pages/ActivateAccountPage";

// import RegisterPage from "@/pages/RegisterPage";
import { NotFoundPage } from "@/pages/errorPages/NotFoundPage";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { TestingPage } from "@/pages/TestingPage";
import { ManageSubjectPage } from "@/pages/teacher/ManageSubjectPage";
import { AssignmentSubmissionsPage } from "@/pages/AssignmentSubmissionsPage";
import { SubmissionBrowser } from "@/components/custom-ui/SubmissionBrowser";
import { CreateSubjectForm } from "@/components/forms/teacher/CreateSubjectForm";
import { AssignmentDescriptionEditPage } from "@/pages/teacher/AssignmentDescriptionEditPage";
import { AssignmentDetailEditPage } from "@/pages/teacher/AssignmentDetailEditPage";
import AccountPage from "@/pages/AccountPage";
import { SubjectGrid } from "@/components/custom-ui/SubjectGrid";



export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <NotFoundPage />,
        children: [
            {
                path: "", element: <ProtectedRoute> <HomePage /> </ProtectedRoute>,
                children: [
                    { path: "", element: <SubjectGrid /> },
                    {
                        path: "subject/:subjectId", element: <><Outlet /></>,
                        children: [
                            { path: "manage/", element: <ManageSubjectPage /> },
                            {
                                path: "assignments/:assignmentId", element: <Outlet />,
                                children: [
                                    { path: "", element: <AssignmentSubmissionsPage /> },
                                    { path: "submission/:submissionId", element: <SubmissionBrowser /> },
                                    { path: "editdescription/", element: <AssignmentDescriptionEditPage /> },
                                    { path: "editdetails/", element: <AssignmentDetailEditPage /> },
                                ]
                            },
                            // { path: "submission/:submissionId", element: <SubmissionPage /> },
                        ]
                    },
                    { path: "createsubject/", element: <CreateSubjectForm /> },
                ],
            },
            { path: "/changepassword", element: <ProtectedRoute> <AccountPage /> </ProtectedRoute> },

            // { path: "register", element: <RegisterPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/student", element: <ProtectedRoute role={["Student"]}> StudentPage </ProtectedRoute> },
            { path: "/teacher", element: <ProtectedRoute role={["Teacher"]}> TeacherPage </ProtectedRoute> },
            { path: "/admin", element: <ProtectedRoute role={["Admin"]}> AdminPage </ProtectedRoute> },
            {
                path: "/auth",
                children: [
                    // { path: "activateaccount/:token", element: <ActivateAccountPage /> },
                    { path: "activateaccount/", element: <ActivateAccountPage /> },
                ],
            },
            { path: "/testing", element: <TestingPage /> },


        ],
    },
]);
