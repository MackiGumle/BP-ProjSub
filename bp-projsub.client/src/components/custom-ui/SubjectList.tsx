// import { useEffect } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import axios, { AxiosError } from 'axios'
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Skeleton } from '@/components/ui/skeleton'

// interface Subject {
//   id: number
//   name: string
//   description: string | null
// }

// export function SubjectsList() {
//   const { data: subjects, isLoading, error } = useQuery<Subject[], AxiosError<{ message: string }>>({
//     queryKey: ['subjects'],
//     queryFn: async () => {
//       const response = await axios.get('/api/Teacher/GetSubjects')
//       return response.data

//     },
//     staleTime: 1000 * 60 * 5
//   })

//   if (error) {
//     return (
//       <div className="p-4 text-red-500">
//         Error loading subjects: {error.message}
//       </div>
//     )
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="text-2xl">Subjects List</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Description</TableHead>
//               {/* <TableHead>Language</TableHead>
//               <TableHead>Created At</TableHead> */}
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {isLoading ? (
//               // Loading skeleton
//               Array.from({ length: 5 }).map((_, index) => (
//                 <TableRow key={index}>
//                   <TableCell>
//                     <Skeleton className="h-4 w-[150px]" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-4 w-[200px]" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-4 w-[100px]" />
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : subjects?.length ? (
//               subjects.map((subject) => (
//                 <TableRow key={subject.id}>
//                   <TableCell className="font-medium">{subject.name}</TableCell>
//                   <TableCell>{subject.description || '-'}</TableCell>
//                   <TableCell>
//                     <div className="flex gap-2">
//                       <Button variant="outline" size="sm">
//                         Edit
//                       </Button>
//                       <Button variant="destructive" size="sm">
//                         Delete
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} className="h-24 text-center">
//                   No subjects found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   )
// }


import { useQuery } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface Subject {
  id: number
  name: string
  description: string | null
}

export function SubjectsList() {
  const { data: subjects, isLoading, error } = useQuery<Subject[], AxiosError<{ message: string }>>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await axios.get('/api/Teacher/GetSubjects')
      return response.data
    },
    staleTime: 1000 * 60 * 5
  })

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading subjects: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4 space-x-4">
      <h2 className="text-2xl font-bold">Subjects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-[200px]">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))
        ) : subjects?.length ? (
          subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {subject.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No subjects found
          </div>
        )}
      </div>
    </div>
  )
}