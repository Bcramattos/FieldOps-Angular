import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export function fieldopsAuthGuard(): CanActivateFn {
  return () => {
    const router = inject(Router);
    const logado = sessionStorage.getItem('fieldops_logado') === 'true';
    if (logado) return true;
    router.navigate(['/login']);
    return false;
  };
}
