import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Hyperlink from "@/components/custom-ui/HyperLink";
import RegisterForm from "@/components/forms/RegisterForm";


export default function RegisterPage() {
    return (
        <div className="flex justify-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Already have an account?
                        <Hyperlink link="/login" text="Login here." />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />
                </CardContent>
            </Card>
        </div>
    );
}
