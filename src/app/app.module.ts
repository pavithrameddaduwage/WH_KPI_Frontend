import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WeeklyReportsComponent } from './weekly-reports/weekly-reports.component';

import { NavbarComponent } from './navbar/navbar.component'; 
import { DialogBoxComponent } from './dialog-box/dialog-box.component'; 

import { FileUploadService } from './services/file-upload.service';
import { AuthService } from './auth.service';
import { AuthInterceptor } from './auth.interceptor';

import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HgusaEmployeeComponent } from './hgusa-employee/hgusa-employee.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    WeeklyReportsComponent,
    HgusaEmployeeComponent,
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,

 
    NavbarComponent,
    DialogBoxComponent
  ],
  providers: [
    FileUploadService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
