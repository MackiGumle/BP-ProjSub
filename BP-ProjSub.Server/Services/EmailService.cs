using SendGrid;
using SendGrid.Helpers.Mail;

namespace BP_ProjSub.Server.Services;

public class EmailService
{
    private SendGridClient _client;
    private readonly string _apiKey;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public EmailService(IConfiguration config, IWebHostEnvironment env)
    {
        _config = config;
        _apiKey = config["ApiKeys:SendGrid"]!;
        _client = new SendGridClient(_apiKey);
        _env = env;
    }

    /// <summary>
    /// Sends an email to the recipient with the activation link.
    /// </summary>
    /// <param name="recipient"></param>
    /// <param name="token">Token with email confirmation</param>
    /// <returns></returns>
    public async Task<Response> SendAccountActivationAsync(string recipient, string token)
    {
        var from = new EmailAddress("projsubsender@gmail.com", "ProjSub");
        var subject = "ProjSub Account activation";
        var to = new EmailAddress(recipient);

        string activationUrl = $"{_config["WebsiteUrl"]}/auth/ActivateAccount/{token}";

        // Load email template
        string templatePath = Path.Combine(_env.ContentRootPath, "EmailTemplates", "AccountActivation.html");
        string htmlContent = "";

        if (File.Exists(templatePath))
        {
            htmlContent = await File.ReadAllTextAsync(templatePath);
            // Replace placeholder
            htmlContent = htmlContent.Replace("{{ActivationUrl}}", activationUrl);
        }
        else
        {
            // Fallback if template file is missing
            htmlContent = $"<h1><a href=\"{activationUrl}\">Activate your account</a></h1>";
        }

        var plainTextContent = $"Please activate your account by visiting: {activationUrl}";
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        return await _client.SendEmailAsync(msg);
    }
}
