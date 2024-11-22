import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  selectedFileType: string = '';
  isLoading: boolean = false;
  uploadProgress: number = 0; // This will hold the progress percentage
  uploadSuccess: boolean = false;
  uploadError: string = '';
  successMessage: string = '';
  isDragOver: boolean = false;
  isModalOpen: boolean = false;
  dialogType: 'info' | 'warning' | 'error' | 'success' = 'info';
  dialogHeader: string = '';
  dialogMessage: string = '';
  validFileTypes: string[] = [
    'Traited_Store_Details',
    'POS_Sale',
    'POS_Qty',
    'On_Hand_Qty',
  ];
  chunkSize: number = 5 * 1024 * 1024; // 5 MB
  private abortController: AbortController | null = null;

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit() {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.uploadError = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  validateForm(): boolean {
    if (!this.selectedFileType) {
      this.uploadError = 'Please select a file type.';
      this.showDialog('warning', 'Warning', this.uploadError);
      return false;
    }
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file.';
      this.showDialog('warning', 'Warning', this.uploadError);
      return false;
    }
    if (
      ![
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(this.selectedFile.type)
    ) {
      this.uploadError =
        'Invalid file type. Only CSV and Excel files are allowed.';
      this.showDialog('error', 'Error', this.uploadError);
      return false;
    }
    if (!this.validFileTypes.includes(this.selectedFileType)) {
      this.uploadError =
        'Invalid file type selected. Please choose from valid types.';
      this.showDialog('warning', 'Warning', this.uploadError);
      return false;
    }
    return true;
  }

  async onSubmit() {
    if (!this.validateForm() || !this.selectedFile) return;

    // Initialize abort controller to manage cancellation
    this.abortController = new AbortController();

    this.isLoading = true;
    this.uploadProgress = 0;
    this.dialogHeader = 'Uploading...';
    this.dialogMessage = 'Your file is being uploaded in chunks. Please wait.';
    this.isModalOpen = false; // Close the dialog box during the upload process

    try {
      await this.uploadFileInChunks(this.selectedFile);
      this.uploadSuccess = true;
      this.successMessage = 'File uploaded successfully!';
      this.showDialog('success', 'Success', this.successMessage);
    } catch (error: any) {
      if (this.abortController?.signal.aborted) {
        this.uploadError = 'Upload was canceled by the user.';
        this.showDialog('error', 'Canceled', this.uploadError);
      } else {
        this.uploadError =
          error?.message || 'Upload failed. Please try again later.';
        this.showDialog('error', 'Error', this.uploadError.substring(0, 100)); // Show a shortened error message
      }
    } finally {
      this.isLoading = false;
      this.resetForm();
    }
  }

  cancelUpload() {
    if (this.abortController) {
    
      this.abortController.abort();
      this.uploadError = 'Upload has been canceled.';
      this.showDialog('error', 'Upload Canceled', this.uploadError);
      this.isLoading = false;
      this.resetForm();
    }
  }

  private async uploadFileInChunks(file: File): Promise<void> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk, file.name);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('fileType', this.selectedFileType);

      
      this.uploadProgress = Math.round(((chunkIndex + 1) / totalChunks) * 100);

    
      try {
        await firstValueFrom(this.fileUploadService.uploadChunk(formData, this.abortController?.signal));
      } catch (error) {
        throw error;
      }
    }
  }

  private showDialog(type: 'info' | 'success' | 'warning' | 'error', header: string, message: string): void {
    this.dialogType = type;
    this.dialogHeader = header;
    this.dialogMessage = message;
    this.isModalOpen = true;
  }

  private resetForm() {
    this.selectedFile = null;
    this.selectedFileType = '';
    this.uploadProgress = 0;
  }

  onDialogClose() {
    this.isModalOpen = false;
  }
}
