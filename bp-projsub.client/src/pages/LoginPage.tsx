import LoginForm from "@/components/forms/LoginForm";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Hyperlink from "@/components/custom-ui/HyperLink";
import { useAuth } from "@/context/UserContext";


export default function LoginPage() {
    return (
        <div className="flex justify-center">
            <Card className="w-[350px] mt-6">
                <CardHeader>
                    <CardTitle className="mb-2">Login</CardTitle>
                    <hr></hr>
                    <CardDescription>

                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
}
