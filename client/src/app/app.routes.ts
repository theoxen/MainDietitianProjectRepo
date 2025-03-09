import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordStep1Component } from './pages/forgot-password/forgot-password-step-1/forgot-password-step-1.component';
import { ForgotPasswordStep2Component } from './pages/forgot-password/forgot-password-step-2/forgot-password-step-2.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NoteManagementComponent } from './pages/note-management/note-management.component';
import { AddMetricsComponent } from './pages/add-metrics/add-metrics.component';

export const routes: Routes = [
   { path: "", component: HomePageComponent },
   {
      path: "auth", children: [
         { path: "forgot-password", component: ForgotPasswordStep1Component },
         { path: "login", component: LoginComponent },
         { path: "register", component: RegisterComponent },
         { path: "forgot-password/change-password", component: ForgotPasswordStep2Component },
      ]  
   },

   { path: "clients/:clientId/note", component: NoteManagementComponent },

   { path: "clients/:clientId/add-metrics", component: AddMetricsComponent },


   { path: "", redirectTo: "/", pathMatch: "prefix" }

];
