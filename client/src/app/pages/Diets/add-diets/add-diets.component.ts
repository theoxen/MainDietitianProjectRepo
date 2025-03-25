import { Component, Renderer2 } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-add-diets',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './add-diets.component.html',
  styleUrl: './add-diets.component.css'
})
export class AddDietsComponent {
  mealPeriods = ["ΠΡΩΙΝΟ","ΕΝΔΙΑΜΕΣΟ Ή ΑΠΟΓΕΥΜΑΤΙΝΟ Ή ΠΡΟ ΥΠΝΟΥ","ΜΕΣΗΜΕΡΙΑΝΟ","ΒΡΑΔΙΝΟ"];
  
  constructor(private renderer: Renderer2) {}
  
  ngOnInit(): void {

    // Hide the footer when initializing this component.
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
