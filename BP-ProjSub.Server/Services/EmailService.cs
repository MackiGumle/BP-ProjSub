using System;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace BP_ProjSub.Server.Services;

public class EmailService
{
    private SendGridClient _client;
    private readonly string _apiKey;
    private readonly IConfiguration _config;
    private readonly TokenService _tokenService;

    public EmailService(IConfiguration config)
    {
        _config = config;
        _apiKey = config["ApiKeys:SendGrid"];
        _client = new SendGridClient(_apiKey);
    }
    
    public async Task<Response> SendAccountActivation(string recipient, string token)
    {
        // var client = new SendGridClient(_apiKey);
        // var encodedToken = Uri.EscapeDataString(token);
        //var encodedToken = Base64UrlEncoder.Encode(token);
        var from = new EmailAddress("projsubsender@gmail.com", "ProjSub");
        var subject = "ProjSub Account activation";
        var to = new EmailAddress(recipient);
        var plainTextContent = "";
        var htmlContent = $"<h1><a href=\"{_config["WebsiteUrl"]}/auth/ActivateAccount/{token}\">Activate your account<\\a></h1>";
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        return await _client.SendEmailAsync(msg);
    }
}
