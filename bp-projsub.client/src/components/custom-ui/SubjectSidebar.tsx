// import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import axios, { AxiosError } from 'axios'
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Skeleton } from '@/components/ui/skeleton'
// import { ChevronDown } from 'lucide-react'
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from '@/components/ui/dialog'
// import { CreateSubjectForm } from '../forms/teacher/CreateSubjectForm'

// interface Subject {
//     id: number
//     name: string
// }

// interface Assignment {
//     id: string
//     title: string
//     description: string
//     dueDate: string
// }

// export function SubjectSidebar() {
//     const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
//     const [dialogOpen, setDialogOpen] = useState(false)

//     const { data: subjects, isLoading: loadingSubjects, refetch } = useQuery<Subject[], AxiosError>({
//         queryKey: ['subjects'],
//         queryFn: async () => {
//             const response = await axios.get('/api/Teacher/GetSubjects')
//             return response.data
//         },
//         staleTime: 1000 * 60 * 5,
//     })

//     // Fetch assignments on subject select
//     const { data: assignments, isLoading: loadingAssignments } = useQuery<Assignment[], AxiosError>({
//         queryKey: ['assignments', selectedSubject?.id],
//         queryFn: async () => {
//             const response = await axios.get(`/api/assignments?subjectId=${selectedSubject?.id}`)
//             return response.data
//         },
//         enabled: !!selectedSubject?.id,
//         staleTime: 1000 * 60 * 5,
//     })

//     const handleSubjectCreated = () => {
//         setDialogOpen(false)
//         refetch()
//     }

//     return (
//         <div className="flex h-screen">
//             {/* Create Subject Dialog */}
//             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//                 <DialogTrigger className="hidden" />
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Create New Subject</DialogTitle>
//                     </DialogHeader>
//                     <CreateSubjectForm onSuccess={handleSubjectCreated} />
//                 </DialogContent>
//             </Dialog>

//             {/* Sidebar */}
//             <div className="w-64 border-r">
//                 <div className="p-4 border-b">
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" className="w-full justify-between">
//                                 {selectedSubject?.name || 'Select Subject'}
//                                 <ChevronDown className="h-4 w-4" />
//                             </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent className="w-56">
//                             <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
//                                 Create New Subject
//                             </DropdownMenuItem>
//                             {loadingSubjects ? (
//                                 Array.from({ length: 3 }).map((_, i) => (
//                                     <Skeleton key={i} className="h-8 w-full mb-1" />
//                                 ))
//                             ) : (
//                                 subjects?.map((subject) => (
//                                     <DropdownMenuItem
//                                         key={subject.id}
//                                         onSelect={() => setSelectedSubject(subject)}
//                                     >
//                                         {subject.name}
//                                     </DropdownMenuItem>
//                                 ))
//                             )}
//                         </DropdownMenuContent>
//                     </DropdownMenu>
//                 </div>

//                 {/* Assignments List */}
//                 <ScrollArea className="h-[calc(100vh-65px)]">
//                     <div className="p-4 space-y-2">
//                         {loadingAssignments ? (
//                             Array.from({ length: 5 }).map((_, i) => (
//                                 <Skeleton key={i} className="h-16 w-full" />
//                             ))
//                         ) : assignments?.length ? (
//                             assignments.map((assignment) => (
//                                 <div
//                                     key={assignment.id}
//                                     className="p-3 rounded-md hover:bg-accent transition-colors"
//                                 >
//                                     <h4 className="font-medium">{assignment.title}</h4>
//                                     <p className="text-sm text-muted-foreground">
//                                         {assignment.description}
//                                     </p>
//                                     <p className="text-xs text-muted-foreground mt-1">
//                                         Due: {new Date(assignment.dueDate).toLocaleDateString()}
//                                     </p>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="text-center text-muted-foreground py-4">
//                                 No assignments found
//                             </div>
//                         )}
//                     </div>
//                 </ScrollArea>
//             </div>

//             {/* Main Content Area */}
//             <div className="flex-1 p-8">
//                 {selectedSubject ? (
//                     <div>
//                         <h1 className="text-2xl font-bold mb-4">{selectedSubject.name}</h1>
//                         {/* Add main content here */}
//                     </div>
//                 ) : (
//                     <div className="text-center text-muted-foreground mt-20">
//                         Select a subject to view details
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }