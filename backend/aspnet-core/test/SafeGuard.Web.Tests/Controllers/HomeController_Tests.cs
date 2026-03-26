using SafeGuard.Models.TokenAuth;
using SafeGuard.Web.Controllers;
using Shouldly;
using System.Threading.Tasks;
using Xunit;

namespace SafeGuard.Web.Tests.Controllers;

public class HomeController_Tests : SafeGuardWebTestBase
{
    [Fact]
    public async Task Index_Test()
    {
        await AuthenticateAsync(null, new AuthenticateModel
        {
            UserNameOrEmailAddress = "admin",
            Password = "123qwe"
        });

        //Act
        var response = await GetResponseAsStringAsync(
            GetUrl<HomeController>(nameof(HomeController.Index))
        );

        //Assert
        response.ShouldNotBeNullOrEmpty();
    }
}