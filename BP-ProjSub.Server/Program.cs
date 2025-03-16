using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BP_ProjSub.Server.Services;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Configuration.EnvironmentVariables;
using Azure.Storage.Blobs;


namespace BP_ProjSub.Server
{
    public class Program
    {
        private static void ValidateEnvironmentVariable(string variableName)
        {
            var value = Environment.GetEnvironmentVariable(variableName);
            if (string.IsNullOrEmpty(value))
            {
                throw new InvalidOperationException($"Environment variable '{variableName}' is not set.");
            }
        }

        private static void ValidateAppSettings(IConfiguration configuration, string key)
        {
            var value = configuration[key];
            if (string.IsNullOrEmpty(value))
            {
                throw new InvalidOperationException($"App setting '{key}' is not set.");
            }
        }

        private static void ValidateAppSettingsArray(IConfiguration configuration, string key)
        {
            var values = configuration.GetSection(key).Get<string[]>();
            if (values == null || values.Length == 0)
            {
                throw new InvalidOperationException($"App setting '{key}' is not set or is empty.");
            }
        }

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // var api = builder.Configuration["ApiKeys:SendGrid"];

            // Validating environment variables
            ValidateEnvironmentVariable("ApiKeys__SendGrid");
            ValidateEnvironmentVariable("ConnectionStrings__BakalarkaDB");
            ValidateEnvironmentVariable("WebsiteUrl");
            ValidateEnvironmentVariable("ConnectionStrings__BakalarkaBlob");

            // Validating appsettings.json configurations
            ValidateAppSettings(builder.Configuration, "Uploads:MaxFileSize");
            ValidateAppSettings(builder.Configuration, "Uploads:MaxTotalSize");
            ValidateAppSettingsArray(builder.Configuration, "Uploads:AllowedFileExtensions");
            ValidateAppSettings(builder.Configuration, "Jwt:Issuer");
            ValidateAppSettings(builder.Configuration, "Jwt:Audience");
            ValidateAppSettings(builder.Configuration, "Jwt:Key");
            ValidateAppSettings(builder.Configuration, "Jwt:ExpirationInMinutes");

            var debugView = builder.Configuration.GetDebugView();
            Console.WriteLine($"[i] Debug view: {debugView}");

            // Add services to the container.
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            // builder.Services.AddSwaggerGen();
            builder.Services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });
                option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });
                option.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                    new string[]{}
                    }
                });
            });

            // DB connection
            builder.Services.AddDbContext<BakalarkaDbContext>(options =>
                options.UseSqlServer(builder.Configuration["ConnectionStrings__BakalarkaDB"]));

            // Identity service configuration
            builder.Services.AddIdentity<Person, IdentityRole>(options =>
            {
                options.SignIn.RequireConfirmedAccount = true;
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
            }).AddDefaultTokenProviders()
                .AddEntityFrameworkStores<BakalarkaDbContext>();

            // JWT configuration
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AccountActivation", policy => policy.RequireClaim("AccountActivation"));
            });


            builder.Services.AddSingleton<EmailService>();
            builder.Services.AddScoped<TokenService>();
            builder.Services.AddScoped<AccountService>();
            builder.Services.AddScoped<SubjectService>();
            builder.Services.AddScoped<StudentService>();
            builder.Services.AddScoped<ResourceAccessService>();




            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseCors(options =>
                {
                    options.AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithOrigins("http://localhost:5173");
                });
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseMiddleware<LockoutMiddleware>();
            app.UseAuthorization();

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
