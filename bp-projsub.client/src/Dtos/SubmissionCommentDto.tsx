export interface AddSubmissionCommentDto {
  submissionId: string;
  fileName: string;
  lineCommented: number;
  comment: string;
}

export interface SubmissionCommentDto {
  id: number;
  commentDate: string;
  fileName: string;
  lineCommented: number;
  comment: string;
}

