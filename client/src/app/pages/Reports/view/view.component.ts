import { Component, Renderer2 } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../services/reports.service';
import { DatePipe, KeyValuePipe, NgFor } from '@angular/common';
import { Metrics, ReportData } from '../../../models/Reports/ReportsData';
import { Appointment } from '../../../models/Reports/Appointments';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NavBarComponent, DatePipe, NgFor, KeyValuePipe],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewReportsComponent {
  reportData: any;
  reportType: string = '';
  reportContent: string = '';
  data: ReportData[] = []; // Initialize data as an empty array

  appointment: Appointment[] = []; // Initialize appointment as an empty array


  totalUsers: number = 0;
  totalAppointments: number = 0;
  averageWeight:  number = 0;
  averageFatMass: number = 0;
  averageMuscleMass: number = 0;

  isNewUsersReport: boolean = false;
  isAgeReport: boolean = false;
  isAppointmentReport: boolean = false;
  isDietTypeReport: boolean = false;
  type?: string;
 

  constructor(private reportsService: ReportsService, private route: ActivatedRoute, private renderer: Renderer2) { }

  ngOnInit(): void {

    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.setStyle(footer, 'display', 'none');
    }
  
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
        this.fetchDietTypeReport(this.reportData.field1);
        break;
      default:
        this.reportContent = 'Unknown report type.';
        break;
    }
  }
  //////////////////////////////////////////////New Users////////////////////////////////////
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
  ///////////////////////////////////////////////Age Users////////////////////////////
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




  ///////////////////////////////////////Apointments //////////////////////////////////////////
  // Exo doulia 
  fetchAppointmentReport(datestart: string, dateend: string): void {
    this.reportsService.fetchAppointmentReport(datestart, dateend).subscribe({
      next: (data) => {
        console.log('Appointment Report Data:', data);
        this.appointment = Array.isArray(data) ? data : [data];
        this.calculateAppointmentCount(this.appointment);
        
      },
      error: (error) => {
        console.error('Error fetching Appointment Report:', error);
        this.reportContent = 'Failed to fetch Appointment Report.';
      }
    });
  }


  busiestDay: string = '';
  busiestHour: number = 0;
  dailyAppointments: { [key: string]: number } = {};
  busiestTime: string = '';
  timeSlots: { [key: string]: number } = {};
  
  calculateAppointmentCount(appointments: Appointment[]): void {
    this.totalAppointments = appointments.length;
    
    // Initialize counters
    const dayCounts: { [key: string]: number } = {};
    const timeSlotCounts: { [key: string]: number } = {};
    
    // Count appointments by day and time
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const day = appointmentDate.toLocaleDateString('en-GB', { weekday: 'long' });
        const hour = appointmentDate.getHours();
        const minute = appointmentDate.getMinutes();
        const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Increment counters
        dayCounts[day] = (dayCounts[day] || 0) + 1;
        timeSlotCounts[timeKey] = (timeSlotCounts[timeKey] || 0) + 1;
    });
    
    // Find busiest day
    this.busiestDay = Object.entries(dayCounts)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    // Find busiest time slot
    const busiestTimeSlot = Object.entries(timeSlotCounts)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    this.busiestTime = busiestTimeSlot;
    
    // Store counts for display
    this.dailyAppointments = dayCounts;
    this.timeSlots = timeSlotCounts;
    
    console.log('Daily appointment counts:', this.dailyAppointments);
    console.log('Busiest day:', this.busiestDay);
    console.log('Busiest hour:', this.busiestHour);
}

  







  /////////////////////////////////////////Diet Type/////////////////////////////////////////
  // html gia to reports selected diet type
  // html gia to reports view diet type
  fetchDietTypeReport(dietTypeId: string): void {
    this.reportsService.fetchDietTypeReport(dietTypeId).subscribe({
      next: (data) => {
        this.data = Array.isArray(data) ? data : [data];
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error fetching Diet Type Report:', error);
        this.reportContent = 'Failed to fetch Diet Type Report.';
      }
    });
  }








  //////////////////////////////////////////////////////////////////////////////////////////////
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

    this.averageWeight = metricsCount > 0 ? parseFloat((totalWeight / metricsCount).toFixed(2)) : 0;
    this.averageFatMass = metricsCount > 0 ? parseFloat((totalFatMass / metricsCount).toFixed(2)) : 0;
    this.averageMuscleMass = metricsCount > 0 ? parseFloat((totalMuscleMass / metricsCount).toFixed(2)) : 0;
  }

  generatePDF(): void {
    // Implement PDF generation logic here
    // You can use libraries like jsPDF or html2canvas to generate a PDF from the report content
    console.log('Generating PDF for report:', this.reportContent);
    // Example: Use jsPDF to create a PDF document

  }

  isModalOpen: boolean = false; // Track whether the modal is open

  printReport(): void {
    window.print(); // Opens the browser's print dialog
  }

  ngOnDestroy(): void {
    // Restore the footer when leaving this component.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.removeStyle(footer, 'display');
    }
  }


}

//TODO: need to fix dtos
//take all the data from the report and show it in the view component
//output the data in a table format

