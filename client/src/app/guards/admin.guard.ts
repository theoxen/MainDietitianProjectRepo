import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const userRole = accountService.userRole();
  const toastr = inject(ToastrService);

  if(userRole?.includes('admin')) {
    return true;
  } else {
    toastr.error('You are not authorized to access this page');
    router.navigate(['/']);
    return false;
  }
};
