import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WeeklyReportsComponent } from './weekly-reports/weekly-reports.component';
import { LoginComponent } from './login/login.component';
import {AuthGuard} from "./auth.guard";

export const routes: Routes = [
  { path: '', redirectTo: 'login',pathMatch: 'full'},
  { path: 'login', component: LoginComponent ,pathMatch: 'full'},
  { path: 'home', component: HomeComponent, pathMatch: 'full',canActivate: [AuthGuard] },
  { path: 'daily', component: FileUploadComponent, pathMatch: 'full',canActivate: [AuthGuard] },
  { path: 'weekly', component: WeeklyReportsComponent,pathMatch: 'full', canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];

