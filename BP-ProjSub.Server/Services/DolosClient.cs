using System;
using System.Net.Http.Headers;
using System.Text.Json.Serialization;

namespace BP_ProjSub.Server.Helpers;

public class DolosClientService
{
    private readonly HttpClient _httpClient;

    public DolosClientService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    /// <summary>
    /// Submits a dataset to Dolos for analysis.
    /// </summary>
    /// <param name="name"></param>
    /// <param name="zipfilePath"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    /// <exception cref="HttpRequestException"></exception>
    /// <exception cref="InvalidOperationException"></exception>
    public async Task<string> SubmitToDolosAsync(string name, string zipfilePath)
    {
        if (string.IsNullOrEmpty(name))
            throw new ArgumentException("Dataset name must be provided.", nameof(name));

        if (string.IsNullOrEmpty(zipfilePath) || !File.Exists(zipfilePath))
            throw new ArgumentException("A valid ZIP file path must be provided.", nameof(zipfilePath));

        using var form = new MultipartFormDataContent();
        using var fileStream = new FileStream(zipfilePath, FileMode.Open, FileAccess.Read);
        using var streamContent = new StreamContent(fileStream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue("application/zip");

        form.Add(new StringContent(name), "dataset[name]");
        form.Add(streamContent, "dataset[zipfile]", Path.GetFileName(zipfilePath));

        HttpResponseMessage response = await _httpClient.PostAsync("https://dolos.ugent.be/api/reports", form);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Request to Dolos API failed with status code {response.StatusCode}.");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var result = System.Text.Json.JsonSerializer.Deserialize<DolosResponse>(jsonResponse);

        if (result == null)
            throw new InvalidOperationException("Failed to deserialize response from Dolos API.");

        return result.HtmlUrl;
    }
}

public class DolosResponse
{
    [JsonPropertyName("html_url")]
    public string HtmlUrl { get; set; }
}
