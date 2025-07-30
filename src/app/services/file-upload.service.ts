import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private readonly uploadApiUrl = environment.uploadApiUrl;
  private readonly authApiUrl = environment.authApiUrl;

  constructor(private http: HttpClient) {}

  uploadData(payload: {
    fileType: string;
    fileName: string;
    reportDate: string;
    startDate: string;
    endDate: string;
    data: any[];
  }): Observable<any> {

    return this.http.post(this.uploadApiUrl, payload);
  }


  login(payload: { email: string; password: string }): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(this.authApiUrl, payload);
  }


}
