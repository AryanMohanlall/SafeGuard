using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeGuard.Migrations
{
    /// <inheritdoc />
    public partial class RefactorCaseIncidentRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CaseId",
                table: "Incidents",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Incidents" AS i
                SET "CaseId" = c."Id"
                FROM "Cases" AS c
                WHERE c."IncidentId" IS NOT NULL
                  AND i."Id" = c."IncidentId";
                """);

            migrationBuilder.DropColumn(
                name: "IncidentId",
                table: "Cases");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_CaseId",
                table: "Incidents",
                column: "CaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Incidents_Cases_CaseId",
                table: "Incidents",
                column: "CaseId",
                principalTable: "Cases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IncidentId",
                table: "Cases",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Cases" AS c
                SET "IncidentId" = incident_link."Id"
                FROM (
                    SELECT DISTINCT ON ("CaseId") "CaseId", "Id"
                    FROM "Incidents"
                    WHERE "CaseId" IS NOT NULL
                    ORDER BY "CaseId", "ReportedAt", "Id"
                ) AS incident_link
                WHERE incident_link."CaseId" = c."Id";
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Incidents_Cases_CaseId",
                table: "Incidents");

            migrationBuilder.DropIndex(
                name: "IX_Incidents_CaseId",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "CaseId",
                table: "Incidents");
        }
    }
}
