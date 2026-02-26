import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/HomeComponent';
import { ReportFoundComponent } from './pages/report-found/report-found.component';
import { ReportLostComponent } from './pages/report-lost/report-lost.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ReportsComponent } from './pages/admin/reports/reports.component';
import { ClaimComponent } from './pages/claim/claim.component';
import { QAComponent } from './pages/qa/qa.component';
import { LoginComponent } from './pages/login/login.component';
import { adminGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'report', component: ReportFoundComponent },
  { path: 'report-lost', component: ReportLostComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'items/:id/claim', component: ClaimComponent },
  { path: 'qa', component: QAComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/reports', component: ReportsComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
