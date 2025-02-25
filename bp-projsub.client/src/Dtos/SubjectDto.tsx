export interface SubjectDto {
    id: number
    name: string
    description?: string
}

export interface CreateSubjectDto {
    name: string;
    description?: string;
    studentLogins?: string[];
}
