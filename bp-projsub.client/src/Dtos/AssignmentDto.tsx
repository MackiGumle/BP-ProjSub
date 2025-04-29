export interface AssignmentDto {
  id: number
  type?: string
  title: string
  description?: string
  dateAssigned: string
  dueDate?: string
  maxPoints?: number
  isSubmitted?: boolean
  rating?: number
}

export interface CreateAssignmentDto {
  Type: string
  Title: string
  Description?: string
  DateAssigned?: Date | string
  DueDate?: Date | string
  MaxPoints?: number
  SubjectId: number
}

export interface EditAssignmentDto {
  Id: number;
  Type: string;
  Title: string;
  Description?: string;
  DateAssigned: Date;
  DueDate?: Date;
  MaxPoints?: number;
}