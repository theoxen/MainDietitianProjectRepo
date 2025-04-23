import { Component } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-report',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './select-report.component.html',
  styleUrl: './select-report.component.css'
})
export class SelectReportComponent {
  constructor(private router: Router) {}

  navigateToReport(reportType: string) {
      this.router.navigate(['/reports'], { 
          queryParams: { type: reportType }
      });
      // console.log('Navigating to report:', reportType);
  }
}
