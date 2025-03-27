import { Component, Inject, inject, Renderer2 } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diet';
import { ActivatedRoute } from '@angular/router';
import { CalendarComponent } from '../../calendar/calendar/calendar.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [NavBarComponent, CalendarComponent],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent {
  

  

  constructor(private route: ActivatedRoute, private renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Hide the footer when initializing this component.
   
    
    // Hide the footer element.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.setStyle(footer, 'display', 'none');
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
