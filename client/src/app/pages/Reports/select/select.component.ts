import { Component } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css'
})
export class SelectComponent {
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;


  constructor(private router: Router) { }
  
  ReportForm1 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
    "field2": new FormControl("", [Validators.required]),
  });

  ReportForm2 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
    "field2": new FormControl("", [Validators.required]),
  });

  ReportForm3 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
    "field2": new FormControl("", [Validators.required]),
  });

  ReportForm4 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
    "field2": new FormControl("", [Validators.required]),
  });

  fieldsErrorMessages = new Map<string, string>([
    ["required", "Field is required"]
  ])

  ReportForm1Submit() {
    if (this.ReportForm1.valid) {
      console.log('ReportForm1 Values:', this.ReportForm1.value);
      this.router.navigate(['/reports/view'], {
        queryParams:{
          ...this.ReportForm1.value,
          reportType: 'ReportForm1'
        }
      });
    } else {
      console.log('ReportForm1 is invalid.');
    }
  }
  
  ReportForm2Submit() {
    if (this.ReportForm2.valid) {
      console.log('ReportForm2 Values:', this.ReportForm2.value);
      this.router.navigate(['/reports/view'], {
        queryParams:{
          ...this.ReportForm2.value,
          reportType: 'ReportForm2'
        }
      });
    } else {
      console.log('ReportForm2 is invalid.');
    }
  }
  
  ReportForm3Submit() {
    if (this.ReportForm3.valid) {
      console.log('ReportForm3 Values:', this.ReportForm3.value);
      this.router.navigate(['/reports/view'], {
        queryParams:{
          ...this.ReportForm3.value,
          reportType: 'ReportForm3'
        }
      });
    } else {
      console.log('ReportForm3 is invalid.');
    }
  }
  
  ReportForm4Submit() {
    if (this.ReportForm4.valid) {
      console.log('ReportForm4 Values:', this.ReportForm4.value);
      this.router.navigate(['/reports/view'], {
        queryParams:{
          ...this.ReportForm4.value,
          reportType: 'ReportForm4'
        }
      });
    } else {
      console.log('ReportForm4 is invalid.');
    }
  }

  // ReportForm5Submit() {
  //   console.log('Generating Age Report...');
  //   this.router.navigate(['/reports/view']);
  // }


}

//TODO:I need to ask advice about the styling of the forms
//TODO:i need to but the corect restrictions 
//TODO:i need to make the 5th form and add the correct restrictions
//TODO:I need to chech the 3rd or 4th form