using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeGuard.Migrations
{
    /// <inheritdoc />
    public partial class LinkEvidenceToIncident : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IncidentId",
                table: "Evidences",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Evidences_IncidentId",
                table: "Evidences",
                column: "IncidentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Evidences_Incidents_IncidentId",
                table: "Evidences",
                column: "IncidentId",
                principalTable: "Incidents",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evidences_Incidents_IncidentId",
                table: "Evidences");

            migrationBuilder.DropIndex(
                name: "IX_Evidences_IncidentId",
                table: "Evidences");

            migrationBuilder.DropColumn(
                name: "IncidentId",
                table: "Evidences");
        }
    }
}
