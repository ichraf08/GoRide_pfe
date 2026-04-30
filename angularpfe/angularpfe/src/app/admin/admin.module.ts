import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileAvatarComponent } from '../header/profile-avatar/profile-avatar.component';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { UsersComponent } from './pages/users/users.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { SettingsComponent } from './pages/settings/settings.component';


@NgModule({
  declarations: [
    AdminHomeComponent,
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    UsersComponent,
    VehiclesComponent,
    BookingsComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ProfileAvatarComponent
  ]
})
export class AdminModule { }
