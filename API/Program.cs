using API;
using API.Data;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddPersistance(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSecurityServices(builder.Configuration);
builder.Services.AddCors(x=>{
    x.AddDefaultPolicy(x=>x.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin());
});
var eg;
var app = builder.Build();

await using(var serviceScope = app.Services.CreateAsyncScope()) // "using" is used to dispose of the serviceScope after the block is done executing
{
    var dataContext = serviceScope.ServiceProvider.GetRequiredService<DataContext>(); // Getting the existing dataContext from DependencyInjection file because we have no constructor in Program.cs
    var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<User>>();
    
    // Initialize the database
    await DbInitializer.Initialize(dataContext, userManager);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
