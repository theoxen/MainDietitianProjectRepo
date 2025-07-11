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
import { SelectComponent } from './pages/Reports/select/select.component';
import { ViewReportsComponent } from './pages/Reports/view/view.component';
import { AdviceCreateEditComponent } from './pages/advice-management/advice-create-edit/advice-create-edit.component';
import { EditDietsComponent } from './pages/Diets/edit-diets/edit-diets.component';
import { AppointmentsComponent } from './pages/appointments/appointments/appointments.component';
import { UploadsComponent } from './pages/uploads/uploads.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { clientGuard } from './guards/client.guard';
import { nonAuthGuard } from './guards/non-auth.guard';
import { AdviceListComponent } from './pages/advice-management/advice-list/advice-list.component';
import { DisplayArticlesComponent } from './pages/uploads/articles/articles.component';
import { MeetUsComponent } from './pages/meet-us/meet-us.component';
import { SelectReportComponent } from './pages/Reports/select-report/select-report.component';
import { AboutUsViewComponent } from './pages/aboutus/view/view.component';
import { ViewDietsComponent } from './pages/Diets/view-diets/view-diets.component';
import { ViewTemplatesComponent } from './pages/Templates-Management/view-templates/view-templates.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { HelperComponent } from './pages/helper for admin/helper.component';
import { HelperForClientsComponent } from './pages/helper-for-clients/helper-for-clients.component';


export const routes: Routes = [
   { path: "", component: HomePageComponent },
   {
      path: "auth",
      runGuardsAndResolvers: "always",
      children: [
         { path: "forgot-password", component: ForgotPasswordStep1Component, canActivate: [nonAuthGuard] },
         { path: "login", component: LoginComponent, canActivate: [nonAuthGuard] },
         { path: "register", component: RegisterComponent, canActivate: [authGuard, adminGuard] },
         { path: "forgot-password/change-password", component: ForgotPasswordStep2Component, canActivate: [nonAuthGuard] },
      ]
   },

   {
      path: "clients",
      runGuardsAndResolvers: "always",

      canActivate: [authGuard, adminGuard], // Guards get executed in sequence from left to right. If a guard returns false, the next guard doesnt get executed
      children: [
         { path: "", component: ClientSearchComponent }, // url path is additive to the parent path (for this case, it is clients)
         { path: ":clientId", component: ManageClientComponent },
         { path: ":clientId/view", component: ViewClientDetailsComponent },
         { path: ":clientId/edit-details", component: EditClientDetailsComponent },
         { path: ":clientId/delete", component: DeleteClientComponent },
         { path: ":clientId/history", component: ClientHistoryComponent },
         { path: ":clientId/note", component: NoteManagementComponent },
         { path: ":clientId/metrics", component: ViewMetricsComponent },
         { path: ":clientId/diets", component: ViewDietsComponent }

         // { path: ":clientId/view-diets", component: ViewDietsComponent },
         // { path: ":clientId/edit-diets", component: EditDietsComponent }, 
      ]
   },

   { path: "my-diets", runGuardsAndResolvers: "always", component: ViewDietsComponent, canActivate: [authGuard, clientGuard] },

   {
      path: "reviews",
      runGuardsAndResolvers: "always",
      children: [
         { path: "", component: ReviewsCreateEditComponent, canActivate: [clientGuard] },
         { path: ":reviewId/edit", component: ReviewsCreateEditComponent, canActivate: [clientGuard] },
         { path: ":clientId", component: ReviewsCreateEditComponent, canActivate: [clientGuard] },
      ]
   },

   {
      path: "uploads",
      runGuardsAndResolvers: "always",
      canActivate: [authGuard],
      children: [
         { path: "", component: UploadsComponent },
         {
            path: "articles",
            children: [
               { path: "", component: DisplayArticlesComponent },
               { path: ":id", component: ArticleDetailComponent },
            ]
         },
         {
            path: "advice",
            runGuardsAndResolvers: "always",
            children: [
               { path: "", component: AdviceCreateEditComponent, canActivate: [adminGuard] },
               { path: ":adviceId/edit", component: AdviceCreateEditComponent, canActivate: [adminGuard] },
               { path: "view", component: AdviceListComponent },
            ]
         },
         {
            path: "recipes",
            runGuardsAndResolvers: "always",
            children: [
               { path: "", component: RecipesComponent },
               { path: "add", component: AddEditRecipeComponent, canActivate: [adminGuard] },
               { path: ":recipeId/edit", component: AddEditRecipeComponent, canActivate: [adminGuard] },
               { path: ":recipeId", component: ViewComponent }
            ]
         },
      ]
   },






   {
      path: "reports",
      runGuardsAndResolvers: "always",
      canActivate: [authGuard, adminGuard],
      children: [
         { path: "select", component: SelectReportComponent },
         { path: "", component: SelectComponent },
         { path: "view", component: ViewReportsComponent },
      ]
   },


   { path: "manage-data", component: ManageDataComponent, canActivate: [authGuard, adminGuard] },


   { path: "manage-templates", component: ViewTemplatesComponent, canActivate: [authGuard, adminGuard] },




   { path: "appointments", component: AppointmentsComponent, canActivate: [authGuard, adminGuard] }, 


   { path: "help", component: HelperComponent, canActivate: [authGuard, adminGuard]},
   { path: "helper", component: HelperForClientsComponent },
   { path: "about-us", component: AboutUsViewComponent },
   { path: "meet-us", component: MeetUsComponent },


   { path: "", redirectTo: "/", pathMatch: "prefix" },

];
