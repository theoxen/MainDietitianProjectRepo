import { Component, Inject, inject, Renderer2 } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diet';
import { ActivatedRoute } from '@angular/router';
import { CalendarComponent } from '../../calendar/calendar/calendar.component';
import { CommonModule } from '@angular/common';

interface CalendarDate {
  date: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
}
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [NavBarComponent, CalendarComponent, CommonModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})

export class AppointmentsComponent {
  dateColor: string = '#FFB453';
  timeColor: string = '#fffff';
  step1Display: string = "block";    
  step2Display: string = "none";

  

  constructor(private route: ActivatedRoute, private renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Hide the footer when initializing this component.
   
    
    // Hide the footer element.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.setStyle(footer, 'display', 'none');
    }
  
  }


  
  
  

  onCalendarDateClicked(selectedDate: CalendarDate) : void {
    if (selectedDate.date == -1) {
      // selectedDate is a CalendarDate (cancel button clicked)
      this.step1Display = "block";
      this.step2Display = "none";
      this.timeColor = "white";
    }else{
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
