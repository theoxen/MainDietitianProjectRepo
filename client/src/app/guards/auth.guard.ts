import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const userRole = accountService.userRole();

  if (userRole) {
    return true;
  } else {
    // TODO TOASTR
    router.navigate(['/auth/login']);
    return false;
  }
};
