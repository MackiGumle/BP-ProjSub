import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";

export function UnauthorizedPage() {
    const location = useLocation(); 

    return (
        <Card className="m-4 min-w-3">
            <CardHeader>
                <CardTitle>Not Authorized</CardTitle>
                <CardDescription>
                    You don't have required authorization to view this page. 
                </CardDescription>
            </CardHeader>
        </Card>
    );
}