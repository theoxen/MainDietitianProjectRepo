import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const authToken = accountService.getUserToken();
  const toastr = inject(ToastrService);

   // Check if token is expired before making the request
   if (authToken && accountService.isTokenExpired()) {
    // console.log('Token expired, logging out.');
    toastr.error('Session expired. Please log in again.');
    accountService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired'));
  }

  if (authToken) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${authToken}`)
    });
    return next(newReq);
  }
  
  return next(req);
};
