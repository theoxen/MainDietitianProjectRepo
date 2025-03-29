import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

interface CalendarDate {
  date: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
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
  availableTimes: string[] = ['5:30 PM', '6:30 PM', '7:30 PM', '8:30 PM', '9:30 PM'];
  selectedTime: string | null = null;
  calendarDisplay: string = "block";    
  calendarOpacity: string = "1"; 
  @Output() dateClicked = new EventEmitter<CalendarDate>();

  ngOnInit() {
    this.generateCalendar();
    
  }

  generateCalendar() {
    // Reset calendar days
    this.calendarDays = [];

    // Get first day of the month and last day of the month
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    // Add days from previous month
    const prevMonthLastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 0);
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start
    for (let i = 0; i < startingDay; i++) {
      this.calendarDays.unshift({
        date: prevMonthLastDay.getDate() - i,
        isCurrentMonth: false,
        isSelected: false
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.calendarDays.push({
        date: i,
        isCurrentMonth: true,
        isSelected: false
      });
    }

    // Add days to complete the grid (6 rows)
    const remainingSlots = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingSlots; i++) {
      this.calendarDays.push({
        date: i,
        isCurrentMonth: false,
        isSelected: false
      });
    }
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
    if (day.isCurrentMonth) {
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
    }
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  resetSelection() {
    const day: CalendarDate = { date: -1, isCurrentMonth: true, isSelected: false };
    this.selectDate(day);
    this.calendarDisplay="block";
    this.calendarOpacity = "1";
    this.selectedDate = null;
    this.selectedTime = null;
    this.calendarDays.forEach(d => d.isSelected = false);
    
  }
}