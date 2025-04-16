import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginData } from '../models/login-data';
import { RegisterData } from '../models/register.data';
import { HttpResponseError } from '../models/http-error';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private router = inject(Router);
  private baseUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  private toastr = inject(ToastrService);

  public currentUser$: Observable<User | null>;

  public userRole = signal<string | null>(null);
  
  constructor(private http: HttpClient) {
    var user: User | null = null;

    const userInLocalStorage = localStorage.getItem("user");

    if (userInLocalStorage) {
      try {
        user = JSON.parse(userInLocalStorage);
        // Safer access with optional chaining
        this.userRole.set(user?.roles?.[0] || null);
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        localStorage.removeItem('user'); // Clean up invalid data
      }
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  getUserToken() {
    return this.currentUserSubject.value?.token;
  }

  // getUserRole() {
  //   const userStr = localStorage.getItem('user');
  //   if(userStr)
  //   {
  //     const userJson = JSON.parse(userStr);
  //     return userJson.roles[0]? userJson.roles[0] : null;
  //   }
  // }

  login(loginData: LoginData) {

    const url = this.baseUrl + 'users/login'

    return this.http.post<User>(url, loginData).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.userRole.set(user.roles[0] || null);
        }

        return user;
      })
    )
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.userRole.set(null);
    this.router.navigate(['/']);
    this.toastr.success("You have successfully logged out!");
  }

  register(userToRegister: RegisterData) {
    const url = this.baseUrl + 'users/register';

    return this.http.post<User>(url, userToRegister).pipe(
      map(user => {
        if (user) {
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

  getTokenExpiration(): Date | null {
    const token = this.getUserToken();
    if (!token) return null;
    
    try {
      // Get the payload part of the token (second part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // The 'exp' claim is seconds since epoch
      if (payload.exp) {
        // Convert to milliseconds and return as Date
        return new Date(payload.exp * 1000);
      }
    } catch (error) {
      console.error('Error decoding token', error);
    }
    
    return null;
  }
  
  isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;
    
    // Return true if token is expired
    return expiration.getTime() <= Date.now();
  }

}
