import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const authToken = accountService.getUserToken();

   // Check if token is expired before making the request
   if (authToken && accountService.isTokenExpired()) {
    console.log('Token expired, logging out.');
    accountService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired')); // TODO: maybe remove the throwerror?
  }

  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${authToken}`)
  });
  return next(newReq);
};
