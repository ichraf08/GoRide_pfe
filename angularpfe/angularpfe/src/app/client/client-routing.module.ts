import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { BookRideComponent } from './pages/book-ride/book-ride.component';
import { RentVehicleComponent } from './pages/rent-vehicle/rent-vehicle.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { HistoryComponent } from './pages/history/history.component';
import { PaymentsComponent } from './pages/payments/payments.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: DashboardHomeComponent },
      { path: 'book-ride', component: BookRideComponent },
      { path: 'rent-vehicle', component: RentVehicleComponent },
      { path: 'my-bookings', component: MyBookingsComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
