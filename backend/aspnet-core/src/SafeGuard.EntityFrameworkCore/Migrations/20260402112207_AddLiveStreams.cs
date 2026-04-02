using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeGuard.Migrations
{
    /// <inheritdoc />
    public partial class AddLiveStreams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LiveStreams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Location = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    SourceName = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    SourceUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    CamKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiveStreams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LiveStreams_IsActive",
                table: "LiveStreams",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_LiveStreams_Name",
                table: "LiveStreams",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_LiveStreams_SortOrder",
                table: "LiveStreams",
                column: "SortOrder");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LiveStreams");
        }
    }
}
