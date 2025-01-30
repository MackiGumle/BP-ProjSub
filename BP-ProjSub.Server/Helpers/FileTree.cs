using System;

namespace BP_ProjSub.Server.Helpers;

public class FileTreeNode
{
    public string Name { get; set; }
    public bool IsFolder { get; private set; } = false;
    public List<FileTreeNode> Children { get; private set; } = new List<FileTreeNode>();

    public FileTreeNode(string name)
    {
        Name = name;
    }

    public void AddChild(FileTreeNode child)
    {
        Children.Add(child);
        IsFolder = true;
    }

    public void AddChildren(List<FileTreeNode> children)
    {
        Children.AddRange(children);
    }

    /// <summary>
    /// Creates a file tree from a given path. <br/>
    /// Can throw exceptions if the path is invalid.
    /// </summary>
    /// <param name="rootPath"></param>
    /// <returns></returns>
    public static FileTreeNode CreateFromPath(string rootPath)
    {
        try
        {
            var fileTree = new FileTreeNode(rootPath);
            var rootDir = new DirectoryInfo(rootPath);
            var stack = new Stack<(DirectoryInfo, FileTreeNode)>(); // (Directory, ParentNode)

            stack.Push((rootDir, fileTree));

            while (stack.Count > 0)
            {
                var (currentDir, parentNode) = stack.Pop();
                var subDirs = currentDir.GetDirectories();
                foreach (var subDir in subDirs)
                {
                    var subDirNode = new FileTreeNode(subDir.Name);
                    parentNode.AddChild(subDirNode);
                    stack.Push((subDir, subDirNode));
                }

                var files = currentDir.GetFiles();
                foreach (var file in files)
                {
                    parentNode.AddChild(new FileTreeNode(file.Name));
                }
            }

            return fileTree;
        }
        catch
        {
            throw;
        }
    }
}
