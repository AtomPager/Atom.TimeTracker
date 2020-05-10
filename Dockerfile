#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
RUN curl --silent --location https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install --yes nodejs
WORKDIR /src
COPY ["/src/Atom.Time/", "Atom.Time/"]
RUN dotnet restore "Atom.Time/Atom.Time.csproj"
##COPY . .
WORKDIR "/src/Atom.Time"
RUN dotnet build "Atom.Time.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Atom.Time.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Atom.Time.dll"]