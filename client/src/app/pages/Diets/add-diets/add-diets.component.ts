// import { Component } from '@angular/core';
// import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

// @Component({
//   selector: 'app-add-diets',
//   standalone: true,
//   imports: [NavBarComponent],
//   templateUrl: './add-diets.component.html',
//   styleUrl: './add-diets.component.css'
// })
// export class AddDietsComponent {

// }


import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diet';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-add-diet',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent],
  templateUrl: './add-diets.component.html',
  styleUrls: ['./add-diets.component.css']
})
export class AddDietComponent implements OnInit {
  errorMessage: string = "";
  addDietForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required)
    // add other fields as needed
  });

  constructor(private dietService: DietService, private dialogRef: MatDialogRef<AddDietComponent>) {}

  ngOnInit(): void {}

  addDiet(): void {
    if (this.addDietForm.invalid) {
      this.addDietForm.markAllAsTouched();
      return;
    }
    
    const newDiet: Diet = {
      id: "", // To be set by the backend
      name: this.addDietForm.value.name!,
      description: this.addDietForm.value.description!
      // map additional properties
    };

    this.dietService.addDiet(newDiet).subscribe({
      next: (diet) => {
        console.log("Diet added");
        this.dialogRef.close();
      },
      error: (error) => {
        console.error("Error adding diet", error);
        this.errorMessage = "Error adding diet";
      }
    });
  }
}
