// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.uploadApiUrl;   
  constructor(private http: HttpClient) {}

   
  uploadChunk(formData: FormData, signal: AbortSignal | undefined): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
  upload(formData: FormData): Observable<any> {
    const headers = new HttpHeaders();  
    return this.http.post(this.apiUrl, formData, { headers });
  }
}
