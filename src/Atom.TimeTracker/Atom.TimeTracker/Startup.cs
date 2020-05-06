using System;
using System.Globalization;
using Atom.TimeTracker.Database;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Atom.TimeTracker
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAntiforgery(options => { options.HeaderName = "X-XSRF-TOKEN";});
            services.AddControllersWithViews();

            services.AddMvc(options => options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()))
                .AddJsonOptions(
                options =>
                {
                    options.JsonSerializerOptions.IgnoreNullValues = true;
                }); ;
           
            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            services.AddDbContext<TimeSheetContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("SqlDbConnection")));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IAntiforgery antiForgery)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");

                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            // SEE: https://docs.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-2.2#configure-antiforgery-features-with-iantiforgery
            app.Use(next => context =>
            {
                string path = context.Request.Path.Value;

                if (!string.IsNullOrWhiteSpace(path))
                {
                    if (
                        string.Equals(path, "/", StringComparison.OrdinalIgnoreCase) ||
                        !(
                            path.StartsWith("/static", true, CultureInfo.InvariantCulture) ||
                            path.StartsWith("/css", true, CultureInfo.InvariantCulture) ||
                            path.StartsWith("/js", true, CultureInfo.InvariantCulture) ||
                            path.StartsWith("/lib", true, CultureInfo.InvariantCulture) ||
                            path.StartsWith("/api", true, CultureInfo.InvariantCulture)
                        ))
                    {
                        // The request token can be sent as a JavaScript-readable cookie, 
                        // Angular and Axios JS uses it by default.
                        var tokens = antiForgery.GetAndStoreTokens(context);
                        context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken,
                            new CookieOptions() { HttpOnly = false, SameSite = SameSiteMode.Strict, Secure = true});
                    }
                }

                return next(context);
            });

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });

        }
    }
}
