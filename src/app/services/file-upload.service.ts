import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = 'http://localhost:3000/excel-data/upload';  

  constructor(private http: HttpClient) {}

  upload(file: File, department: string, year: string, week: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('department', department);
    formData.append('year', year);
    formData.append('week', week);

    return this.http.post<any>(this.apiUrl, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Backend error (status code: ${error.status}): ${error.message}`;
    }

    console.error('File upload failed:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
