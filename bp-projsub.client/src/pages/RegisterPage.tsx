import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import ReactRouterLink from "@/components/custom-ui/HyperLink";
import CreateAccountForm from "@/components/forms/admin/createAccountForm";


export default function RegisterPage() {
    return (
        <div className="flex justify-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Already have an account?
                        <ReactRouterLink link="/login" text="Login here." />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateAccountForm />
                </CardContent>
            </Card>
        </div>
    );
}
