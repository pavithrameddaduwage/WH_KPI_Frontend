import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.uploadApiUrl;

  constructor(private http: HttpClient) {}

  uploadChunk(
    formData: FormData,
    _signal: AbortSignal | undefined,
    fileType: string,
    date: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('fileType', fileType)
      .set('date', date);

    this.logDate(formData);
    return this.http.post(this.apiUrl, formData, { params });
  }

  upload(formData: FormData): Observable<any> {
    this.logDate(formData);
    return this.http.post(this.apiUrl, formData);
  }

  uploadParsedData(fileType: string, date: string, data: any[]): Observable<any> {
    const payload = { fileType, date, data };
    return this.http.post(`${this.apiUrl}/upload-data`, payload);
  }

  private logDate(formData: FormData): void {
    const date = formData.get('date');
    console.log('Date================================>', date);
    console.log('File================================>', formData.get('file'));
    console.log('File Type===========================>', formData.get('fileType'));
  }
}
