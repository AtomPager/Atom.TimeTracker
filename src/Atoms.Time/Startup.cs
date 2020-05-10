using System;
using System.Globalization;
using Atoms.Time.Database;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.AzureAD.UI;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Atoms.Time
{
    public class Startup
    {
        public static readonly PathString pathRootPath = new PathString("/api");

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAntiforgery(options => { options.HeaderName = "X-XSRF-TOKEN"; });

            var authProvider = Configuration.GetValue<string>("AuthenticationProvider");


            if ("AzureAd".Equals(authProvider, StringComparison.OrdinalIgnoreCase))
            {
                services
                    .AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = AzureADDefaults.AuthenticationScheme;
                        options.DefaultChallengeScheme = AzureADDefaults.AuthenticationScheme;
                    })
                    .AddAzureAD(options =>
                    {
                        options.Instance = "https://login.microsoftonline.com/";
                        options.CallbackPath = "/signin-oidc";
                        options.SignedOutCallbackPath = "/signout-oidc";
                        Configuration.Bind("AzureAd", options);
                    });
            }
            else if ("Google".Equals(authProvider, StringComparison.OrdinalIgnoreCase))
            {
                services.AddAuthentication(AzureADDefaults.AuthenticationScheme)
                    .AddGoogle(options =>
                    {
                        Configuration.Bind("Google", options);
                        //options.CookieSchemeName = CookieAuthenticationDefaults.AuthenticationScheme;
                    });
            }
            else
            {
                services.AddAuthentication(options =>
                    {
                        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                        options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
                    })
                    .AddCookie()
                    .AddOpenIdConnect(o => Configuration.Bind("OpenId", o));
            }

            services.AddAuthorization(options =>
            {
                options.AddPolicy(AuthPolicy.Administrator, policy => policy.RequireAuthenticatedUser().RequireRole(AppRoles.Administrator));
                options.AddPolicy(AuthPolicy.TimeSheet, policy => policy.RequireAuthenticatedUser().RequireRole(AppRoles.TimeSheet, AppRoles.Administrator));
            });

            services.AddControllersWithViews();

            services.AddMvc(options =>
                {
                    var policy = new AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .Build();
                    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
                    options.Filters.Add(new AuthorizeFilter(policy));
                })
                .AddJsonOptions(
                options =>
                {
                    options.JsonSerializerOptions.IgnoreNullValues = true;

                }).ConfigureApiBehaviorOptions(options =>
                {
                    // options.SuppressModelStateInvalidFilter = true;
                    // options.SuppressInferBindingSourcesForParameters = true;
                });

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

            if (Configuration.GetValue("UseReverseProxy", false))
                // This is needed if running behind a reverse proxy
                app.UseForwardedHeaders(new ForwardedHeadersOptions
                {
                    RequireHeaderSymmetry = false,
                    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
                });

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseAuthentication();

            // This will force the Auth on all the request including the SPA.
            // UseAuthorization() is not sending the Challenge for SPA content.
            // Also, We want to return 401 not a redirect for our APIs.
            app.Use(async (context, next) =>
            {
                if (!context.User.Identity.IsAuthenticated
                   && !context.Request.Path.Value.Equals("/manifest.json")
                   && !context.Request.Path.Value.Equals("/favicon.ico")
                   && !context.Request.Path.Value.Equals("/Atoms.svg")
                    )
                {
                    if (context.Request.Path.StartsWithSegments(pathRootPath))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await context.Response.CompleteAsync();
                        return;
                    }

                    await context.ChallengeAsync(AzureADDefaults.AuthenticationScheme);
                }
                else
                {
                    await next();
                }
            });

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
                            new CookieOptions() { HttpOnly = false, SameSite = SameSiteMode.Strict, Secure = true });
                    }
                }

                return next(context);
            });

            app.UseRouting();
            app.UseAuthorization();

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
