using System;
using System.Security;

namespace BP_ProjSub.Server.Helpers;

public class PathHelper
{
    /// <summary>
    /// Checks if a file name is valid.
    /// </summary>
    /// <param name="fileName"></param>
    /// <returns></returns>
    public static bool IsValidFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return false;

        // Check for invalid characters
        return fileName.IndexOfAny(Path.GetInvalidFileNameChars()) < 0;
    }

    /// <summary>
    /// Sanitizes a file name by removing invalid characters.
    /// </summary>
    /// <param name="fileName"></param>
    /// <returns></returns>
    public static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        return new string(fileName
            .Where(ch => !invalidChars.Contains(ch))
            .ToArray());
    }

    /// <summary>
    /// Ensures that a path is safe by checking if it is a subdirectory of a base path.
    /// </summary>
    /// <param name="basePath"></param>
    /// <param name="fullPath"></param>
    /// <exception cref="SecurityException"></exception>
    public static void EnsureSafePath(string basePath, string fullPath)
    {
        var resolvedPath = Path.GetFullPath(fullPath);
        if (!resolvedPath.StartsWith(Path.GetFullPath(basePath)))
        {
            throw new SecurityException("Potential directory traversal detected.");
        }
    }

}
