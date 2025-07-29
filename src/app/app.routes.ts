import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WeeklyReportsComponent } from './weekly-reports/weekly-reports.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },            
  { path: 'home', component: HomeComponent },          
  { path: 'daily', component: FileUploadComponent },
  { path: 'weekly', component: WeeklyReportsComponent },
  { path: 'login', component: LoginComponent },
];

