import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorComponent } from "../../../components/error/error.component";
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { Advice } from "../../../models/advice/advice";
import { AdviceToAdd } from "../../../models/advice/advice-to-add";
import { AdviceToUpdate } from "../../../models/advice/advice-to-edit";
import { AdviceService } from "../../../services/advice.service";
import { ValidationMessages } from "../../../validation/validation-messages";
import { ValidationPatterns } from "../../../validation/validation-patterns";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'app-advice-create-edit',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, NavBarComponent, PrimaryInputFieldComponent, ErrorComponent],
    templateUrl: './advice-create-edit.component.html',
    styleUrls: ['./advice-create-edit.component.css']
  })
  export class AdviceCreateEditComponent implements OnInit {
    isEditMode = false;
    adviceId?: string;
    errorMessage = "";
    isConfirmationWindowVisible = false;

     // Inject ToastrService
  private toastr = inject(ToastrService);
  
  adviceForm = new FormGroup({
    Title: new FormControl("", [
      Validators.required,
      Validators.pattern(ValidationPatterns.title)
    ]),
    AdviceText: new FormControl("", [
      Validators.required,
      Validators.pattern(ValidationPatterns.adviceText)
    ])
  });
  
  
    adviceService = inject(AdviceService);
  
    constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {}
  
    titleErrorMessages = new Map<string, string>([
      ["required", ValidationMessages.required]
    ]);
    
    adviceTextErrorMessages = new Map<string, string>([
      ["required", ValidationMessages.required]
    ]);
    
    ngOnInit(): void {
      this.adviceForm = this.fb.group({
        Title: ['', [Validators.required]],
        AdviceText: ['', [Validators.required]]
      });
    
      this.route.paramMap.subscribe(params => {
        const adviceId = params.get('adviceId');
        this.adviceId = adviceId !== null ? adviceId : undefined;
        if (this.adviceId) {
          this.isEditMode = true;
          this.loadAdviceDetails(this.adviceId);
        }
      });
    }
    
    loadAdviceDetails(adviceId: string): void {
      this.adviceService.getAdvice(adviceId).subscribe({
        next: (advice: Advice) => {
          this.adviceForm.controls['Title'].setValue(advice.title);
          this.adviceForm.controls['AdviceText'].setValue(advice.adviceText);
        },
        error: (error) => {
          console.error("Error loading advice details.", error);
          this.errorMessage = "Error loading advice details. Please try again later.";
          this.toastr.error("Error loading advice details. Please try again later.");
        }
      });
    }
    
    onSubmit(): void {
      if (this.adviceForm.invalid) {
        this.adviceForm.markAllAsTouched();
        return;
      }
    
      if (this.isEditMode) {
        const adviceToUpdate: AdviceToUpdate = {
          id: this.adviceId!,
          title: this.adviceForm.controls['Title'].value!,
          adviceText: this.adviceForm.controls['AdviceText'].value!
        };
    
        this.adviceService.updateAdvice(adviceToUpdate).subscribe({
          next: (advice: Advice) => {
            this.toastr.success("Advice updated successfully.");
            this.router.navigate(['/uploads/advice/view']);
          },
          error: (error) => {
            console.error("Error updating advice.", error);
            this.errorMessage = "Error updating advice. Please try again later.";
            this.toastr.error("Error updating advice. Please try again later.");
          }
        });
    
      } else {
        const adviceToAdd: AdviceToAdd = {
          title: this.adviceForm.controls['Title'].value!,
          adviceText: this.adviceForm.controls['AdviceText'].value!
        };
    
        this.adviceService.createAdvice(adviceToAdd).subscribe({
          next: () => {
            this.toastr.success("Advice added successfully.");
            this.router.navigate(['/uploads/advice/view']);
          },
          error: (error) => {
            console.error("Error adding advice.", error);
            this.errorMessage = "Error adding advice. Please try again later.";
            this.toastr.error("Error adding advice. Please try again later.");
          }
        });
      }
    }
    
    openConfirmationWindow() {
      this.isConfirmationWindowVisible = true;
    }
    
    cancelDelete(): void {
      this.isConfirmationWindowVisible = false;
    }
    
    onDelete(): void {
      if (this.adviceId) {
        this.isConfirmationWindowVisible = false;
        this.adviceService.deleteAdvice(this.adviceId).subscribe({
          next: () => {
            this.toastr.success("Advice deleted successfully.");
            this.router.navigate(['/uploads/advice/view']);
          },
          error: (error) => {
            console.error("Error deleting advice.", error);
            this.errorMessage = "Error deleting advice. Please try again later.";
            this.toastr.error("Error deleting advice. Please try again later.");
          }
        });
      }
    }
  }