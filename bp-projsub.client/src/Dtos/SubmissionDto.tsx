import { AssignmentViewLogDto } from "./AssignmentViewLogDto"

export interface PartialSubmissionDto {
  id: number
  submissionDate: string
  assignmentId: number
  personId: number
  studentLogin: string
  rating: number
  isSuspicious: boolean
  assignmentViewLogs: AssignmentViewLogDto[]
}