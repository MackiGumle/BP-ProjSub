import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export function NotFoundPage() {
    return (
        <Card className="m-4 min-w-3">
            <CardHeader>
                <CardTitle>404 Not Found!</CardTitle>
                <CardDescription>
                    Page you are trying to access doesn't exist.
                </CardDescription>
            </CardHeader>
        </Card>
    );
}