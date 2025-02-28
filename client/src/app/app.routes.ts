import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordStep1Component } from './pages/forgot-password/forgot-password-step-1/forgot-password-step-1.component';
import { ForgotPasswordStep2Component } from './pages/forgot-password/forgot-password-step-2/forgot-password-step-2.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
   { path: "", component: HomePageComponent },
   { path: "users/forgot-password", component:ForgotPasswordStep1Component },
   { path:"users/login", component:LoginComponent },
   { path:"users/register", component:RegisterComponent },
   { path:"users/forgot-password/change-password", component:ForgotPasswordStep2Component }
];
