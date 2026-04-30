import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FleetRoutingModule } from './fleet-routing.module';
import { FleetHomeComponent } from './pages/fleet-home/fleet-home.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { MyVehiclesComponent } from './pages/my-vehicles/my-vehicles.component';
import { AddVehicleComponent } from './pages/add-vehicle/add-vehicle.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { EarningsComponent } from './pages/earnings/earnings.component';


import { FormsModule } from '@angular/forms';
import { ProfileAvatarComponent } from '../header/profile-avatar/profile-avatar.component';

@NgModule({
  declarations: [
    FleetHomeComponent,
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    MyVehiclesComponent,
    AddVehicleComponent,
    RequestsComponent,
    EarningsComponent
  ],
  imports: [
    CommonModule,
    FleetRoutingModule,
    FormsModule,
    ProfileAvatarComponent
  ]
})
export class FleetModule { }
