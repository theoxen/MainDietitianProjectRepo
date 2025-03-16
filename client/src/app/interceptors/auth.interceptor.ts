import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../services/account.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authToken = inject(AccountService).getUserToken();

  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${authToken}`)
  });
  return next(newReq);
};
