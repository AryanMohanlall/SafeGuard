using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;
using SafeGuard.Users.Dto;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SafeGuard.Users;

[AbpAuthorize]
public class OfficialDirectoryAppService : ApplicationService, IOfficialDirectoryAppService
{
    private readonly IRepository<User, long> _userRepository;
    private readonly IRepository<Role> _roleRepository;

    public OfficialDirectoryAppService(
        IRepository<User, long> userRepository,
        IRepository<Role> roleRepository)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
    }

    public async Task<ListResultDto<UserDto>> GetOfficials()
    {
        var officialRoleIds = await _roleRepository.GetAll()
            .Where(role => role.Name == StaticRoleNames.Tenants.Official || role.Name == StaticRoleNames.Tenants.Offical)
            .Select(role => role.Id)
            .ToListAsync();

        if (officialRoleIds.Count == 0)
        {
            return new ListResultDto<UserDto>(new List<UserDto>());
        }

        var officials = await _userRepository.GetAllIncluding(user => user.Roles)
            .Where(user => user.IsActive && user.Roles.Any(role => officialRoleIds.Contains(role.RoleId)))
            .OrderBy(user => user.Name)
            .ThenBy(user => user.Surname)
            .ToListAsync();

        var items = officials.Select(user => new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Name = user.Name,
            Surname = user.Surname,
            EmailAddress = user.EmailAddress,
            IsActive = user.IsActive,
            FullName = user.FullName,
            CreationTime = user.CreationTime,
            RoleNames = user.Roles
                .Where(role => officialRoleIds.Contains(role.RoleId))
                .Select(role => StaticRoleNames.Tenants.Official.ToUpperInvariant())
                .Distinct()
                .ToArray(),
        }).ToList();

        return new ListResultDto<UserDto>(items);
    }
}
