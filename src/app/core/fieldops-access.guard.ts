import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DemoRole } from './fieldops.models';
import { FieldOpsStore } from './fieldops.store';

@Injectable({ providedIn: 'root' })
export class FieldOpsAccessGuard implements CanActivate {
  private readonly store = inject(FieldOpsStore);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    if (!isPlatformBrowser(this.platformId)) return true;
    if (!this.store.isAuthenticated() && !this.store.restoreSession()) {
      return this.router.parseUrl('/login');
    }
    const roles = route.data['roles'] as DemoRole[] | undefined;
    if (roles && !this.store.hasRole(roles)) return this.router.parseUrl('/forbidden');
    return true;
  }
}
