import * as React from "react"
import { ThemeToggle } from "@/components/theme-components/theme-toggle"
import { Calendar } from "@/components/ui/calendar"
import { SimpleTimePicker } from "@/components/ui/simple-time-picker";
import { CreateAssignmentForm } from "@/components/forms/teacher/CreateAssignmentForm";
// import { CreateAssignmentForm } from "@/components/forms/teacher/CreateAssignmentForm";



export function TestingPage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [selected, setSelected] = React.useState<Date>();


    return (
        <>
{/* <CreateAssignmentDialog /> */}
<CreateAssignmentForm subjectId={1} />
        <ThemeToggle />
            <SimpleTimePicker 
                value={date || new Date()} 
                onChange={setDate} 
            />
 {/*
            <CreateAssignmentForm />


            <Dialog>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DialogTrigger asChild>

                            <DropdownMenuCheckboxItem
                                checked={showStatusBar}
                                onCheckedChange={setShowStatusBar}
                            >
                                Status Bar
                            </DropdownMenuCheckboxItem>
                        </DialogTrigger>
                        <DropdownMenuCheckboxItem
                            checked={showActivityBar}
                            onCheckedChange={setShowActivityBar}
                            disabled
                        >
                            Activity Bar
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showPanel}
                            onCheckedChange={setShowPanel}
                        >
                            Panel
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Are you sure you want to permanently
                            delete this file from our servers?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="submit">Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </>
    )
}
