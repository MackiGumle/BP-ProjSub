import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UnauthorizedPage() {

    return (
        <Card className="m-4 min-w-3">
            <CardHeader>
                <CardTitle>Not Authorized</CardTitle>
                <CardDescription>
                    You don't have required permission to view this page. 
                </CardDescription>
            </CardHeader>
        </Card>
    );
}