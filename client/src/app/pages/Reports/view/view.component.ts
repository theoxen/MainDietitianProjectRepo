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
    switch (this.reportType) {
      case 'ReportForm1':
        this.isNewUsersReport = true;
        this.fetchNewUsersReport(this.reportData.field1, this.reportData.field2);
        break;
      case 'ReportForm2': // Add this case to handle ReportForm2
        this.isAgeReport = true;
        this.fetchAgeReport(this.reportData.field1, this.reportData.field2);
        break;
      case 'ReportForm3':
        this.isAppointmentReport = true;
        this.fetchAppointmentReport(this.reportData.field1, this.reportData.field2);
        break;
      case 'ReportForm4':
        this.isDietTypeReport = true;
        this.fetchDietTypeReport(this.reportData.dietTypeId);
        break;
      default:
        this.reportContent = 'Unknown report type.';
        break;
    }
  }

  fetchNewUsersReport(datestart: string, dateend: string): void {
    this.reportsService.fetchNewUsersReport(datestart, dateend).subscribe({
      next: (data) => {
        this.reportContent = `New Users Report: From ${datestart} to ${dateend}`;
      },
      error: (error) => {
        console.error('Error fetching New Users Report:', error);
        this.reportContent = 'Failed to fetch New Users Report.';
      }
    });
  }
///////////////////////////////////////////////////////////////////////////
fetchAgeReport(agestart: number, ageend: number): void {
  console.log('Fetching Age Report:', agestart, ageend); // Debugging log
  this.reportsService.fetchAgeReport(agestart, ageend).subscribe({
    next: (data) => {
      console.log('Age Report Data:', data); // Debugging log
      this.reportData = data; // Store the fetched data in the component
    },
    error: (error) => {
      console.error('Error fetching Age Report:', error);
      this.reportContent = 'Failed to fetch Age Report.';
    }
  });
}
  /////////////////////////////////////////////////////////////////////////////////

  fetchAppointmentReport(datestart: string, dateend: string): void {
    this.reportsService.fetchAppointmentReport(datestart, dateend).subscribe({
      next: (data) => {
        this.reportContent = `Appointment Report: From ${datestart} to ${dateend}`;
      },
      error: (error) => {
        console.error('Error fetching Appointment Report:', error);
        this.reportContent = 'Failed to fetch Appointment Report.';
      }
    });
  }

  fetchDietTypeReport(dietTypeId: string): void {
    this.reportsService.fetchDietTypeReport(dietTypeId).subscribe({
      next: (data) => {
        this.reportContent = `Diet Type Report: Diet Type ID ${dietTypeId}`;
      },
      error: (error) => {
        console.error('Error fetching Diet Type Report:', error);
        this.reportContent = 'Failed to fetch Diet Type Report.';
      }
    });
  }


}

//TODO: need to fix dtos
//take all the data from the report and show it in the view component
//output the data in a table format

