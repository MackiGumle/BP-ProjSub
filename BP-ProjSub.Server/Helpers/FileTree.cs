using System;
using System.IO.Compression;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

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


    public static async Task<FileTreeNode> BuildFileTreeFromBlobStorageAsync(BlobContainerClient containerClient, string prefix)
    {
        int id = 1;

        var root = new FileTreeNode(id, prefix.TrimEnd('/'));

        id = await PopulateTreeAsync(containerClient, prefix, root, id);
        return root;
    }

    public static async Task<int> PopulateTreeAsync(BlobContainerClient containerClient, string prefix, FileTreeNode parentNode, int currentId)
    {
        // List blobs and virtual directories under the prefix
        await foreach (BlobHierarchyItem item in containerClient.GetBlobsByHierarchyAsync(prefix: prefix, delimiter: "/"))
        {
            if (item.IsPrefix)
            { // Check if it's a virtual directory
                string folderName = item.Prefix.TrimEnd('/').Split('/').Last();
                var folderNode = new FileTreeNode(++currentId, folderName);
                parentNode.AddChild(folderNode);

                currentId = await PopulateTreeAsync(containerClient, item.Prefix, folderNode, currentId);
            }
            else
            {
                string fileName = item.Blob.Name.Split('/').Last();
                parentNode.AddChild(new FileTreeNode(++currentId, fileName));
            }
        }

        return currentId;
    }

    public async Task ZipFilesAsync(ZipArchive zipArchive, BlobContainerClient containerClient, string currentPath = "")
    {
        foreach (var child in Children)
        {
            var childPath = string.IsNullOrEmpty(currentPath) ? child.Name : $"{currentPath}/{child.Name}";
            if (child.IsFolder)
            {
                await child.ZipFilesAsync(zipArchive, containerClient, childPath);
            }
            else
            {
                var blobClient = containerClient.GetBlobClient(childPath);
                var downloadResponse = await blobClient.DownloadContentAsync();
                var entry = zipArchive.CreateEntry(childPath);
                using (var entryStream = entry.Open())
                {
                    await downloadResponse.Value.Content.ToStream().CopyToAsync(entryStream);
                }
            }
        }
    }
}