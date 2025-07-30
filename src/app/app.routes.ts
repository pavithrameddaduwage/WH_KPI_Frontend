import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WeeklyReportsComponent } from './weekly-reports/weekly-reports.component';
import { LoginComponent } from './login/login.component';
import {AuthGuard} from "./auth.guard";

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'daily', component: FileUploadComponent, canActivate: [AuthGuard] },
  { path: 'weekly', component: WeeklyReportsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];

