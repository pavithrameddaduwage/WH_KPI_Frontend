import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  ChangeDetectorRef
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

  selectedDate = '';
  uploadedFiles: Record<string, File | null> = {};
  uploadProgress: Record<string, number> = {};
  isLoading: Record<string, boolean> = {};
  uploadStatus: Record<string, 'pending' | 'uploading' | 'uploaded' | 'failed'> = {};
  abortControllers: Record<string, AbortController> = {};
  isDragOver: string | null = null;

  showSuccessDialog = false;
  showClearConfirmDialog = false;
  showErrorDialog = false;
  dialogType: 'info' | 'warning' | 'error' | 'success' = 'info';
  dialogHeader = '';
  dialogMessage = '';

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  private readonly allowedExtensions = ['csv', 'xls', 'xlsx'];

  constructor(
    public fileUploadService: FileUploadService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fileTypes.forEach(({ key }) => {
      this.uploadedFiles[key] = null;
      this.uploadProgress[key] = 0;
      this.isLoading[key] = false;
      this.uploadStatus[key] = 'pending';
    });
  }

  get isAnyUploading(): boolean {
    return Object.values(this.uploadStatus).includes('uploading');
  }

  get hasFileSelected(): boolean {
    return Object.values(this.uploadedFiles).some(file => !!file);
  }

  get allUploadsComplete(): boolean {
    return this.fileTypes.every(({ key }) => this.uploadStatus[key] === 'uploaded');
  }

  triggerFileInput(key: string) {
    const index = this.fileTypes.findIndex(type => type.key === key);
    const inputRef = this.fileInputs.get(index);
    inputRef?.nativeElement.click();
  }

  private isFileTypeAllowed(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return this.allowedTypes.includes(file.type) || this.allowedExtensions.includes(ext);
  }

  private validateAndAssignFile(file: File, key: string) {
    if (!this.isFileTypeAllowed(file)) {
      this.showError('Invalid File Type', 'Only CSV, XLS, and XLSX files are allowed.');
      this.clearFile(key);
      return;
    }

    this.uploadedFiles[key] = file;
    this.uploadProgress[key] = 0;
    this.uploadStatus[key] = 'pending';
  }

  onFileChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) this.validateAndAssignFile(file, key);
  }

  onFileDrop(event: DragEvent, key: string) {
    event.preventDefault();
    this.isDragOver = null;

    const file = event.dataTransfer?.files?.[0];
    if (file) this.validateAndAssignFile(file, key);
  }

  onDragOver(event: DragEvent, key: string) {
    event.preventDefault();
    this.isDragOver = key;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = null;
  }

  cancelAll() {
    Object.keys(this.abortControllers).forEach(key => {
      this.abortControllers[key]?.abort();
      this.clearFile(key);
    });
  }

  confirmClearFiles() {
    this.closeAllDialogs();
    this.showClearConfirmDialog = true;
  }

  clearAllFiles() {
    this.fileTypes.forEach(({ key }) => this.clearFile(key));
    this.showClearConfirmDialog = false;
  }

  clearFile(key: string) {
    this.uploadedFiles[key] = null;
    this.uploadStatus[key] = 'pending';
    this.uploadProgress[key] = 0;
    this.isLoading[key] = false;
    delete this.abortControllers[key];
  }

  private async uploadFileInChunks(file: File, key: string, signal: AbortSignal): Promise<void> {
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      if (signal.aborted) throw new Error('Upload aborted by user.');

      const start = i * chunkSize;
      const chunk = file.slice(start, start + chunkSize);
      const formData = new FormData();

      formData.append('file', chunk, file.name);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('date', this.selectedDate);
      formData.append('fileType', key);  

      this.uploadProgress[key] = Math.round(((i + 1) / totalChunks) * 100);

      await firstValueFrom(
        this.fileUploadService.uploadChunk(formData, signal, key, this.selectedDate)
      );
    }
  }

  private async uploadSingleFile(key: string): Promise<void> {
    const file = this.uploadedFiles[key];
    if (!file) return;

    const controller = new AbortController();
    this.abortControllers[key] = controller;
    this.isLoading[key] = true;
    this.uploadStatus[key] = 'uploading';

    try {
      await this.uploadFileInChunks(file, key, controller.signal);
      this.uploadStatus[key] = 'uploaded';
    } catch (error: any) {
      this.uploadStatus[key] = 'failed';
      throw error;
    } finally {
      this.isLoading[key] = false;
    }
  }

 async onSubmitAllSequential() {
  this.closeAllDialogs();

  if (!this.selectedDate) {
    return this.showError('Date Required', 'Please select a report date before uploading.');
  }

  const keysToUpload = Object.keys(this.uploadedFiles).filter(
    key => this.uploadedFiles[key]
  );

  if (keysToUpload.length === 0) {
    return this.showError('No Files Selected', 'Please select at least one file.');
  }

  const failedFiles: string[] = [];
  let hasSuccessfulUpload = false;

  for (const key of keysToUpload) {
    try {
      await this.uploadSingleFile(key);
      hasSuccessfulUpload = true;
    } catch {
      const label = this.fileTypes.find(t => t.key === key)?.label || key;
      failedFiles.push(label);
    }
  }

  if (hasSuccessfulUpload) {
    this.showSuccessDialog = true;
    this.cdRef.detectChanges();
  }

  if (failedFiles.length > 0) {
    this.showError(
      'Partial Upload Failed',
      `The following files failed to upload:\n- ${failedFiles.join('\n- ')}`
    );
  }
}


  private showError(header: string, message: string) {
    this.dialogType = 'error';
    this.dialogHeader = header;
    this.dialogMessage = message;
    this.showErrorDialog = true;
    this.cdRef.detectChanges();  
  }

  private closeAllDialogs() {
    this.showSuccessDialog = false;
    this.showClearConfirmDialog = false;
    this.showErrorDialog = false;
  }

  onDialogClose() {
    this.closeAllDialogs();
  }
}
