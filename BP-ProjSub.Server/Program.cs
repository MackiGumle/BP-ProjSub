
using BP_ProjSub.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // var connection = String.Empty;
            // if (builder.Environment.IsDevelopment())
            // {
            //     builder.Configuration.AddEnvironmentVariables().AddJsonFile("appsettings.Development.json");
            //     connection = builder.Configuration.GetConnectionString("AZURE_SQL_CONNECTIONSTRING");
            // }
            // else
            // {
            //     connection = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING"); // ???
            // }

            builder.Services.AddDbContext<BakalarkaDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));



            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
