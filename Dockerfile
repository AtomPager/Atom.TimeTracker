#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

ENV ConnectionStrings__SqlDbConnection= AzureAd__Domain= AzureAd__TenantId= AzureAd__ClientId=

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
RUN curl --silent --location https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install --yes nodejs
WORKDIR /src
COPY ["/src/Atoms.Time/", "Atoms.Time/"]
RUN dotnet restore "Atoms.Time/Atoms.Time.csproj"
##COPY . .
WORKDIR "/src/Atoms.Time"
RUN dotnet build "Atoms.Time.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Atoms.Time.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Atoms.Time.dll"]
#HEALTHCHECK --start-period=300s CMD curl --fail http://localhost:80/health || exit
