using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos;

public class RenameAttachmentFileDto
{
    [Required]
    public string OldFileName { get; set; }
    [Required]
    public string NewFileName { get; set; }
}
