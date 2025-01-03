using Microsoft.AspNetCore.Identity;

namespace BubbleGame.Persistence.Identity.Models;

public class AppUser : IdentityUser
{
    public string Address { get; set; }
    public decimal Balance { get; set; }
}