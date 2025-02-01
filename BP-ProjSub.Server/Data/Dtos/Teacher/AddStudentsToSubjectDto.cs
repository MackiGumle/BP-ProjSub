using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos;

public class StudentLoginsAndSubjectDto
{
    [Required]
    public int SubjectId { get; set; }

    [Required]
    public List<string> StudentLogins { get; set; }
}
