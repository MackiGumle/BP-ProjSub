export default interface AssignmentDto {
    id: number
    type?: string
    title: string
    description?: string
    dateAssigned: string
    dueDate?: string
    maxPoints?: number
  }