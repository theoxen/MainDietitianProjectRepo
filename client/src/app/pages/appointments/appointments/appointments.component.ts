import { Component, Inject, inject, Renderer2, ViewChild } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';
import { AnAppointment, CalendarComponent } from '../../calendar/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../../services/appointments.service';
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface CalendarDate {
  date: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
}
interface theAppointment {
  date: Date;
  time: string;
}
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [NavBarComponent, CalendarComponent, CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})

export class AppointmentsComponent {

  dateColor: string = '#FFB453';
  timeColor: string = '#fffff';
  userColor: string = '#fffff';
  step1Display: string = "block";    
  step2Display: string = "none"; 
  step3Display: string = "none";
  calendarDisplay: string = "block"; 
  datesSelected: boolean = false;
  clientId: any;
  appointmentHolder!: theAppointment;
  clients!:ClientProfile[];
  selectedClientId: string | null = null;
  selectedClientName: string = '';
  showConfirmationModal: boolean = false;
  searchQuery: string = '';
  filteredClients!: ClientProfile[];

  appointmentsService = inject(AppointmentsService);
  clientManagementService = inject(ClientManagementService);
  private toastr = inject(ToastrService);
  
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;

 
  constructor(private route: ActivatedRoute, private renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Hide the footer when initializing this component.
    
    // Hide the footer element.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.setStyle(footer, 'display', 'none');
    }

    // Pre-load clients
    this.loadClients();
    // console.log(this.filteredClients);
  }

  loadClients() {
    this.clientManagementService.getAllClientsWithId().subscribe({
      next: (clients: ClientProfile[]) => {
        // Store all clients
        this.clients = clients;
        
        // Filter out admin users
        this.filteredClients = this.clients.filter(client => 
          client.fullName !== 'admin'
        );

        this.clients = this.filteredClients;
        // Initialize filtered clients with all non-admin clients


      },
      error: (error) => {
        console.error("Error loading clients:", error);
      }
    });
  }

  filterClients() {
    if (!this.searchQuery.trim()) {
      // If search is empty, show all clients
      this.filteredClients = [...this.clients];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredClients = this.clients.filter(client => 
        client.fullName.toLowerCase().includes(query)
      );
    }
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.filteredClients = [...this.clients];
  }

  addDate(appointment: AnAppointment) {
    this.datesSelected = true;
    const theAppointment: AnAppointment = {
      date: appointment.date,
      time: appointment.time
    };
    this.appointmentHolder = theAppointment;
    this.step3Display = "block";
    this.step2Display = "none"
    this.userColor = this.timeColor;
    this.calendarDisplay = "none";
    
    // Reset client selection when moving to step 3
    this.selectedClientId = null;
    this.selectedClientName = '';
    this.searchQuery = '';
    
    // Refresh clients list
    this.loadClients();
  }

  selectClient(client: ClientProfile) {
    // Set the selectedClientId to the clicked client's ID
    console.log("client:", client);
    this.selectedClientId = client.id;
    this.selectedClientName = client.fullName;
    console.log("Selected client:", client.fullName, "with ID:", client.id);
  }
  
  cancelSelection() {
    // Reset everything and go back to calendar view
    this.datesSelected = false;
    this.step1Display = "none";
    this.step2Display = "block";
    this.step3Display = "none";
    this.calendarDisplay = "block";
    this.selectedClientId = null;
    this.selectedClientName = '';
    this.timeColor = '#FFB453';
    this.userColor = '#ffffff';
    // Also reset search
    this.searchQuery = '';
  }
  
  openConfirmationModal() {
    if (this.selectedClientId) {
      this.showConfirmationModal = true;
    }
  }
  
  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  
  confirmAppointment() {
    if (!this.appointmentHolder || !this.selectedClientId) {
      this.toastr.error("Missing appointment information");
      return;
    }
    
    // Clone the date to avoid mutations
    const appointmentDate = new Date(this.appointmentHolder.date);

    appointmentDate.setMinutes(appointmentDate.getMinutes() - appointmentDate.getTimezoneOffset());

    // Parse the time string correctly
    const timeString = this.appointmentHolder.time;
    const [timePart, period] = timeString.split(' ');
    const [hourStr, minuteStr] = timePart.split(':');
    
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);
    
    // Convert to 24-hour format if necessary
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Set the time components while preserving the date
    appointmentDate.setHours(hours, minutes, 0, 0);

        
    const appointmentToAdd = {
      appointmentDate: appointmentDate,
      userId: this.selectedClientId
    };
    
    this.appointmentsService.addAppointment(appointmentToAdd).subscribe({
      next: () => {
        // Success handling
        this.toastr.success("Appointment added successfully.");
        // Close modal and reset
        this.showConfirmationModal = false;

        this.datesSelected = false;
        this.selectedClientId = null;
        this.selectedClientName = '';
        // Also reset search
        this.searchQuery = '';
        this.dateColor = '#FFB453';
        this.timeColor = 'white';
        this.userColor = 'white';
        this.step1Display = "block";    
        this.step2Display = "none"; 
        this.step3Display = "none";
        this.calendarDisplay = "block"; 
        this.resetCalendarSelection();
      },
      error: (error) => {
        this.toastr.error("Error adding appointment: " + (error.message || "Unknown error"));
        console.error("Error adding appointment:", error);
      }
    });
  }

  // Method to call the child's resetSelection method
  resetCalendarSelection() {
    // Check if the reference exists before calling the method
    if (this.calendarComponent) {
      this.calendarComponent.resetSelection();
      this.calendarComponent.calendarAndFetchingInitialization();
    }
  }



  // This method is now fixed to properly handle time conversion
  addAppointment() {
    if (!this.appointmentHolder || !this.clientId) {
      this.toastr.error("Missing appointment information");
      return;
    }

    const appointment = this.appointmentHolder;
    
    // Clone the date to avoid mutations
    const appointmentDate = new Date(appointment.date);
    
    // Parse the time string correctly
    const timeString = appointment.time;
    const [timePart, period] = timeString.split(' ');
    const [hourStr, minuteStr] = timePart.split(':');
    
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);
    
    // Convert to 24-hour format if necessary
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Set the time components while preserving the date
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    // Create the appointment object
    const appointmentToAdd = {
      appointmentDate: appointmentDate,
      userId: this.clientId
    };

    // Call service to add the metrics
    this.appointmentsService.addAppointment(appointmentToAdd).subscribe({
      next: () => {
        this.toastr.success("Appointment added successfully");
      },
      error: (error: any) => {
        this.toastr.error("Error adding appointment: " + (error.message || "Unknown error"));
        console.error("Error adding appointment:", error);
      }
    });
  }

  onCalendarDateClicked(selectedDate: CalendarDate) : void {
    if (selectedDate.date == -1) {
      // selectedDate is a CalendarDate (cancel button clicked)
      this.step1Display = "block";
      this.step2Display = "none";
      this.timeColor = "white";
    } else {
      // selectedDate is a CalendarDate
      this.timeColor = this.dateColor;
      this.step1Display = "none";
      this.step2Display = "block";
    }
  }

  ngOnDestroy(): void {
    // Restore the footer when leaving this component.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.removeStyle(footer, 'display');
    }
  }
}