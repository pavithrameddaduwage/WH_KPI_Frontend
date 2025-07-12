import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

    console.log('[uploadChunk] Params:', params.toString());
    this.logFormData(formData, '[uploadChunk]');
    console.log('[uploadChunk] Simulating upload chunk...');
    return of({ success: true, message: 'Chunk upload simulated' });
    return this.http.post(this.apiUrl, formData, { params });
  }

  upload(formData: FormData): Observable<any> {
    console.log('[upload] Sending formData:');
    this.logFormData(formData, '[upload]');


    console.log('[upload] Simulating upload...');
    return of({ success: true, message: 'Upload simulated' });
    return this.http.post(this.apiUrl, formData);
  }

  uploadParsedData(fileType: string, date: string, data: any[]): Observable<any> {
    const payload = {
      fileType,
      date,
      data
    };

    console.log('[uploadParsedData] Payload:', payload);
    console.log('[uploadParsedData] Simulating parsed data upload...');
    return of({ success: true, message: 'Parsed data upload simulated' });
    return this.http.post(`${this.apiUrl}/upload-data`, payload);
  }


  private logFormData(formData: FormData, context: string): void {
    if (formData && typeof formData.forEach === 'function') {
      formData.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${context} ${key}: [File] name="${value.name}", size=${value.size}, type="${value.type}"`);
        } else {
          console.log(`${context} ${key}:`, value);
        }
      });
    } else {
      console.warn(`${context} Unable to iterate over FormData.`);
    }
  }
}
