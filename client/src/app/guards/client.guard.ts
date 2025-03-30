import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { ToastrService } from 'ngx-toastr';

export const clientGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
    const router = inject(Router);
    const userRole = accountService.userRole();
    const toastr = inject(ToastrService);
  
    if (userRole?.includes('client')) {
      return true;
    } else {
      toastr.error('You should be a client to access this page');
      router.navigate(['/']);
      return false;
    }
};
