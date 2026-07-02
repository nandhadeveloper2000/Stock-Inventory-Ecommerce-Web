import { UserRoleType, UserRole } from "./roles";
import { routes } from "./routes";

export function getLoginPortalFor(role: UserRoleType | string | undefined): string {
  switch (role) {
    case UserRole.MASTER_ADMIN:
    case UserRole.MANAGER:
    case UserRole.SUPERVISOR:
    case UserRole.STAFF:
      return "/master";
    case UserRole.SHOP_OWNER:
    case UserRole.SHOP_MANAGER:
    case UserRole.SHOP_SUPERVISOR:
    case UserRole.EMPLOYEE:
    case UserRole.VENDOR:
      return "/seller";
    case UserRole.CUSTOMER:
    default:
      return "/login";
  }
}

/** Where the "Settings" account menu item should navigate for a given role. */
export function getSettingsRoute(role: UserRoleType | string | undefined): string {
  switch (role) {
    case UserRole.MASTER_ADMIN:
    case UserRole.MANAGER:
    case UserRole.SUPERVISOR:
    case UserRole.STAFF:
      return routes.superAdmin.settings;
    case UserRole.SHOP_OWNER:
    case UserRole.SHOP_MANAGER:
    case UserRole.SHOP_SUPERVISOR:
    case UserRole.EMPLOYEE:
      return routes.shopOwner.settings;
    case UserRole.VENDOR:
      return routes.vendor.profile;
    case UserRole.CUSTOMER:
      return routes.customer.profile;
    default:
      return routes.superAdmin.settings;
  }
}

/** Where the "Profile" account menu item should navigate for a given role. */
export function getProfileRoute(role: UserRoleType | string | undefined): string {
  switch (role) {
    case UserRole.CUSTOMER:
      return routes.customer.profile;
    case UserRole.VENDOR:
      return routes.vendor.profile;
    case UserRole.SHOP_OWNER:
    case UserRole.SHOP_MANAGER:
    case UserRole.SHOP_SUPERVISOR:
    case UserRole.EMPLOYEE:
      return routes.shopOwner.settings;
    default:
      // Staff/master: the Settings page opens on the Profile tab.
      return routes.superAdmin.settings;
  }
}
