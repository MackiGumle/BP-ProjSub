using System;
using Azure.Storage.Blobs;

namespace BP_ProjSub.Server.Helpers;

public class BlobStorageHelper
{
    public static async Task DeleteBlobsWithPrefixAsync(BlobContainerClient containerClient, string prefix)
    {
        await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
        {
            await containerClient.DeleteBlobAsync(blobItem.Name);
        }
    }
}
