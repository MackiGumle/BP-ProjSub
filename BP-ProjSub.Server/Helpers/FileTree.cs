using System;

namespace BP_ProjSub.Server.Helpers;

//   id: string;
//   name: string;
//   isSelectable?: boolean;
//   children?: TreeViewElement[];

public class FileTreeNode
{
    public int Id { get; set; } // This is for the frontend to keep track of the nodes
    public string Name { get; set; }
    public bool IsFolder { get; private set; } = false;
    public List<FileTreeNode> Children { get; private set; } = new List<FileTreeNode>();

    public FileTreeNode(int id, string name)
    {
        Id = id;
        Name = name;
    }

    public void AddChild(FileTreeNode child)
    {
        Children.Add(child);
        IsFolder = true;
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
            int id = 1;
            var fileTree = new FileTreeNode(id, rootPath);
            var rootDir = new DirectoryInfo(rootPath);
            var stack = new Stack<(DirectoryInfo, FileTreeNode)>(); // (Directory, ParentNode)

            stack.Push((rootDir, fileTree));

            while (stack.Count > 0)
            {
                var (currentDir, parentNode) = stack.Pop();
                var subDirs = currentDir.GetDirectories();
                foreach (var subDir in subDirs)
                {
                    var subDirNode = new FileTreeNode(++id, subDir.Name);
                    parentNode.AddChild(subDirNode);
                    stack.Push((subDir, subDirNode));
                }

                var files = currentDir.GetFiles();
                foreach (var file in files)
                {
                    parentNode.AddChild(new FileTreeNode(++id, file.Name));
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
