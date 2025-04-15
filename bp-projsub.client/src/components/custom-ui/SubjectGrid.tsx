import { BookOpen, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjectsQuery } from "@/hooks/useCustomQuery";
import { useAuth } from "@/context/UserContext";
import { Button } from "../ui/button";

function SubjectSkeletonCard() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2">
                <Skeleton className="aspect-square size-10 rounded-lg" />
                <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
        </Card>
    );
}

export function SubjectGrid() {
    const { hasRole } = useAuth();
    const { data: subjects, isLoading, error } = useSubjectsQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
                {Array(8).fill(0).map((_, index) => (
                    <SubjectSkeletonCard key={index} />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center p-8 text-red-500">Error loading subjects</div>;
    }

    if (!subjects || subjects.length === 0) {
        return <div className="flex justify-center p-8">No subjects found</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 m-4">
            {subjects.map((subject) => (
                <Link to={`/subject/${subject.id}`} key={subject.id}>
                    <Card className="hover:bg-accent transition-colors cursor-pointer h-full shadow-sm hover:shadow-md">
                        <CardHeader className="flex flex-row items-center gap-3 p-2">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-auto">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="truncate">{subject.name}</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground max-h-10 overflow-y-auto">
                                    {subject.description || "No description"}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        {/* <CardContent className="px-5 pb-5">

                        </CardContent> */}
                    </Card>
                </Link>
            ))}
        </div>
    );
}
