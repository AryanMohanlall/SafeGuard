using Abp.Application.Services.Dto;
using SafeGuard.Roles;
using SafeGuard.Roles.Dto;
using Shouldly;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace SafeGuard.Tests.Roles;

public class RoleAppService_Tests : SafeGuardTestBase
{
    private readonly IRoleAppService _roleAppService;

    public RoleAppService_Tests()
    {
        _roleAppService = Resolve<IRoleAppService>();
    }

    private static CreateRoleDto MakeCreateDto(string name, string displayName = null) => new()
    {
        Name = name,
        DisplayName = displayName ?? name,
        Description = $"Test role: {name}",
        GrantedPermissions = new System.Collections.Generic.List<string>(),
    };

    [Fact]
    public async Task Create_ShouldPersistRole()
    {
        var dto = await _roleAppService.CreateAsync(MakeCreateDto("TestRole"));

        dto.Id.ShouldBeGreaterThan(0);
        dto.Name.ShouldBe("TestRole");
        dto.DisplayName.ShouldBe("TestRole");
    }

    [Fact]
    public async Task GetAll_ShouldReturnRoles()
    {
        await _roleAppService.CreateAsync(MakeCreateDto("RoleAlpha"));
        await _roleAppService.CreateAsync(MakeCreateDto("RoleBeta"));

        var result = await _roleAppService.GetAllAsync(
            new PagedRoleResultRequestDto { MaxResultCount = 50, SkipCount = 0 });

        result.TotalCount.ShouldBeGreaterThanOrEqualTo(2);
        result.Items.ShouldContain(r => r.Name == "RoleAlpha");
        result.Items.ShouldContain(r => r.Name == "RoleBeta");
    }

    [Fact]
    public async Task GetAll_WithKeyword_ShouldFilterResults()
    {
        await _roleAppService.CreateAsync(MakeCreateDto("SecurityOfficer", "Security Officer"));
        await _roleAppService.CreateAsync(MakeCreateDto("FieldAgent", "Field Agent"));

        var result = await _roleAppService.GetAllAsync(
            new PagedRoleResultRequestDto { MaxResultCount = 50, SkipCount = 0, Keyword = "Security" });

        result.Items.ShouldContain(r => r.Name == "SecurityOfficer");
        result.Items.ShouldNotContain(r => r.Name == "FieldAgent");
    }

    [Fact]
    public async Task Get_ShouldReturnCorrectRole()
    {
        var created = await _roleAppService.CreateAsync(MakeCreateDto("FetchMe", "Fetch Me"));

        var fetched = await _roleAppService.GetAsync(new EntityDto<int>(created.Id));

        fetched.Id.ShouldBe(created.Id);
        fetched.Name.ShouldBe("FetchMe");
        fetched.DisplayName.ShouldBe("Fetch Me");
    }

    [Fact]
    public async Task Update_ShouldModifyRole()
    {
        var created = await _roleAppService.CreateAsync(MakeCreateDto("OriginalRole", "Original Role"));

        var updated = await _roleAppService.UpdateAsync(new RoleDto
        {
            Id = created.Id,
            Name = "OriginalRole",
            DisplayName = "Updated Display Name",
            Description = "Updated description",
            GrantedPermissions = new System.Collections.Generic.List<string>(),
        });

        updated.DisplayName.ShouldBe("Updated Display Name");
        updated.Description.ShouldBe("Updated description");
    }

    [Fact]
    public async Task Delete_ShouldRemoveRole()
    {
        var created = await _roleAppService.CreateAsync(MakeCreateDto("ToDeleteRole"));

        await _roleAppService.DeleteAsync(new EntityDto<int>(created.Id));

        var result = await _roleAppService.GetAllAsync(
            new PagedRoleResultRequestDto { MaxResultCount = 100, SkipCount = 0 });

        result.Items.ShouldNotContain(r => r.Id == created.Id);
    }

    [Fact]
    public async Task GetRolesAsync_ShouldReturnAllRoles()
    {
        await _roleAppService.CreateAsync(MakeCreateDto("ListableRole"));

        var result = await _roleAppService.GetRolesAsync(new GetRolesInput());

        result.Items.ShouldNotBeNull();
        result.Items.Count.ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task GetAllPermissions_ShouldReturnPermissionList()
    {
        var result = await _roleAppService.GetAllPermissions();

        result.Items.ShouldNotBeNull();
    }

    [Fact]
    public async Task GetRoleForEdit_ShouldReturnRoleWithPermissions()
    {
        var created = await _roleAppService.CreateAsync(MakeCreateDto("EditableRole", "Editable Role"));

        var editOutput = await _roleAppService.GetRoleForEdit(new EntityDto(created.Id));

        editOutput.Role.ShouldNotBeNull();
        editOutput.Role.Name.ShouldBe("EditableRole");
        editOutput.Permissions.ShouldNotBeNull();
        editOutput.GrantedPermissionNames.ShouldNotBeNull();
    }

    [Fact]
    public async Task Create_WithDisplayName_ShouldPersistDisplayName()
    {
        var dto = await _roleAppService.CreateAsync(MakeCreateDto("DispRole", "Display Role Name"));

        dto.DisplayName.ShouldBe("Display Role Name");
    }
}
