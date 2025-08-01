import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  ChangeDetectorRef
} from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-weekly-reports',
  templateUrl: './weekly-reports.component.html',
  styleUrls: ['./weekly-reports.component.css'],
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
export class WeeklyReportsComponent implements OnInit {
  fileTypes = [
    { key: 'employee_weekly', label: 'Horizon Group USA – Full time' },
    { key: 'diverse_weekly', label: 'Divers Staffing - Temp' },
    { key: 'hire_dynamics_weekly', label: 'Hire Dynamics - Temp' },
    { key: 'freight_breakers_weekly', label: 'Freight Breakers - Temp' },
  ];

  startDate: string = '';
  endDate: string = '';
  uploadedFiles: Record<string, File | null> = {};
  isLoading: Record<string, boolean> = {};
  uploadStatus: Record<string, 'pending' | 'uploading' | 'uploaded' | 'failed'> = {};
  uploadProgress: Record<string, number> = {};
  isDragOver: string | null = null;

  showSuccessDialog = false;
  showClearConfirmDialog = false;
  showErrorDialog = false;
  dialogType: 'info' | 'warning' | 'error' | 'success' = 'info';
  dialogHeader = '';
  dialogMessage = '';

  showInitialInfoDialog = true;
  showInitialPopup: boolean = true;

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
      this.uploadStatus[key] = 'pending';
      this.isLoading[key] = false;
      this.uploadProgress[key] = 0;
    });
    this.showInitialInfoDialog = true;
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

  isDateRangeInvalid(): boolean {
    if (!this.startDate || !this.endDate) return true;
    return new Date(this.startDate) > new Date(this.endDate);
  }

  onStartDateChange(dateStr: string) {
    this.startDate = dateStr;
    if (dateStr) {
      const start = new Date(dateStr);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      this.endDate = end.toISOString().split('T')[0];
    } else {
      this.endDate = '';
    }
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
    this.fileTypes.forEach(({ key }) => this.clearFile(key));
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
    this.isLoading[key] = false;
    this.uploadProgress[key] = 0;
  }

  private async parseExcelFile(file: File, type: string): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rawRows: (string | number | null)[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
        });

        const dataSection = ['diverse_weekly', 'employee_weekly'].includes(type)
          ? rawRows.slice(4)
          : rawRows;

        if (dataSection.length < 2) {
          reject(new Error('Insufficient data to extract headers and rows'));
          return;
        }

        const [headerRow, ...dataRows] = dataSection;

        const jsonData: Record<string, any>[] = dataRows
          .filter(row => row.some(cell => cell !== null && cell !== ''))
          .map(row => {
            const obj: Record<string, any> = {};
            headerRow.forEach((header, index) => {
              const key = String(header ?? `column_${index}`).trim();
              obj[key] = row[index] ?? null;
            });
            return obj;
          });

        resolve(jsonData);
      };

      reader.onerror = err => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  private async uploadSingleFile(key: string): Promise<void> {
    const file = this.uploadedFiles[key];
    if (!file) return;

    this.isLoading[key] = true;
    this.uploadStatus[key] = 'uploading';

    try {
      const dataArray = await this.parseExcelFile(file, key);

      this.uploadProgress[key] = 25;
      await firstValueFrom(
        this.fileUploadService.uploadData({
          fileType: key,
          fileName: file.name,
          startDate: this.startDate,
          endDate: this.endDate,
          data: dataArray,
          reportDate: ''
        })
      );
      this.uploadProgress[key] = 100;
      this.uploadStatus[key] = 'uploaded';
    } catch (error) {
      this.uploadStatus[key] = 'failed';
      this.uploadProgress[key] = 0;
      throw error;
    } finally {
      this.isLoading[key] = false;
    }
  }

  async onSubmitAllSequential() {
    this.closeAllDialogs();

    if (!this.startDate || !this.endDate) {
      return this.showError('Date Range Required', 'Please select both start and end dates.');
    }

    if (this.isDateRangeInvalid()) {
      return this.showError('Invalid Date Range', 'Start date must be before or equal to end date.');
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
    this.showInitialInfoDialog = false;
  }

  onDialogClose() {
    this.closeAllDialogs();
  }

  closeInitialPopup() {
    this.showInitialPopup = false;
  }
}
