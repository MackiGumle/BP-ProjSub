using System;
using Microsoft.VisualBasic;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace BP_ProjSub.Server.Services;

public class EmailService
{
    private SendGridClient _client;
    private readonly string _apiKey;

    public EmailService(IConfiguration config)
    {
        _apiKey = config["ApiKeys:SendGrid"];
        _client = new SendGridClient(_apiKey);
    }

    public async Task<Response> SendAccountActivation(string recipient, string token)
    {
        var client = new SendGridClient(_apiKey);
        var from = new EmailAddress("projsubsender@gmail.com", "ProjSub");
        var subject = "Sending with SendGrid is Fun";
        var to = new EmailAddress(recipient);
        var plainTextContent = "and easy to do anywhere, even with C#";
        var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        return await client.SendEmailAsync(msg);
    }
}
