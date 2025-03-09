import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordStep1Component } from './pages/forgot-password/forgot-password-step-1/forgot-password-step-1.component';
import { ForgotPasswordStep2Component } from './pages/forgot-password/forgot-password-step-2/forgot-password-step-2.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NoteManagementComponent } from './pages/note-management/note-management.component';

import { ClientSearchComponent } from './pages/client-management/client-search/client-search.component';
import { EditClientDetailsComponent } from './pages/client-management/edit-client-details/edit-client-details.component';
import { ClientHistoryComponent } from './pages/client-management/client-history/client-history.component';
import { ManageClientComponent } from './pages/client-management/manage-client/manage-client.component';

import { RecipesComponent } from './pages/recipes/recipes.component';
import { AddEditRecipeComponent } from './pages/recipes/add-edit-recipe/add-edit-recipe.component';
import { ViewComponent } from './pages/recipes/view/view.component';


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

   { path: "clients", component: ClientSearchComponent },
   { path: "clients/:clientId", component: ManageClientComponent },
   { path: "clients/:clientId/edit-details", component: EditClientDetailsComponent },
   { path: "clients/:clientId/history", component: ClientHistoryComponent },
   { path: "clients/:clientId/note", component: NoteManagementComponent },
   { path: "recipes", component: RecipesComponent },
   { path: "recipes/add", component: AddEditRecipeComponent },
   { path: "recipes/:recipeId/edit", component: AddEditRecipeComponent }, //TODO change the name of the url to edit-view
   { path: "recipes/:recipeId", component: ViewComponent },


   { path: "", redirectTo: "/", pathMatch: "prefix" }

];
