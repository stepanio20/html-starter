using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BubbleGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DemoCins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DemoCoin",
                table: "AspNetUsers",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DemoCoin",
                table: "AspNetUsers");
        }
    }
}
