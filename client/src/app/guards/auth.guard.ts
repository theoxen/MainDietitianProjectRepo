import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const userRole = accountService.userRole();
  const toastr = inject(ToastrService);

  if (userRole) {
    return true;
  } else {
    toastr.error('You need to be logged in to access this page');
    router.navigate(['/auth/login']);
    return false;
  }
};
