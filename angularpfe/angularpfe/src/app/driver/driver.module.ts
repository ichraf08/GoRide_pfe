import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { DriverRoutingModule } from './driver-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { RidesComponent } from './pages/rides/rides.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { VehicleComponent } from './pages/vehicle/vehicle.component';
import { EarningsComponent } from './pages/earnings/earnings.component';
import { ProfileAvatarComponent } from '../header/profile-avatar/profile-avatar.component';

@NgModule({
  declarations: [
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    DashboardHomeComponent,
    RidesComponent,
    RequestsComponent,
    VehicleComponent,
    EarningsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DriverRoutingModule,
    NgChartsModule,
    ProfileAvatarComponent
  ]
})
export class DriverModule { }
