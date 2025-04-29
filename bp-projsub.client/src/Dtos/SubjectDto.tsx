export interface SubjectDto {
    id: number
    name: string
    description?: string
    studentCount: number
}

export interface CreateSubjectDto {
    name: string;
    description?: string;
    studentLogins?: string[];
}
