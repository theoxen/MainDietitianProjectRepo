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
  selector: 'app-helper-for-clients',
  templateUrl: './helper-for-clients.component.html',
  styleUrls: ['./helper-for-clients.component.css'],
  standalone: true,
  imports: [NavBarComponent, CommonModule, FormsModule]
})
export class HelperForClientsComponent {

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
      title: 'Print Client Diet',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    {
      title: 'View Uploaded Files',
      content: '',
      isExpanded: false,
      isHtml: true
    },
    
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