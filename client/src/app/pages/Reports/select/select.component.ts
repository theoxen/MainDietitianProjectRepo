import { Component, inject, OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownItem } from '../../../components/primary-dropdown-input/dropdown-item';
import { DietTypesService } from '../../../services/diet-types.service';
import { PrimaryDropdownInputComponent } from '../../../components/primary-dropdown-input/primary-dropdown-input.component';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, PrimaryDropdownInputComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css'
})
export class SelectComponent implements OnInit {
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  selectedReportType: string = '';

  constructor(private router: Router, private route: ActivatedRoute) { }

  private dietTypeService = inject(DietTypesService);

  dietTypeDropdownOptions: DropdownItem<string, string>[] = [];

  NavigateTo() {
    window.scrollTo(0, 0);
    this.router.navigate(['/reports/select'], {
      queryParams: {
        reportType: this.selectedReportType
      }
    });
  }

  ngOnInit(): void {
    this.dietTypeService.loadDietTypes().subscribe({
      next: (dietTypes) => {
        this.dietTypeDropdownOptions = dietTypes.map(dietType => {
          return {
            value: dietType.id,
            displayedValue: dietType.name
          }
        })
      }
    });

    this.route.queryParams.subscribe(params => {
      const reportType = params['type'];
      if (reportType) {
        // console.log('Selected Report Type:', reportType);
        // Pre-select the appropriate form based on report type
        this.handleReportTypeSelection(reportType);
      }
    });

  }

  handleReportTypeSelection(reportType: string) {
    this.selectedReportType = reportType;
    // console.log('Selected report type:', this.selectedReportType);

    // Reset all forms
    this.ReportForm1.reset();
    this.ReportForm2.reset();
    this.ReportForm3.reset();
    // this.ReportForm4.reset();
  }





  ReportForm1 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
    "field2": new FormControl("", [Validators.required]),
  },
    { validators: this.checkFields }
  );

  get field1GreaterThanField2Error() {
    return this.ReportForm1.hasError('field1GreaterThanField2') && this.ReportForm1.touched;
  }

  checkFields(control: AbstractControl): ValidationErrors | null {
    const field1 = control.get('field1')?.value;
    const field2 = control.get('field2')?.value;

    if (field1 && field2 && field1 > field2) {
      return { 'field1GreaterThanField2': true }; // Validation error key
    }
    return null; // No error
  }

  private numberValidator() {
  return (control: FormControl): ValidationErrors | null => {
    const value = control.value;
    if (isNaN(value) || value === null || value === '') {
      return { 'notANumber': true };
    }
    return null;
  };
}

  ReportForm2 = new FormGroup({
    "field1": new FormControl("", [
      Validators.required,
      Validators.pattern("^[0-9]*$"),
      this.numberValidator()
    ]),
    "field2": new FormControl("", [
      Validators.required,
      Validators.pattern("^[0-9]*$"),
      this.numberValidator()
    ])
  }, { validators: this.checkFields });
  
  // Update your error messages
  fieldsErrorMessages = new Map<string, string>([
    ["required", "Field is required"],
    ["checkFields", "Field 1 must be greater than Field 2"],
    ["pattern", "Please enter numbers only"],
    ["notANumber", "Please enter a valid number"]
  ]);

  ReportForm3 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
    "field2": new FormControl("", [Validators.required]),
  },
    { validators: this.checkFields }
  );

  ReportForm4 = new FormGroup({
    "field1": new FormControl("", [Validators.required]),
  });



  ReportForm1Submit() {
    if (this.ReportForm1.valid) {
      // console.log('ReportForm1 Values:', this.ReportForm1.value);
      this.router.navigate(['/reports/view'], {
        queryParams: {
          ...this.ReportForm1.value,
          reportType: 'ReportForm1'
        }
      });
    } else {
      // console.log('ReportForm1 is invalid.');
    }
  }

  ReportForm2Submit() {
    if (this.ReportForm2.valid) {
      // console.log('ReportForm2 Values:', this.ReportForm2.value);
      this.router.navigate(['/reports/view'], {
        queryParams: {
          ...this.ReportForm2.value,
          reportType: 'ReportForm2'
        }
      });
    } else {
      // console.log('ReportForm2 is invalid.');
    }
  }

  ReportForm3Submit() {
    if (this.ReportForm3.valid) {
      // console.log('ReportForm3 Values:', this.ReportForm3.value);
      this.router.navigate(['/reports/view'], {
        queryParams: {
          ...this.ReportForm3.value,
          reportType: 'ReportForm3'
        }
      });
    } else {
      // console.log('ReportForm3 is invalid.');
    }
  }

  ReportForm4Submit() {
    if (this.ReportForm4.valid) {
      // console.log('ReportForm4 Values:', this.ReportForm4.value);
      this.router.navigate(['/reports/view'], {
        queryParams: {
          ...this.ReportForm4.value,
          reportType: 'ReportForm4'
        }
      });
    } else {
      // console.log('ReportForm4 is invalid.');
    }
  }

}

