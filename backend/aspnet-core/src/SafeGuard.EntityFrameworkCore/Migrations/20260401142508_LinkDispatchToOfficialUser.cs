using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafeGuard.Migrations
{
    /// <inheritdoc />
    public partial class LinkDispatchToOfficialUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "OfficialUserId",
                table: "Dispatches",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dispatches_OfficialUserId",
                table: "Dispatches",
                column: "OfficialUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dispatches_AbpUsers_OfficialUserId",
                table: "Dispatches",
                column: "OfficialUserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dispatches_AbpUsers_OfficialUserId",
                table: "Dispatches");

            migrationBuilder.DropIndex(
                name: "IX_Dispatches_OfficialUserId",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "OfficialUserId",
                table: "Dispatches");
        }
    }
}
