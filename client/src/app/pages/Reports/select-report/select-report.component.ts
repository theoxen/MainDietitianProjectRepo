
import { Component } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { Router } from '@angular/router';

// Component decorator defining metadata
@Component({
  selector: 'app-select-report', // HTML selector used to embed this component
  standalone: true, // Indicates this is a standalone component (Angular 14+)
  imports: [NavBarComponent], // Required components for this module
  templateUrl: './select-report.component.html', // Link to HTML template
  styleUrl: './select-report.component.css' // Link to CSS styles
})
export class SelectReportComponent {
  // Constructor injection of Router service for navigation
  constructor(private router: Router) {}

  navigateToReport(reportType: string) {
      this.router.navigate(['/reports'], { 
          queryParams: { type: reportType } // Adds report type as URL parameter
      });
      // console.log('Navigating to report:', reportType);
  }
}
