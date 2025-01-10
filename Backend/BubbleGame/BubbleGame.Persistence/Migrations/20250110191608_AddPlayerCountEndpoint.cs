using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BubbleGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerCountEndpoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Dollar",
                table: "AspNetUsers",
                newName: "BlockedFiats");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BlockedFiats",
                table: "AspNetUsers",
                newName: "Dollar");
        }
    }
}
