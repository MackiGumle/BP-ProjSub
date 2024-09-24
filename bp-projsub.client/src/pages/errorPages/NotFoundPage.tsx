import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/UserContext";
import { useLocation } from "react-router-dom";



export function NotFoundPage() {
    return (
        <Card className="m-4 min-w-3">
            <CardHeader>
                <CardTitle>404 Not Found!</CardTitle>
                <CardDescription>
                    Page you are trying to access doensn't exist.
                </CardDescription>
            </CardHeader>
        </Card>
    );
}