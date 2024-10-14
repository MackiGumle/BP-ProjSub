import CreateAccountForm from "@/components/forms/admin/createAccountForm";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";



export function AdminPage() {

    return (
        <div className="flex justify-center">
            <Card className="sm:w-2/3 lg:w-1/3">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <hr/>
                </CardHeader>
                <CardContent className="flex flex-col space-y-1.5">
                    <CreateAccountForm />
                </CardContent>
            </Card>
        </div>
    );
}