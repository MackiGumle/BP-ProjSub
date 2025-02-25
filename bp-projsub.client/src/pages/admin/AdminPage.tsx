import { AccountsTable } from "@/components/custom-ui/Admin/AccountsTable";
import CurrentUserButton from "@/components/custom-ui/CurrentUserButton";
import CreateAccountForm from "@/components/forms/admin/CreateAccountForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export function AdminPage() {

    return (
        <>
            <div className="absolute top-2 right-2">
                <CurrentUserButton />
            </div>
            <div className="flex flex-col justify-center items-center w-full pt-2">

                <Tabs defaultValue="CreateAccount" className="w-full">
                    <TabsList className="mx-auto flex justify-center w-fit">
                        <TabsTrigger value="CreateAccount">Create Account</TabsTrigger>
                        <TabsTrigger value="Accounts">Accounts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="CreateAccount">
                        <div className="flex justify-center">
                            <Card className="sm:w-2/3 lg:w-1/3">
                                <CardHeader>
                                    <CardTitle>Create Account</CardTitle>
                                    <Separator />
                                </CardHeader>
                                <CardContent className="flex flex-col space-y-1.5">
                                    <CreateAccountForm />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="Accounts">
                        {/* TODO: Account list */}
                        <AccountsTable />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}