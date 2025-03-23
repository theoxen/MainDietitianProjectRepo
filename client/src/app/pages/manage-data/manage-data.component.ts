import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { HttpClient } from '@angular/common/http';
import { DataManagementService } from '../../services/data-management.service';

@Component({
  selector: 'app-manage-data',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './manage-data.component.html',
  styleUrl: './manage-data.component.css'
})
export class ManageDataComponent {
  httpClient = inject(HttpClient);
  dataManagementService = inject(DataManagementService);

  selectedFile: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;
  
  
  backup() {
    this.dataManagementService.backup().subscribe({
        next: response => {          
          const now = new Date();
          const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
          const filename = `db_backup_${timestamp}.json`;
          
          console.log('Using filename:', filename);
          
          // Create a blob URL for the file
          const blob = new Blob([response.body!], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          
          // Create a link element and trigger download
          const link = document.createElement('a');
          link.href = url;
          link.download = filename; // Use our own timestamped filename
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          window.URL.revokeObjectURL(url);
        },
        error: err => {
          console.error('Error downloading backup:', err);
        }
      });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
      console.log('File selected:', this.selectedFile!.name);
    }
  }

  restore() {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }
 
    // Let the browser set the content type header automatically
    this.dataManagementService.restore(this.selectedFile).subscribe({
      next: (response) => {
        console.log('File uploaded successfully', response);
        // Add success message or UI feedback here
      },
      error: (error) => {
        console.error('Error uploading file', error);
        // Add error handling or UI feedback here
      }
    });
  }
}
