import { Component, Inject, inject, Renderer2 } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diet';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-diets',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './view-diets.component.html',
  styleUrl: './view-diets.component.css'
})
export class ViewDietsComponent {
  mealPeriods = ["ΠΡΩΙΝΟ","ΕΝΔΙΑΜΕΣΟ Ή ΑΠΟΓΕΥΜΑΤΙΝΟ Ή ΠΡΟ ΥΠΝΟΥ","ΜΕΣΗΜΕΡΙΑΝΟ","ΒΡΑΔΙΝΟ"];
  dietId!: string;
  clientId: any;
  diet!: Diet[];
  dietDays!:[];
  isTemplate!: boolean;
  dietService = inject(DietService);
  theDiet: any;
  dateCreated: any;

  

  constructor(private route: ActivatedRoute, private renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Hide the footer when initializing this component.
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    console.log("This is my client id:", this.clientId);
  
    
    this.fetchDietIdWithUserId();
    

    console.log("this is the diet[0]",);
    // Hide the footer element.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.setStyle(footer, 'display', 'none');
    }
  
  }

  fetchDietIdWithUserId() {// fetch the user's diet id.
    this.dietService.fetchUserDietsWithUserId(this.clientId).subscribe({
      next: (UserDietObject) => {
        console.log('Fetched diets response:', UserDietObject);
        this.dietId = (UserDietObject as any).data;
        console.log("Extracted dietId:", this.dietId);
  
        // fetch the detailed diet using the dietId.
        this.fetchDietsWithDietId();
      },
      error: (error: any) => {
        console.error("Error fetching diet id:", error);
      }
    });
  }

  fetchDietsWithDietId(): void {
   
      this.dietService.fetchDietForUser(this.dietId).subscribe({
        next: (diet) => {
          this.diet = (diet as any).data; 
          this.theDiet = this.diet as any;
          console.log(this.diet);
          console.log(this.theDiet.id);

          this.dateCreated = this.theDiet.dateCreated;
          this.isTemplate = this.theDiet.isTemplate;
          this.dietDays = this.theDiet.days;

          
        },
        error: (error) => {
          console.error("Error fetching detailed diet:", error);
        }
      });
}




  ngOnDestroy(): void {
    // Restore the footer when leaving this component.
    const footer = document.querySelector('footer');
    if (footer) {
      this.renderer.removeStyle(footer, 'display');
    }
  }
}
