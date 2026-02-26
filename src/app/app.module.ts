// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';

// Make sure these paths and exported class names match your files exactly
import { HomeComponent } from './pages/home/HomeComponent';
import { ReportFoundComponent } from './pages/report-found/report-found.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ReportsComponent } from './pages/admin/reports/reports.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule {}
