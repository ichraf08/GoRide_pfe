import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { CompanyHomeComponent } from './pages/company-home/company-home.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { BillingComponent } from './pages/billing/billing.component';
import { ReportsComponent } from './pages/reports/reports.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: CompanyHomeComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
