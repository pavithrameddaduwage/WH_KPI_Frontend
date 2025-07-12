import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { NavbarComponent } from './navbar/navbar.component';  
import { DialogBoxComponent } from './dialog-box/dialog-box.component';

import { FileUploadService } from './services/file-upload.service';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NavbarComponent,        
    DialogBoxComponent    
  ],
  providers: [FileUploadService],
  bootstrap: [AppComponent]
})
export class AppModule { }
