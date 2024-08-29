import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  selectedDepartment = '';
  selectedYear = '';
  selectedWeek = '';
  departments = ['007', '019', '063'];
  years: number[] = [];
  weeks: number[] = [];
  isLoading = false;
  uploadSuccess = false;
  uploadError = '';

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit() {
    this.populateYears();
    this.populateWeeks();
  }

  populateYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  populateWeeks() {
    this.weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';  // Reset error message on new file selection
    }
  }

  validateForm(): boolean {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file.';
      return false;
    }
    if (!this.selectedDepartment) {
      this.uploadError = 'Please select a department.';
      return false;
    }
    if (!this.selectedYear) {
      this.uploadError = 'Please select a year.';
      return false;
    }
    if (!this.selectedWeek) {
      this.uploadError = 'Please select a week.';
      return false;
    }
    if (!['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(this.selectedFile.type)) {
      this.uploadError = 'Invalid file type. Only CSV and Excel files are allowed.';
      return false;
    }
    return true;
  }

  onSubmit() {
    this.uploadError = '';
    this.uploadSuccess = false;

    if (this.validateForm()) {
      if (this.selectedFile) { // Ensure selectedFile is not null
        this.isLoading = true;
        this.fileUploadService.upload(this.selectedFile, this.selectedDepartment, this.selectedYear, this.selectedWeek)
          .subscribe({
            next: (response) => {
              console.log('Upload successful', response);
              this.uploadSuccess = true;
              this.resetForm();
            },
            error: (error) => {
              console.error('Upload failed', error);
              this.uploadError = 'Upload failed. Please try again later.';
            },
            complete: () => {
              this.isLoading = false;
            }
          });
      }
    }
  }

  resetForm() {
    this.selectedFile = null;
    this.selectedDepartment = '';
    this.selectedYear = '';
    this.selectedWeek = '';
    this.isLoading = false;
    this.uploadSuccess = false;
  }
}
