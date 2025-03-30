import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { ToastrService } from 'ngx-toastr';

export const nonAuthGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const userRole = accountService.userRole();
  const toastr = inject(ToastrService);

  if (!userRole) {
    return true;
  } else {
    toastr.warning('You are already logged in');
    router.navigate(['/']);
    return false;
  }
};
