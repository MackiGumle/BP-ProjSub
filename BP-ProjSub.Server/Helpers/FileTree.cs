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
}
