import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly uploadApiUrl = environment.uploadApiUrl;

  constructor(private http: HttpClient) {}

  uploadData(payload: {
    fileType: string;
    fileName: string;
    reportDate: string;
    startDate: string;
    endDate: string;
    data: any[];
  }): Observable<any> {
   
    console.log('data===================================>:', {
      url: this.uploadApiUrl,
      payload
    });

    return this.http.post(this.uploadApiUrl, payload);
  }
}
