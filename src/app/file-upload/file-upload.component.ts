import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  selectedFileType: string = '';
  isLoading = false;
  uploadSuccess = false;
  uploadError = '';
  successMessage = '';
  isDragOver = false;
  isModalOpen = false;
  dialogType: 'info' | 'warning' | 'error' | 'success' = 'info';
  dialogHeader = '';
  dialogMessage = '';
  validFileTypes: string[] = ['Traited_Store_Details', 'POS_Sale', 'POS_Qty', 'On_Hand_Qty'];

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit() {}

  // File input change handler
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';
    }
  }

  // Drag-and-drop file handling
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.uploadError = '';
    }
  }

  // Drag over and leave event handling for styling
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  // Form validation logic
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
    if (!['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(this.selectedFile.type)) {
      this.uploadError = 'Invalid file type. Only CSV and Excel files are allowed.';
      this.showDialog('error', 'Error', this.uploadError);
      return false;
    }
    if (!this.validFileTypes.includes(this.selectedFileType)) {
      this.uploadError = 'Invalid file type selected. Please choose from valid types.';
      this.showDialog('warning', 'Warning', this.uploadError);
      return false;
    }
    return true;
  }

  // Submit the file for upload
  onSubmit() {
    console.log('Submit clicked, uploading file...');
    this.uploadError = '';
    this.successMessage = '';
    this.uploadSuccess = false;
  
    if (this.validateForm()) {
      if (this.selectedFile) {
        this.isLoading = true;
        this.dialogHeader = 'Uploading...';
        this.dialogMessage = 'Your file is being uploaded. Please wait.';
        this.showDialog('info', 'Uploading', this.dialogMessage);
  
        // Create FormData object and append file and fileType
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('fileType', this.selectedFileType); // Make sure fileType is appended
  
        // Call the service method and pass formData
        this.fileUploadService.upload(formData).subscribe({
          next: (response) => {
            this.uploadSuccess = true;
            this.successMessage = response.message || 'File uploaded successfully!';
            this.showDialog('success', 'Success', this.successMessage);
            this.resetForm();  
          },
          error: (error) => {
            this.uploadError = error.message || 'Upload failed. Please try again later.';
            this.showDialog('error', 'Error', this.uploadError);
            this.resetForm();
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    }
  }

  // Display modal dialog box
  showDialog(type: 'info' | 'warning' | 'error' | 'success', header: string, message: string) {
    this.dialogType = type;
    this.dialogHeader = header;
    this.dialogMessage = message;
    this.isModalOpen = true;
  }

  // Close the dialog box
  onDialogClose() {
    this.isModalOpen = false;
  }

  // Reset the form inputs and error messages
  resetForm() {
    this.selectedFile = null;
    this.selectedFileType = '';
  }
}
