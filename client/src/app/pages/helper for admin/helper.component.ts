import { Component, HostListener } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

interface HelperSection {
  title: string;
  content: string;
  isExpanded: boolean;
  isHtml?: boolean;
}

@Component({
  selector: 'app-helper',
  templateUrl: './helper.component.html',
  styleUrls: ['./helper.component.css'],
  standalone: true,
  imports: [NavBarComponent, CommonModule, FormsModule]
})
export class HelperComponent {

  searchTerm: string = '';
  isSearching: boolean = false;
  helperSections: HelperSection[] = [
    {
      title: 'Sign In',
      content: '', // Content will be in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Reset Your Password',
      content: '', // Content will be in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Register a Client',
      content: '', // Content is now in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Update Client Details',
      content: '', // Content will be in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Delete a Client',
      content: '', // Content will be in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Search and View Client Details',
      content: '', // Content is now in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add Body Metrics for a Client',
      content: '', // Content is now in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'View Client History',
      content: '', // Content will be in the HTML template
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Schedule an Appointment',
      content: 'Manage your appointments efficiently with our calendar system. Schedule new appointments, send reminders, and track client attendance. The calendar provides daily, weekly, and monthly views.',
      isExpanded: false
    },
    {
      title: 'Cancel an Appointment',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'View Old Appointments',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Reschedule An Appointment',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add New Diet for a Client',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add New Diet from Template',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Edit Client Diet',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Print Client Diet',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Delete Client Diet',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add New Diet Template',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Edit Diet Template',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Delete Diet Template',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add Note',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Update Note',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Delete Note',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add a Recipe',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Edit a Recipe',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Delete a Recipe',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'View Recipes',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add New Article',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Add a New Advice for Clients',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Generate a Statistics Report',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Create a Backup',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'Restore Data from a Backup',
      content: '',
      isExpanded: false,
      isHtml: true
    }
  ];

  filteredSections: HelperSection[] = this.helperSections;

  toggleSection(section: HelperSection) {
    if (!section.isExpanded) {
      this.helperSections.forEach(s => {
        if (s !== section) {
          s.isExpanded = false;
        }
      });
    }
    section.isExpanded = !section.isExpanded;
  }

  filterGuides(): void {
    console.log('filterGuides called with searchTerm:', this.searchTerm); // Add this
    this.isSearching = true;
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredSections = this.helperSections.filter(section => 
        section.title.toLowerCase().includes(searchTerm)
    );
    console.log('filtered sections:', this.filteredSections.length); // Add this
    
    setTimeout(() => {
        this.isSearching = false;
    }, 300);
}

  isVisible(section: HelperSection): boolean {
    if (!this.searchTerm) return true;
    return this.filteredSections.some(s => s.title === section.title);
  }

  // Optional: Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredSections = this.helperSections;
    this.isSearching = false;
  }

  // Optional: Handle escape key
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.clearSearch();
  }
} 