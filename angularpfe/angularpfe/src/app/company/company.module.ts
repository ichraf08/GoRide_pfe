import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyHomeComponent } from './pages/company-home/company-home.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { BillingComponent } from './pages/billing/billing.component';
import { ReportsComponent } from './pages/reports/reports.component';


import { FormsModule } from '@angular/forms';
import { ProfileAvatarComponent } from '../header/profile-avatar/profile-avatar.component';

@NgModule({
  declarations: [
    CompanyHomeComponent,
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    DashboardComponent,
    EmployeesComponent,
    BillingComponent,
    ReportsComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    FormsModule,
    ProfileAvatarComponent
  ]
})
export class CompanyModule { }
