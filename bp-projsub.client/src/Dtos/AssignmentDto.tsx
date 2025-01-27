export interface AssignmentDto {
  id: number
  type?: string
  title: string
  description?: string
  dateAssigned: string
  dueDate?: string
  maxPoints?: number
}

export interface CreateAssignmentDto {
  type: string
  title: string
  description?: string
  dueDate?: Date | string
  maxPoints?: number
  subjectId: number
}
