import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { RidesComponent } from './pages/rides/rides.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { VehicleComponent } from './pages/vehicle/vehicle.component';
import { EarningsComponent } from './pages/earnings/earnings.component';
import { ProfileComponent } from '../profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: DashboardHomeComponent },
      { path: 'rides', component: RidesComponent },
      { path: 'requests', component: RequestsComponent },
      { path: 'vehicle', component: VehicleComponent },
      { path: 'earnings', component: EarningsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
