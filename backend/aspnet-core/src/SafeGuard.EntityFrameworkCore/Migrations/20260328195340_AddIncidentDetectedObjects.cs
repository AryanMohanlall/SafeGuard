using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeGuard.Migrations
{
    /// <inheritdoc />
    public partial class AddIncidentDetectedObjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DetectedObjects",
                table: "Incidents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DetectedObjects",
                table: "Incidents");
        }
    }
}
