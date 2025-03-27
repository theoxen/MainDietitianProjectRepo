import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';

export const nonAuthGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const userRole = accountService.userRole();

  if (!userRole) {
    return true;
  } else {
    // TODO TOASTR
    router.navigate(['/']);
    return false;
  }
};
