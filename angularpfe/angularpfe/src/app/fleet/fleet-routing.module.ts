import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { FleetHomeComponent } from './pages/fleet-home/fleet-home.component';
import { MyVehiclesComponent } from './pages/my-vehicles/my-vehicles.component';
import { AddVehicleComponent } from './pages/add-vehicle/add-vehicle.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { EarningsComponent } from './pages/earnings/earnings.component';
import { ProfileComponent } from '../profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: FleetHomeComponent },
      { path: 'vehicles', component: MyVehiclesComponent },
      { path: 'add-vehicle', component: AddVehicleComponent },
      { path: 'requests', component: RequestsComponent },
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
export class FleetRoutingModule { }
