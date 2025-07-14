import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WeeklyReportsComponent } from './weekly-reports/weekly-reports.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  
  { path: 'daily', component: FileUploadComponent },
  { path: 'weekly', component: WeeklyReportsComponent },  
];
