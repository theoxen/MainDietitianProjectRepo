import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
   { path:"users/login", component:LoginComponent },
   { path:"", component:RegisterComponent }
];
