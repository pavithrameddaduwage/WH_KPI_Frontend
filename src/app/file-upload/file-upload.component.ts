import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList
} from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';
import { firstValueFrom } from 'rxjs';

import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class FileUploadComponent implements OnInit {
  fileTypes = [
    { key: 'diversedaily', label: 'Diversedaily Time Card Report' },
    { key: 'employeeTotal', label: 'Employee Total Hours Report' },
    { key: 'horizon', label: 'Horizon GA 48 (EOS)' },
    { key: 'labor', label: 'Daily Labor Report' }
  ];

  selectedDate: string = '';
  uploadedFiles: { [key: string]: File | null } = {};
  uploadProgress: { [key: string]: number } = {};
  isLoading: { [key: string]: boolean } = {};
  isDragOver: string | null = null;
  uploadStatus: { [key: string]: 'pending' | 'uploading' | 'uploaded' | 'failed' } = {};
  abortControllers: { [key: string]: AbortController } = {};

  // Dialog properties
  showSuccessDialog: boolean = false;
  showClearConfirmDialog: boolean = false;
  showErrorDialog: boolean = false;
  dialogType: 'info' | 'warning' | 'error' | 'success' = 'info';
  dialogHeader: string = '';
  dialogMessage: string = '';

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(public fileUploadService: FileUploadService) {}

  ngOnInit() {
    for (const type of this.fileTypes) {
      this.uploadedFiles[type.key] = null;
      this.uploadProgress[type.key] = 0;
      this.isLoading[type.key] = false;
      this.uploadStatus[type.key] = 'pending';
    }
  }

  get isAnyUploading(): boolean {
    return Object.values(this.uploadStatus).includes('uploading');
  }

  get hasFileSelected(): boolean {
    return Object.values(this.uploadedFiles).some(file => !!file);
  }

  get allUploadsComplete(): boolean {
    return this.fileTypes.every(type => this.uploadStatus[type.key] === 'uploaded');
  }

  triggerFileInput(key: string) {
    const index = this.fileTypes.findIndex(type => type.key === key);
    const inputRef = this.fileInputs.get(index);
    inputRef?.nativeElement.click();
  }

  private isFileTypeAllowed(file: File): boolean {
    const allowedExtensions = ['csv', 'xls', 'xlsx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    return this.allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt);
  }

  private validateAndAssignFile(file: File, key: string): void {
    if (!this.isFileTypeAllowed(file)) {
      this.showError(
        'Invalid File Type',
        'Only CSV (.csv), Excel (.xls, .xlsx) files are allowed.'
      );
      this.uploadedFiles[key] = null;
      this.uploadStatus[key] = 'pending';
      this.uploadProgress[key] = 0;
      return;
    }

    this.uploadedFiles[key] = file;
    this.uploadStatus[key] = 'pending';
    this.uploadProgress[key] = 0;
  }

  onFileChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      this.validateAndAssignFile(file, key);
    }
  }

  onFileDrop(event: DragEvent, key: string) {
    event.preventDefault();
    this.isDragOver = null;

    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      this.validateAndAssignFile(file, key);
    }
  }

  onDragOver(event: DragEvent, key: string) {
    event.preventDefault();
    this.isDragOver = key;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = null;
  }

  async onSubmitAll() {
    // Close any open dialogs first
    this.closeAllDialogs();
    
    // Validate date first
    if (!this.selectedDate) {
      this.showError('Date Required', 'Please select a report date before uploading.');
      return;
    }

    // Validate at least one file is selected
    const keysToUpload = Object.keys(this.uploadedFiles).filter(key => this.uploadedFiles[key]);
    if (keysToUpload.length === 0) {
      this.showError('No Files Selected', 'Please select at least one file to upload.');
      return;
    }

    // Validate file types
    for (const key of keysToUpload) {
      const file = this.uploadedFiles[key];
      if (file && !this.isFileTypeAllowed(file)) {
        this.showError(
          'Invalid File Type', 
          `The file "${file.name}" is not a valid Excel or CSV file. Only .xls, .xlsx, and .csv files are allowed.`
        );
        return;
      }
    }

    // If all validations pass, proceed with upload
    try {
      for (const key of keysToUpload) {
        await this.onSubmit(key);
      }
      this.showSuccessDialog = true;
    } catch (error) {
      console.error('Error in onSubmitAll:', error);
      this.showError('Upload Error', 'An error occurred during upload. Please try again.');
    }
  }

  async onSubmit(key: string) {
    const file = this.uploadedFiles[key];
    if (!file) return;

    if (!this.isFileTypeAllowed(file)) {
      this.showError('Invalid File', 'Only CSV and Excel files are allowed.');
      return;
    }

    const controller = new AbortController();
    this.abortControllers[key] = controller;
    this.isLoading[key] = true;
    this.uploadProgress[key] = 0;
    this.uploadStatus[key] = 'uploading';

    try {
      await this.uploadFileInChunks(file, key, controller.signal);
      this.uploadStatus[key] = 'uploaded';
    } catch (error: any) {
      if (controller.signal.aborted) {
        this.showError('Canceled', 'Upload was canceled by the user.');
      } else {
        const errMsg = error?.message || 'Upload failed.';
        this.showError('Error', errMsg.substring(0, 100));
        console.error('[onSubmit] Upload error:', error);
      }
      this.uploadStatus[key] = 'failed';
      throw error;
    } finally {
      this.isLoading[key] = false;
    }
  }

  cancelAll() {
    for (const key in this.abortControllers) {
      this.abortControllers[key]?.abort();
      this.isLoading[key] = false;
      this.uploadStatus[key] = 'pending';
      this.uploadProgress[key] = 0;
    }
  }

  confirmClearFiles() {
    this.closeAllDialogs();
    this.showClearConfirmDialog = true;
  }

  clearAllFiles() {
    for (const type of this.fileTypes) {
      this.uploadedFiles[type.key] = null;
      this.uploadStatus[type.key] = 'pending';
      this.uploadProgress[type.key] = 0;
      this.isLoading[type.key] = false;
    }
    this.showClearConfirmDialog = false;
  }

  private async uploadFileInChunks(file: File, key: string, signal: AbortSignal): Promise<void> {
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (signal.aborted) {
        throw new Error('Upload aborted by user.');
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk, file.name);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);

      this.uploadProgress[key] = Math.round(((chunkIndex + 1) / totalChunks) * 100);

      await firstValueFrom(
        this.fileUploadService.uploadChunk(formData, signal, key, this.selectedDate)
      );
    }
  }

  private showError(header: string, message: string): void {
    this.closeAllDialogs();
    this.dialogType = 'error';
    this.dialogHeader = header;
    this.dialogMessage = message;
    this.showErrorDialog = true;
  }

  private closeAllDialogs(): void {
    this.showSuccessDialog = false;
    this.showClearConfirmDialog = false;
    this.showErrorDialog = false;
  }

  onDialogClose() {
    this.closeAllDialogs();
  }
}