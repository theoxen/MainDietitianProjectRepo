import { Component } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewReportsComponent {
  reportData: any;
  reportType: string = '';
  reportContent: string = '';


  isNewUsersReport: boolean = false;
  isAgeReport: boolean = false;
  isAppointmentReport: boolean = false;
  isDietTypeReport: boolean = false;

  constructor(private reportsService: ReportsService,private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Retrieve query parameters
    this.route.queryParams.subscribe(params => {
      this.reportData = params;
      this.reportType = params['reportType']; // Extract the report type
      console.log('Received Report Data:', this.reportData);
      console.log('Report Type:', this.reportType);

      // Determine the report content based on the report type
      this.setReportContent();
    });
  }

  setReportContent(): void {
    // Reset all flags
    this.isNewUsersReport = false;
    this.isAgeReport = false;
    this.isAppointmentReport = false;
    this.isDietTypeReport = false;

    // Set the appropriate flag and content based on the report type
    switch (this.reportType) {
      case 'New Users Report':
        this.isNewUsersReport = true;
        this.fetchNewUsersReport();
        break;
      case 'Age Report':
        this.isAgeReport = true;
        this.fetchAgeReport();
        break;
      case 'Appointment Report':
        this.isAppointmentReport = true;
        this.fetchAppointmentReport();
        break;
      case 'Diet Type Report':
        this.isDietTypeReport = true;
        this.fetchDietTypeReport();
        break;
      default:
        this.reportContent = 'Unknown report type.';
        break;
    }
  }

  fetchNewUsersReport(): void {
    this.reportsService.fetchNewUsersReport(this.reportData).subscribe(
      response => {
        this.reportContent = `New Users Report Data: ${JSON.stringify(response)}`;
      },
      error => {
        console.error('Error fetching New Users Report:', error);
        this.reportContent = 'Failed to fetch New Users Report.';
      }
    );
  }

  fetchAgeReport(): void {
    this.reportsService.fetchAgeReport(this.reportData).subscribe(
      response => {
        this.reportContent = `Age Report Data: ${JSON.stringify(response)}`;
      },
      error => {
        console.error('Error fetching Age Report:', error);
        this.reportContent = 'Failed to fetch Age Report.';
      }
    );
  }

  fetchAppointmentReport(): void {
    this.reportsService.fetchAppointmentReport(this.reportData).subscribe(
      response => {
        this.reportContent = `Appointment Report Data: ${JSON.stringify(response)}`;
      },
      error => {
        console.error('Error fetching Appointment Report:', error);
        this.reportContent = 'Failed to fetch Appointment Report.';
      }
    );
  }

  fetchDietTypeReport(): void {
    this.reportsService.fetchDietTypeReport(this.reportData).subscribe(
      response => {
        this.reportContent = `Diet Type Report Data: ${JSON.stringify(response)}`;
      },
      error => {
        console.error('Error fetching Diet Type Report:', error);
        this.reportContent = 'Failed to fetch Diet Type Report.';
      }
    );
  }


}
