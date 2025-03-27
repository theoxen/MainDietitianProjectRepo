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
import { ReviewsCreateEditComponent } from './pages/reviews-management/reviews-create-edit/reviews-create-edit.component';

import { ViewMetricsComponent } from './pages/Metrics-Management/view-metrics/view-metrics.component';

import { ViewClientDetailsComponent } from './pages/client-management/view-client/view-client.component';
import { DeleteClientComponent } from './pages/client-management/delete-client/delete-client.component';
import { AddDietsComponent } from './pages/Diets/add-diets/add-diets.component';
import { ManageDataComponent } from './pages/manage-data/manage-data.component';
import { ViewDietsComponent } from './pages/Diets/view-diets/view-diets.component';
import { EditDietsComponent } from './pages/Diets/edit-diets/edit-diets.component';
import { AppointmentsComponent } from './pages/appointments/appointments/appointments.component';



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
   { path : "clients/:clientId/view", component: ViewClientDetailsComponent },
   { path: "clients/:clientId/edit-details", component: EditClientDetailsComponent },
   { path: "clients/:clientId/delete", component: DeleteClientComponent },
   { path: "clients/:clientId/history", component: ClientHistoryComponent },
   { path: "clients/:clientId/note", component: NoteManagementComponent },
   
   { path: "recipes", component: RecipesComponent },
   { path: "recipes/add", component: AddEditRecipeComponent },
   { path: "recipes/:recipeId/edit", component: AddEditRecipeComponent }, //TODO change the name of the url to edit-view
   { path: "recipes/:recipeId", component: ViewComponent },

   { path: "clients/:clientId/metrics", component: ViewMetricsComponent },



   { path: "clients/:clientId/add-diets", component: AddDietsComponent },
   { path: "clients/:clientId/view-diets", component: ViewDietsComponent },
   { path: "clients/:clientId/edit-diets", component: EditDietsComponent }, 

   { path: "appointments", component: AppointmentsComponent },



   { path: "reviews", component: ReviewsCreateEditComponent },
   { path: "reviews/:reviewId/edit", component: ReviewsCreateEditComponent },

   { path: "reviews/:clientId", component: ReviewsCreateEditComponent },
   { path: "", redirectTo: "/", pathMatch: "prefix" },


   { path: "manage-data", component: ManageDataComponent },


   { path: "", redirectTo: "/", pathMatch: "prefix" },
];
