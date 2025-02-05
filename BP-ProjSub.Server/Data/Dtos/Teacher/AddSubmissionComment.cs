using System;

namespace BP_ProjSub.Server.Data.Dtos.Teacher;

public class AddSubmissionComment
{
    public int SubmissionId { get; set; }

    public string FileName { get; set; } // has to be with parent folders

    public int LineCommented { get; set; }

    public string Comment { get; set; } = null!;
}
