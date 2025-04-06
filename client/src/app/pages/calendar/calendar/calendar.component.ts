import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { AppointmentsService } from '../../../services/appointments.service';
import { Appointment } from '../../../models/appointments/appointment';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { ClientManagementService } from '../../../services/client-management.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

export interface AnAppointment {
  date: Date;
  time: string;
}

interface CalendarDate {
  date: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isWeekend?: boolean; 
  booked:number;
}

interface MonthItem {
  name: string;
  value: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  animations: [
    trigger('fadeIn', [
      // Fade in when the element is added
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms 100ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date(); // Current month by default
  calendarDays: CalendarDate[] = [];
  selectedDate: Date | null = null;
  availableTimes: string[] = ['5:00 PM','5:30 PM', '6:00 PM','6:30 PM', '7:00 PM','7:30 PM', '8:30 PM', '9:30 PM'];
  selectedTime: string | null = null;
  calendarDisplay: string = "block";
  calendarOpacity: string = "1"; 
  pointerEvent: string = "none";
  opacity: string = "0.4";
  showMonthYearPicker: boolean = false;
  months: MonthItem[] = [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 1 },
    { name: 'Mar', value: 2 },
    { name: 'Apr', value: 3 },
    { name: 'May', value: 4 },
    { name: 'Jun', value: 5 },
    { name: 'Jul', value: 6 },
    { name: 'Aug', value: 7 },
    { name: 'Sep', value: 8 },
    { name: 'Oct', value: 9 },
    { name: 'Nov', value: 10 },
    { name: 'Dec', value: 11 }
  ];
  bookedAppointments: Appointment[] = [];
  clients!:ClientProfile[];
  clientMap: Map<string, {name: string, phone: string}> = new Map();
  selectedClientPhone: string = '';
  clientName: String = "";
  selectedAppointment: Appointment | null = null;
  showEditModal: boolean = false;
  selectedClientName: string = '';
  EditAppointmentTextDisplay: string = "block";   
  ViewAppointmentTextDisplay: string = "none"; 
  RescheduleButtonsDisplay: string = "block";
  private toastr = inject(ToastrService);
  appointmentsService = inject(AppointmentsService);
  clientManagementService = inject(ClientManagementService);
  
  @Output() dateClicked = new EventEmitter<CalendarDate>();
  @Output() dateSelected = new EventEmitter<AnAppointment>();
  showCancelModal: boolean = false;


  ngOnInit() {
    this.calendarAndFetchingInitialization();
    this.clientManagementService.getAllClientsWithId().subscribe({
      next: (clients: ClientProfile[]) => {
        // Create a mapping of clientId to fullName and phone
        this.clientMap = new Map<string, {name: string, phone: string}>();
        clients.forEach(client => {
          if (client.fullName !== 'admin') {
            this.clientMap.set(client.id, {
              name: client.fullName,
              phone: client.phoneNumber || 'No phone provided' // Handle case where phone might be missing
            });
          }
        });
      },
      error: (error) => {
        console.error("Error loading clients:", error);
      }
    });
  }

calendarAndFetchingInitialization()
{
  // Call fetchAppointments and only generate calendar after data is received
  
  this.appointmentsService.fetchAllAppointments().subscribe({
  next: (appointments: Appointment[]) => {
    this.bookedAppointments = appointments;
    console.log("This is the booked appointments:",this.bookedAppointments);

    this.generateCalendar(); // Generate calendar after data is loaded
  },
  error: (error) => {
    console.error("Error fetching all appointments", error);
    this.generateCalendar(); // Still generate calendar even if fetch fails
  }
});
}

  generateCalendar() {
    // Reset calendar days
    this.calendarDays = [];
  
    // Get first day of the month and last day of the month
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1); //first day of the current month
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);//last day of the current month
  
    // Add days from previous month
    const prevMonthLastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 0); //This is used to fill in the calendar grid for the days before the current month starts.
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Calculates startingDay based on the day of the week for firstDay.
    
    
    for (let i = 0; i < startingDay; i++) {
      const dayDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, prevMonthLastDay.getDate() - i);
      const dayOfWeek = dayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
      
      this.calendarDays.unshift({ //uses unshift to add each day to the beginning of the calendarDays array, maintaining the correct order.
        date: prevMonthLastDay.getDate() - i,
        isCurrentMonth: false,
        isSelected: false,
        isWeekend: isWeekend,
        booked:0
      });
      
    }
  
    var bookings = 0;

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      
      const dayDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), i);
      bookings = 0; // Reset bookings counter for each day
      
      this.bookedAppointments.forEach(bookedAppointment => {
        const appointmentDate = bookedAppointment.appointmentDate;

        if (appointmentDate) {
          
          // Convert to Date object if it's not already
          const appDate = appointmentDate instanceof Date ? appointmentDate : new Date(appointmentDate);

          if (appDate.getDate() === dayDate.getDate() && 
              appDate.getMonth() === dayDate.getMonth() &&
              appDate.getFullYear() === dayDate.getFullYear()) {
            bookings++;
          }
        }
      });
      
      const dayOfWeek = dayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
      
      this.calendarDays.push({
        date: i,
        isCurrentMonth: true,
        isSelected: false,
        isWeekend: isWeekend,
        booked: bookings
      });
      
    }
    
    // Add days to complete the grid (6 rows)
    const remainingSlots = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const dayDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, i);
      const dayOfWeek = dayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
      
      this.calendarDays.push({
        date: i,
        isCurrentMonth: false,
        isSelected: false,
        isWeekend: isWeekend,
        booked:0
      });
    }
  }


  displayCantBookInThePastError()
  {
    this.toastr.error("Time travel isn't available yet!")
  }

  isBooked(selectedDate: Date, time: string): boolean {
    // Parse the time string to get hours and minutes in 24-hour format
    let selectedHour = 0;
    let selectedMinute = 0;
    
    if (time) {
      const [hourMinute, period] = time.split(' ');
      let [hour, minute] = hourMinute.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hour < 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      selectedHour = hour;
      selectedMinute = minute || 0;
    }
    
    // Check if the date and time match any booked appointment
    for (const bookedAppointment of this.bookedAppointments) {
      const appointmentDate = bookedAppointment.appointmentDate;
      if (!appointmentDate) continue;
      
      const appDate = appointmentDate instanceof Date ? appointmentDate : new Date(appointmentDate);
      
      // Compare dates - ensure they're the same day, month, and year
      if (appDate.getDate() === selectedDate.getDate() && 
          appDate.getMonth() === selectedDate.getMonth() && 
          appDate.getFullYear() === selectedDate.getFullYear()) {
              
        // Clear previous value
        this.clientName = "";
        
        // Compare both hours and minutes
        if (appDate.getHours() === selectedHour && appDate.getMinutes() === selectedMinute) {
          
          if (this.clientMap.has(bookedAppointment.userId)) {
            this.clientName = " - " + this.clientMap.get(bookedAppointment.userId)?.name as string;
          }
          
          return true; // Found a match, this slot is booked
        }
      }
    }
    
    return false; // No match found, this slot is available
  }

  getColor(booked: number): string {
    // Determine color intensity based on booking ratio
    const max = this.availableTimes.length; // Maximum possible bookings per day
    const ratio = max ? Math.min(booked / max, 1) : 0;

    // Calculate opacity between 0.2 (low intensity) and 1.0 (high intensity)
    const opacity = 0.2 + ratio * 0.8;

    // If fully booked, return a different color (dark red)
    if (booked >= max && max > 0) {
      return 'rgb(255, 145, 0)'; // Darker orange for fully booked days
    }

    // Otherwise return red with calculated opacity
    return `rgba(255, 180, 83, ${opacity})`;
  }
  
  isToday(date: number, isCurrentMonth: boolean){
    const currentDate = new Date();
    const dateToCheck = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      date
    );
    

    // Set both dates to midnight for accurate comparison of just the date
    currentDate.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);

    if(dateToCheck.getTime() === currentDate.getTime() && isCurrentMonth === true){
      return true
    }

    return false;
   
  }

  isCurrentMonthToday(): boolean {
    const today = new Date();
    return this.currentMonth.getMonth() === today.getMonth() && 
           this.currentMonth.getFullYear() === today.getFullYear();
  }

  getBorderColor(): string {
    const currentDate = new Date();
    
    // Check if any appointment is scheduled for today
    //The some() method is used to test whether at least one element in the array passes the test in the provided function. It returns a boolean value - true if an appointment exists for today, false otherwise.
    const hasAppointmentToday = this.bookedAppointments.some(appointment => {
      const appDate = appointment.appointmentDate instanceof Date 
        ? appointment.appointmentDate 
        : new Date(appointment.appointmentDate);
      
      return appDate.getDate() === currentDate.getDate() &&
             appDate.getMonth() === currentDate.getMonth() &&
             appDate.getFullYear() === currentDate.getFullYear();
    });
    
    if (hasAppointmentToday) {
      return `3px dashed rgb(0, 0, 0)`;
    } else {
      return `3px dashed rgb(255, 123, 0)`;
    }
  }

  // New methods for month/year picker
  toggleMonthYearPicker() {
    this.showMonthYearPicker = !this.showMonthYearPicker;
  }

  selectMonth(monthIndex: number) {
    const newDate = new Date(this.currentMonth);
    newDate.setMonth(monthIndex);
    this.currentMonth = newDate;
    this.generateCalendar();
    this.showMonthYearPicker = false;
  }

  changeYear(increment: number) { /// increment or decrement based on what user clicks
    const newDate = new Date(this.currentMonth);
    newDate.setFullYear(this.currentMonth.getFullYear() + increment);
    this.currentMonth = newDate;
    this.generateCalendar();
  }


  changeMonth(increment: number) {
    // Create a new date object to avoid mutating the original
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(this.currentMonth.getMonth() + increment);
    
    // Update current month and regenerate calendar
    this.currentMonth = newMonth;
    this.generateCalendar();
  }

  selectDate(day: CalendarDate) {
    // Only proceed if the day is in the current month and NOT a weekend
    if (day.isCurrentMonth && !day.isWeekend) {
      this.calendarDisplay="none";
      this.calendarOpacity = "0";
      // Deselect previous date
      this.calendarDays.forEach(d => d.isSelected = false);
      
      // Select new date
      day.isSelected = true;
      this.selectedDate = new Date(
        this.currentMonth.getFullYear(), 
        this.currentMonth.getMonth(), 
        day.date
      );

      this.dateClicked.emit(day);


    } else if (day.date === -1) {
      // This is for handling your cancel functionality
      this.calendarDisplay="none";
      this.calendarOpacity = "0";
      this.dateClicked.emit(day);
    }
  }

  viewDate(day: CalendarDate) { 
    // Only proceed if the day is in the current month and NOT a weekend
    if (day.isCurrentMonth && !day.isWeekend) {
      this.calendarDisplay="none";
      this.calendarOpacity = "0";
      // Deselect previous date
      this.calendarDays.forEach(d => d.isSelected = false);
      
      // Select new date
      day.isSelected = true;
      this.selectedDate = new Date(
        this.currentMonth.getFullYear(), 
        this.currentMonth.getMonth(), 
        day.date
      );

      this.dateClicked.emit(day);


    } else if (day.date === -1) {
      // This is for handling cancel functionality
      this.calendarDisplay="none";
      this.calendarOpacity = "0";
      this.dateClicked.emit(day);
    }
  }

  selectTime(time: string) { //'next' button
    this.opacity = "1";
    this.pointerEvent = "all";
    this.selectedTime = time;
  }

  goToToday()
  {
    const newDate = new Date();

    // add todays date to this.currentMonth and regenerate calendar
    this.currentMonth = newDate;
    this.generateCalendar();
  }

  makeAppointment(){
    if (this.selectedDate && this.selectedTime) {
      const appointment: AnAppointment = {
        date: this.selectedDate,
        time: this.selectedTime
      };
      this.dateSelected.emit(appointment);
    }
  }



  isPastDate(date: number | Date | null | undefined): boolean {
    if (!date) return false;
    
    const currentDate = new Date();
    let dateToCheck: Date;
    
    if (date instanceof Date) {
      dateToCheck = new Date(date);
    } else if (typeof date === 'number') {
      dateToCheck = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth(),
        date
      );
    } else {
      // If it's a string or other format, try to parse it
      dateToCheck = new Date(date);
    }
  
    // Set both dates to midnight for accurate comparison of just the date
    currentDate.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);
  
    return dateToCheck < currentDate;
  }

  resetSelection() {
    const day: CalendarDate = { date: -1, isCurrentMonth: true, isSelected: false, booked:0};
    this.selectDate(day);
    this.opacity = "0.4";
    this.pointerEvent = "none";
    this.calendarDisplay="block";
    this.calendarOpacity = "1";
    this.selectedDate = null;
    this.selectedTime = null;
    this.clientName = "";
    this.calendarDays.forEach(d => d.isSelected = false);
    
  }

  fetchCustomers()
  {
    this.clientManagementService.getAllClientsWithId().subscribe({
      next: (clients: ClientProfile[]) => {
        // Store all clients but first filter out admin users
        this.clients = clients.filter(client => 
          client.fullName !== 'admin'
        );
        // Initialize filtered clients with all non-admin clients
      },
      error: (error) => {
        console.error("Error loading clients:", error);
      }
    });
  }

  editBookedDetails(selectedDate: Date, time: string) {
    
    // Parse the time string to get hours and minutes in 24-hour format
    let selectedHour = 0;
    let selectedMinute = 0;
    
    if (time) {
      const [hourMinute, period] = time.split(' ');
      
      let [hour, minute] = hourMinute.split(':').map(Number);
      
      
      // Convert to 24-hour format
      if (period === 'PM' && hour < 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      selectedHour = hour;
      selectedMinute = minute || 0;
    }
    
    // Find the matching appointment
    let appointmentToEdit: Appointment | undefined;
    
    for (const bookedAppointment of this.bookedAppointments) {
      const appointmentDate = bookedAppointment.appointmentDate;
      if (!appointmentDate) continue;
      
      const appDate = appointmentDate instanceof Date ? appointmentDate : new Date(appointmentDate);
      
      // Compare dates and times
      if (appDate.getDate() === selectedDate.getDate() && 
          appDate.getMonth() === selectedDate.getMonth() && 
          appDate.getFullYear() === selectedDate.getFullYear() &&
          appDate.getHours() === selectedHour && 
          appDate.getMinutes() === selectedMinute) {
        
        appointmentToEdit = bookedAppointment;
        break;
      }
    }
    
    if (appointmentToEdit) {
      // Appointment found, open modal
      this.selectedAppointment = appointmentToEdit;
      
      
      const appointmentDate = new Date(appointmentToEdit.appointmentDate);
      
      if (this.isPastDate(appointmentDate))
      { 
        this.EditAppointmentTextDisplay = "none";
        this.ViewAppointmentTextDisplay = "block";
        this.RescheduleButtonsDisplay = "none";
      }
      else{
        this.EditAppointmentTextDisplay = "block";
        this.ViewAppointmentTextDisplay = "none";
        this.RescheduleButtonsDisplay = "block";
      }
      
      this.showEditModal = true;
      this.showRescheduleForm = false;
      
      // Get client name for the appointment
      // Get client name and phone for the appointment
      if (this.clientMap.has(appointmentToEdit.userId)) {
        const clientData = this.clientMap.get(appointmentToEdit.userId);
        this.selectedClientName = clientData?.name as string;
        this.selectedClientPhone = clientData?.phone as string;
      } else {
        this.selectedClientName = "Unknown Client";
        this.selectedClientPhone = "Unknown Phone";
      }
    }
  }

  // Close the modal
closeEditModal() {
  this.showEditModal = false;
  this.selectedAppointment = null;
  this.resetSelection();
}

// Cancel appointment with modal instead of confirm dialog
cancelAppointment() {
  if (!this.selectedAppointment) return;
  
  // Open the confirmation modal
  this.openConfirmationModal();
  
}

// Open modal to confirm cancellation
openConfirmationModal() {
  this.showCancelModal = true;
}

// Close the confirmation modal
closeCancelModal() {
  this.showCancelModal = false;
}

  // Confirm cancellation after modal confirmation
confirmCancellation() {
  this.appointmentsService.cancelAppointment(this.selectedAppointment!.id).subscribe({
    next: () => {
      // Remove the appointment from bookedAppointments array
      this.bookedAppointments = this.bookedAppointments.filter(
        app => app.id !== this.selectedAppointment?.id
      );
      // Regenerate calendar
      this.generateCalendar();
      // Show success notification
      this.toastr.success('Appointment cancelled successfully');
      // Close the modals
      this.closeCancelModal();
      this.closeEditModal();
    },
    error: (error) => {
      console.error('Error cancelling appointment', error);
      this.toastr.error('Failed to cancel appointment. Please try again.');
    }
  });
}

  // Toggle reschedule form
  showRescheduleForm: boolean = false;

  openRescheduleForm() {
    this.showRescheduleForm = true;
    
    if (this.selectedAppointment) {
      const appointmentDate = new Date(this.selectedAppointment.appointmentDate);
      
      // Format the date for input type="date" (YYYY-MM-DD)
      const year = appointmentDate.getFullYear();
      const month = (appointmentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = appointmentDate.getDate().toString().padStart(2, '0');
      this.rescheduleDate = `${year}-${month}-${day}`;
      
      // Format the time for the select dropdown
      let hours = appointmentDate.getHours();
      const minutes = appointmentDate.getMinutes();
      let period = 'AM';
      
      if (hours >= 12) {
        period = 'PM';
        if (hours > 12) hours -= 12;
      } else if (hours === 0) {
        hours = 12;
      }
      
      const timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
      
      // Find matching time in available times or default to empty
      this.rescheduleTime = this.availableTimes.find(t => t === timeString) || '';
    }
  }
  // Add these properties to your component class
rescheduleDate: string = '';
rescheduleTime: string = '';

// Get today's date as YYYY-MM-DD for the min attribute of the date input
getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Cancel reschedule
cancelReschedule() {
  this.showRescheduleForm = false;
  this.rescheduleDate = '';
  this.rescheduleTime = '';
}

// Submit reschedule request
// Submit reschedule request
submitReschedule() {

  
  if (!this.selectedAppointment || !this.rescheduleDate || !this.rescheduleTime) {
    return;
  }
  
  
  // Create a date object to check if the selected date is valid for rescheduling
  const rescheduleDate = new Date(this.rescheduleDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of the day for proper comparison

  // Create a calendar date object to check if the selected date is a weekend
  const calendarDateObj: CalendarDate = {
    date: rescheduleDate.getDate(),
    isCurrentMonth: true, // Assuming we're rescheduling within the current view
    isSelected: false,
    isWeekend: rescheduleDate.getDay() === 0 || rescheduleDate.getDay() === 6, // Check if weekend
    booked: 0 // Initialize with no bookings
  };

  // Check if the selected date is a weekend
  if (calendarDateObj.isWeekend) {
    this.toastr.warning("Weekends are not available. Please choose a weekday.");
    return;
  }


  // Check if the new time slot is already booked
  const isTimeSlotBooked = this.isBooked(rescheduleDate, this.rescheduleTime);
  if (isTimeSlotBooked) {
    this.toastr.warning("This time slot is already booked. Please choose another time.");
    return;
  }

  // Create a Date object from the selected date and time
  const [hourMinute, period] = this.rescheduleTime.split(' ');
  let [hour, minute] = hourMinute.split(':').map(Number);
  
  // Convert to 24-hour format
  if (period === 'PM' && hour < 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  if (this.getTodayString() < this.rescheduleDate)
  {
      // Parse reschedule date
      const [year, month, day] = this.rescheduleDate.split('-').map(Number);
        
        
      // Create new date object with the selected date and time
      const newAppointmentDate = new Date(year, month - 1, day, hour, minute);

      // Create new appointment object
      const newAppointment = {
        appointmentDate: newAppointmentDate,
        userId: this.selectedAppointment.userId
      };

      

      // First cancel the existing appointment
      this.appointmentsService.cancelAppointment(this.selectedAppointment.id).subscribe({
        next: () => {
          
          // Then create a new appointment with the updated date/time
          this.appointmentsService.addAppointment(newAppointment).subscribe({
            next: (createdAppointment) => {
              this.toastr.success("New appointment created successfully");

              // Remove the old appointment from the local array
              this.bookedAppointments = this.bookedAppointments.filter(
                app => app.id !== this.selectedAppointment?.id
              );
              
              // Add the new appointment to the local array
              this.bookedAppointments.push(createdAppointment);
              
            
              // Regenerate calendar to reflect changes
              this.generateCalendar();
              
              // Close forms and modal
              this.showRescheduleForm = false;
              this.closeEditModal();
            },
            error: (error) => {
              console.error('Error creating new appointment', error);
              this.toastr.error("Failed to reschedule new appointment. The original appointment has been cancelled.");
            }
          });
        },
        error: (error) => {
          console.error('Error cancelling original appointment', error);
          this.toastr.error("Failed to reschedule appointment. Please try again");
        }
      });
      this.clientName = "";
      }
      else
      {
        this.toastr.warning("Reschedule date must be in the future.");
      }
  }
  
  
  
  

}