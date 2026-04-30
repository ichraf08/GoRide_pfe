import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { BookRideComponent } from './pages/book-ride/book-ride.component';
import { RentVehicleComponent } from './pages/rent-vehicle/rent-vehicle.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { HistoryComponent } from './pages/history/history.component';
import { PaymentsComponent } from './pages/payments/payments.component';

import { FormsModule } from '@angular/forms';
import { ProfileAvatarComponent } from '../header/profile-avatar/profile-avatar.component';

@NgModule({
  declarations: [
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    DashboardHomeComponent,
    BookRideComponent,
    RentVehicleComponent,
    MyBookingsComponent,
    HistoryComponent,
    PaymentsComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    FormsModule,
    ProfileAvatarComponent
  ]
})
export class ClientModule { }
