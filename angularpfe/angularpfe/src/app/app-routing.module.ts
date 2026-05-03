import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderfooterComponent } from './headerfooter/headerfooter.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ServicesComponent } from './services/services.component';
import { AboutComponent } from './about/about.component';
import { ProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { FleetSetupComponent } from './fleet-setup/fleet-setup.component';
import { ContactComponent } from './contact/contact.component';
import { AuthGuard } from './auth/auth.guard';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { RoleSelectionComponent } from './role-selection/role-selection.component';

const routes: Routes = [
  // BLINDAGE : On ne laisse AUCUNE redirection vers acceuil au début
  { path: 'r', component: LoginComponent },
  { path: 'role-selection', component: RoleSelectionComponent, canActivate: [AuthGuard] },
  { path: 'reset-password', component: LoginComponent },
  { path: 'reset-password/:token', component: LoginComponent },
  { path: 'login/reset/:token', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'signup', component: SignupComponent },
  
  {
     path: 'acceuil',
     component: HeaderfooterComponent,
     children: [
       { path: '', component: HomeComponent },
       { path: 'services', component: ServicesComponent },
       { path: 'about', component: AboutComponent },
       { path: 'contact', component: ContactComponent },
       { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }
     ]
   },

   { path: 'fleet/setup', component: FleetSetupComponent },
   { path: 'client', loadChildren: () => import('./client/client.module').then(m => m.ClientModule), canActivate: [AuthGuard], data: { role: 'ROLE_CLIENT' } },
   { path: 'driver', loadChildren: () => import('./driver/driver.module').then(m => m.DriverModule), canActivate: [AuthGuard], data: { role: 'ROLE_DRIVER' } },
   { path: 'fleet', loadChildren: () => import('./fleet/fleet.module').then(m => m.FleetModule), canActivate: [AuthGuard], data: { role: 'ROLE_FLEET_OWNER' } },
   { path: 'company', loadChildren: () => import('./company/company.module').then(m => m.CompanyModule), canActivate: [AuthGuard], data: { role: 'ROLE_COMPANY' } },
   { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard], data: { role: 'ROLE_ADMIN' } },
   
   { path: '', redirectTo: 'acceuil', pathMatch: 'full' },
   { path: '**', redirectTo: 'acceuil' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
