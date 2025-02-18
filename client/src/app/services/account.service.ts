import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginData } from '../models/login-data';
import { RegisterData } from '../models/register.data';
import { HttpResponseError } from '../models/http-error';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;

  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {

    var user: User | null = null

    const userInLocalStorage = localStorage.getItem("user");

    if (userInLocalStorage) {
      user = JSON.parse(userInLocalStorage);
    }


    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();

  }

  login(loginData: LoginData) {

    const url = this.baseUrl + 'users/login'

    return this.http.post<User>(url, loginData).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }

        return user;
      })
    )
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  register(userToRegister: RegisterData) {
    const url = this.baseUrl + 'users/register';

    return this.http.post<User>(url, userToRegister).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);

          return user;
        }
        return null;
      })
    )
  }

  sendOtp(email: string) {
    const url = this.baseUrl + 'users/send-otp';
    return this.http.post<string>(url, { email })
  }

  verifyOtp(email: string, otp: string) {
    const url = this.baseUrl + 'users/verify-otp';
    return this.http.post(url, { email, otp });
  }
  
  changePassword(email: string, otp: string, newPassword: string) {
    const url = this.baseUrl + 'users/change-password';
    return this.http.post(url, { email, otp, newPassword });
  }

}
