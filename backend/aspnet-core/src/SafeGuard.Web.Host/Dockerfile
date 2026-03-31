FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src
COPY ["SafeGuard.sln", "./"]
COPY ["NuGet.Config", "./"]
COPY ["src/SafeGuard.Web.Host/SafeGuard.Web.Host.csproj", "src/SafeGuard.Web.Host/"]
COPY ["src/SafeGuard.Web.Core/SafeGuard.Web.Core.csproj", "src/SafeGuard.Web.Core/"]
COPY ["src/SafeGuard.Application/SafeGuard.Application.csproj", "src/SafeGuard.Application/"]
COPY ["src/SafeGuard.Core/SafeGuard.Core.csproj", "src/SafeGuard.Core/"]
COPY ["src/SafeGuard.EntityFrameworkCore/SafeGuard.EntityFrameworkCore.csproj", "src/SafeGuard.EntityFrameworkCore/"]
COPY ["src/SafeGuard.ML/SafeGuard.ML.csproj", "src/SafeGuard.ML/"]
RUN dotnet restore "src/SafeGuard.Web.Host/SafeGuard.Web.Host.csproj"

WORKDIR /src
COPY ["src/SafeGuard.Web.Host", "src/SafeGuard.Web.Host"]
COPY ["src/SafeGuard.Web.Core", "src/SafeGuard.Web.Core"]
COPY ["src/SafeGuard.Application", "src/SafeGuard.Application"]
COPY ["src/SafeGuard.Core", "src/SafeGuard.Core"]
COPY ["src/SafeGuard.EntityFrameworkCore", "src/SafeGuard.EntityFrameworkCore"]
COPY ["src/SafeGuard.ML", "src/SafeGuard.ML"]
WORKDIR "/src/src/SafeGuard.Web.Host"
RUN dotnet publish "SafeGuard.Web.Host.csproj" -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "SafeGuard.Web.Host.dll"]
