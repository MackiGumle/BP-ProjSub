import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { ThemeToggle } from '@/components/theme-components/theme-toggle';
import { UppyDragDrop } from '@/components/custom-ui/UppyDragDrop';




export function TestingPage() {
   
    return (
        <>
            <UppyDragDrop assignmentId={2} />
            <ThemeToggle />

        </>
    )
}