using System;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos.Auth;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BP_ProjSub.Server.Services;

public class AccountService
{
    private readonly BakalarkaDbContext _dbContext;
    private readonly UserManager<Person> _userManager;
    private readonly EmailService _emailService;

    public AccountService(BakalarkaDbContext dbContext, UserManager<Person> userManager, EmailService emailService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _emailService = emailService;
    }

    public static bool IsLoginFormatValid(string login)
    {
        string pattern = @"^[A-Za-z]{3}\d{1,5}$";
        return Regex.IsMatch(login, pattern);
    }

    /// <summary>
    /// Creates a new account with the given model, adds the user to table coresponding to the role. <br/>
    /// This should be done as a transaction. <br/>
    /// </summary>
    /// <param name="model"></param>
    /// <returns>The created user</returns>
    public async Task<Person> CreateAccountAsync(CreateAccountDto model)
    {
        try
        {
            var user = new Person
            {
                UserName = model.UserName.ToLower(),
                Email = model.Email
            };

            // Check if user already exists
            var userFromDB = await _userManager.FindByEmailAsync(model.Email);
            if (userFromDB != null)
            {
                throw new InvalidOperationException($"User with email '{model.Email}' already exists.");
            }

            // Create user
            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create user {user.UserName} {user.Email}.");
            }

            // Add user to role
            var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
            if (!roleResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed to add user {user.UserName} to role {model.Role}.");
            }

            // Create entry in table for specific role
            switch (model.Role)
            {
                case "Admin":
                    var admin = new Admin
                    {
                        Person = user
                    };

                    await _dbContext.Admins.AddAsync(admin);
                    break;

                case "Teacher":
                    var teacher = new Teacher
                    {
                        Person = user
                    };

                    await _dbContext.Teachers.AddAsync(teacher);
                    break;

                case "Student":
                    var student = new Student
                    {
                        Person = user
                    };

                    await _dbContext.Students.AddAsync(student);
                    break;
                default:
                    throw new InvalidOperationException($"Role {model.Role} is invalid.");
            }

            return user;
        }
        catch
        {
            throw;
        }
    }

    /// <summary>
    /// Creates students from the given logins. <br/>
    /// Student logins must be in the format '^[A-Za-z]{3}\d{1,5}$' <br/>
    /// logins are case insensitive <br/>
    /// If login already exists, it will be skipped. <br/>
    /// </summary>
    /// <param name="studentLogins">Valid list of logins</param>
    /// <returns>The created users</returns>
    public async Task<List<Person>> CreateStudentAccountsFromLoginsAsync(List<string> studentLogins)
    {
        if (studentLogins == null || studentLogins.Count == 0)
        {
            throw new InvalidOperationException("No student logins provided.");
        }

        studentLogins = studentLogins.Select(s => s.ToLower()).ToList();

        // No multi role support
        var existingUsers = _dbContext.Users
            .Where(u => studentLogins.Contains(u.UserName!))
            .ToList();

        if (existingUsers != null)
        {
            // Remove existing users from the list
            studentLogins = studentLogins.Except(existingUsers.Select(u => u.UserName!)).ToList();
        }

        List<Person> newPeople = new List<Person>();
        try
        {
            foreach (var login in studentLogins)
            {
                if (!IsLoginFormatValid(login))
                {
                    throw new InvalidOperationException($"Login '{login}' is not in the correct format.");
                }

                var newStudent = new CreateAccountDto
                {
                    UserName = login,
                    Email = $"{login}@vsb.cz",
                    Role = "Student"
                };

                // This throws an exception if the login already exists
                var student = await CreateAccountAsync(newStudent);
                newPeople.Add(student);
            }

            return newPeople;
        }
        catch
        {
            throw;
        }
    }
}
