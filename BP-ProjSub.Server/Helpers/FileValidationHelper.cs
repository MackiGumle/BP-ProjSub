using System;
using System.IO.Compression;

namespace BP_ProjSub.Server.Helpers;

public class FileValidationHelper
{
    /// <summary>
    /// Validate file extension
    /// </summary>
    /// <param name="fileName"></param>
    /// <param name="allowedExtensions"></param>
    /// <returns></returns>
    public static bool IsValidFileExtension(string extension, IEnumerable<string> allowedExtensions)
    {
        return allowedExtensions.Contains("*") || allowedExtensions.Contains(extension);
    }

    /// <summary>
    /// Validate file size
    /// </summary>
    /// <param name="file"></param>
    /// <param name="maxFiles"></param>
    /// <param name="maxFileSize"></param>
    /// <returns>
    /// File count <br/>
    /// Total size of files
    /// </returns>
    /// <exception cref="Exception"></exception>
    public static (int, long) ValidateZipFileSize(IFormFile file, int? maxFiles, long? maxFileSize)
    {
        int fileCount = 0;
        long totalSize = 0;

        using (var zipStream = file.OpenReadStream())
        using (var archive = new ZipArchive(zipStream))
        {
            if (maxFiles.HasValue && ((fileCount += archive.Entries.Count) > maxFiles))
            {
                throw new Exception($"Maximum number of files exceeded. Max files: {maxFiles}.");
            }

            if (maxFileSize.HasValue)
            {
                foreach (var entry in archive.Entries)
                {
                    if (entry.Length > maxFileSize)
                    {
                        throw new Exception($"File {entry.Name} in zip exceeds the maximum filesize of {maxFileSize} bytes.");
                    }

                    totalSize += entry.Length;
                }
            }
            else
            {
                totalSize = archive.Entries.Sum(entry => entry.Length);
            }
        }

        return (fileCount, totalSize);
    }

    // public static bool ValidatePathTraversal(string path, string allowedRootPath)
    // {
    //     if (path.Contains(".."))
    //     {
    //         return false;
    //     }

        
    //     return Path.GetFullPath(path).StartsWith(allowedRootPath);
    // }

    // public static void ValidateZipEntries(IFormFile file)
    // { // TODO: Implement this method
    //     using (var zipStream = file.OpenReadStream())
    //     using (var archive = new ZipArchive(zipStream))
    //     {
    //         foreach (var entry in archive.Entries)
    //         {
    //             var fullPath = Path.GetFullPath(entry.FullName);

    //             if (entry.FullName.Contains(".."))
    //             {
    //                 throw new Exception("Invalid file path.");
    //             }
    //         }
    //     }
    // }
}
