using System;
using Microsoft.VisualBasic;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace BP_ProjSub.Server.Services;

public class EmailService
{
    private readonly SendGridClient _client;

    public EmailService()
    {
        _client = new SendGridClient("");
    }

    public async Task<Response> SendAccountActivation(string recipient, string subject, string plainTextContent, string htmlContent)
    {
        var to = new EmailAddress(recipient);
        var from = new EmailAddress("projsub@sengdrid.com");
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        return await _client.SendEmailAsync(msg);
    }
}
