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

const routes: Routes = [
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
   // Login/Signup en plein écran
   { path: 'login', component: LoginComponent },
   { path: 'signup', component: SignupComponent },
   { path: 'signup/driver', component: SignupComponent },
   { path: 'signup/fleet', component: SignupComponent },
   { path: 'fleet/setup', component: FleetSetupComponent },
   {path:'', redirectTo:'acceuil', pathMatch: 'full'}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
  })
export class AppRoutingModule { }
