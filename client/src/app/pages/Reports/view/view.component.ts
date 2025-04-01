import { Component } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../services/reports.service';
import { DatePipe, NgFor } from '@angular/common';
import { Metrics, ReportData } from '../../../models/Reports/ReportsData';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NavBarComponent, DatePipe, NgFor],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewReportsComponent {
  reportData: any;
  reportType: string = '';
  reportContent: string = '';
  data: ReportData[] = []; // Initialize data as an empty array
  
  totalUsers: number = 0;
  totalAppointments: number = 0;
  averageWeight: number = 0;
  averageFatMass: number = 0;
  averageMuscleMass: number = 0;

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
      case 'ReportForm2':
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
        this.data = Array.isArray(data) ? data : [data];
        this.calculateStatistics(); // Calculate statistics after fetching data
        console.log('New Users Report Data:', this.data);
      },
      error: (error) => {
        console.error('Error fetching New Users Report:', error);
        this.reportContent = 'Failed to fetch New Users Report.';
      }
    });
  }
///////////////////////////////////////////////////////////////////////////
// fetchAgeReport(agestart: number, ageend: number): void {
//   console.log('Fetching Age Report:', agestart, ageend);
//   this.reportsService.fetchAgeReport(agestart, ageend).subscribe({
//     next: (data) => {
//       this.data = Array.isArray(data) ? data : [data];
//     },
//     error: (error) => {
//       console.error('Error fetching Age Report:', error);
//       this.reportContent = 'Failed to fetch Age Report.';
//     }
//   });
// }
    fetchAgeReport(agestart: number, ageend: number): void {
      this.reportsService.fetchAgeReport(agestart, ageend).subscribe({
        next: (data) => {
              this.data = Array.isArray(data) ? data : [data];
              this.calculateStatistics(); // Calculate statistics after fetching data
          },
          error: (error) => {
              console.error('Error fetching Age Report:', error);
          }
      });
    }

    calculateStatistics(): void {
      this.totalUsers = this.data.length;

      let totalWeight = 0;
      let totalFatMass = 0;
      let totalMuscleMass = 0;
      let metricsCount = 0;

      this.totalAppointments = this.data.reduce((total, user) => {
          return total + (user.appointments?.length || 0);
      }, 0);

      this.data.forEach(user => {
          user.metrics?.forEach(metric => {
              totalWeight += metric.bodyweight;
              totalFatMass += metric.fatMass;
              totalMuscleMass += metric.muscleMass;
              metricsCount++;
          });
      });

      this.averageWeight = metricsCount > 0 ? totalWeight / metricsCount : 0;
      this.averageFatMass = metricsCount > 0 ? totalFatMass / metricsCount : 0;
      this.averageMuscleMass = metricsCount > 0 ? totalMuscleMass / metricsCount : 0;
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

