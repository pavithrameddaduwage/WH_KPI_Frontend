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
    console.log('[uploadChunk] FormData entries:');
    const entries = (formData as any).entries?.();
    if (entries) {
      for (const [key, value] of entries) {
        console.log(`- ${key}:`, value);
      }
    }

    // Simulate successful backend response with Observable.of()
    console.log('[uploadChunk] Simulating upload chunk...');
    return of({ success: true, message: 'Chunk upload simulated' });

    // Actual HTTP call commented out for now:
    // return this.http.post(this.apiUrl, formData, { params });
  }

  upload(formData: FormData): Observable<any> {
    console.log('[upload] Sending formData:');
    const entries = (formData as any).entries?.();
    if (entries) {
      for (const [key, value] of entries) {
        console.log(`- ${key}:`, value);
      }
    }

    // Simulate successful upload
    console.log('[upload] Simulating upload...');
    return of({ success: true, message: 'Upload simulated' });

    // Actual HTTP call commented out for now:
    // return this.http.post(this.apiUrl, formData);
  }

  uploadParsedData(fileType: string, date: string, data: any[]): Observable<any> {
    const payload = {
      fileType,
      date,
      data
    };

    console.log('[uploadParsedData] Payload:', payload);

    // Simulate successful upload parsed data
    console.log('[uploadParsedData] Simulating parsed data upload...');
    return of({ success: true, message: 'Parsed data upload simulated' });

    // Actual HTTP call commented out for now:
    // return this.http.post(`${this.apiUrl}/upload-data`, payload);
  }
}
