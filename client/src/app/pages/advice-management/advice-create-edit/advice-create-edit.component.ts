import { CommonModule } from "@angular/common"; // Import Angular's CommonModule for common directives
import { Component, OnInit, inject } from "@angular/core"; // Import Component decorator, OnInit lifecycle hook, and inject function
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms"; // Import reactive form modules and utilities
import { ActivatedRoute, Router } from "@angular/router"; // Import routing modules for navigation and route parameters
import { ErrorComponent } from "../../../components/error/error.component"; // Import custom error component
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component"; // Import custom navigation bar component
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component"; // Import custom input field component
import { Advice } from "../../../models/advice/advice"; // Import Advice model
import { AdviceToAdd } from "../../../models/advice/advice-to-add"; // Import model for adding advice
import { AdviceToUpdate } from "../../../models/advice/advice-to-edit"; // Import model for updating advice
import { AdviceService } from "../../../services/advice.service"; // Import service for advice-related API calls
import { ValidationMessages } from "../../../validation/validation-messages"; // Import validation messages
import { ValidationPatterns } from "../../../validation/validation-patterns"; // Import validation patterns
import { ToastrService } from "ngx-toastr"; // Import ToastrService for displaying notifications

@Component({
    selector: 'app-advice-create-edit', // Define the component selector
    standalone: true, // Mark the component as standalone
    imports: [ReactiveFormsModule, CommonModule, NavBarComponent, PrimaryInputFieldComponent, ErrorComponent], // Import required modules and components
    templateUrl: './advice-create-edit.component.html', // Define the template URL
    styleUrls: ['./advice-create-edit.component.css'] // Define the styles URL
})
export class AdviceCreateEditComponent implements OnInit {
    isEditMode = false; // Flag to determine if the component is in edit mode
    adviceId?: string; // Variable to store the advice ID
    errorMessage = ""; // Variable to store error messages
    isConfirmationWindowVisible = false; // Flag to control the visibility of the confirmation window

    // Inject ToastrService for notifications
    private toastr = inject(ToastrService);

    // Define the reactive form with validation rules
    adviceForm = new FormGroup({
        Title: new FormControl("", [
            Validators.required, // Title is required
            Validators.pattern(ValidationPatterns.title) // Title must match the defined pattern
        ]),
        AdviceText: new FormControl("", [
            Validators.required, // Advice text is required
            Validators.pattern(ValidationPatterns.adviceText) // Advice text must match the defined pattern
        ])
    });

    // Inject the AdviceService
    adviceService = inject(AdviceService);

    constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {} // Inject ActivatedRoute, FormBuilder, and Router

    // Define error messages for form validation
    titleErrorMessages = new Map<string, string>([
        ["required", ValidationMessages.required] // Error message for required title
    ]);

    adviceTextErrorMessages = new Map<string, string>([
        ["required", ValidationMessages.required] // Error message for required advice text
    ]);

    ngOnInit(): void {
        // Initialize the form with default values and validation rules
        this.adviceForm = this.fb.group({
            Title: ['', [Validators.required]], // Title field with required validation
            AdviceText: ['', [Validators.required]] // Advice text field with required validation
        });

        // Subscribe to route parameters to check for advice ID
        this.route.paramMap.subscribe(params => {
            const adviceId = params.get('adviceId'); // Get the advice ID from the route
            this.adviceId = adviceId !== null ? adviceId : undefined; // Set the advice ID if it exists
            if (this.adviceId) {
                this.isEditMode = true; // Enable edit mode if advice ID exists
                this.loadAdviceDetails(this.adviceId); // Load advice details for editing
            }
        });
    }

    // Load advice details for editing
    loadAdviceDetails(adviceId: string): void {
        this.adviceService.getAdvice(adviceId).subscribe({
            next: (advice: Advice) => {
                this.adviceForm.controls['Title'].setValue(advice.title); // Set the title in the form
                this.adviceForm.controls['AdviceText'].setValue(advice.adviceText); // Set the advice text in the form
            },
            error: (error) => {
                console.error("Error loading advice details.", error); // Log the error
                this.errorMessage = "Error loading advice details. Please try again later."; // Set the error message
                this.toastr.error("Error loading advice details. Please try again later."); // Show error notification
            }
        });
    }

    // Handle form submission
    onSubmit(): void {
        if (this.adviceForm.invalid) {
            this.adviceForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
            return; // Exit if the form is invalid
        }

        if (this.isEditMode) {
            // Prepare the advice object for updating
            const adviceToUpdate: AdviceToUpdate = {
                id: this.adviceId!, // Use the existing advice ID
                title: this.adviceForm.controls['Title'].value!, // Get the title from the form
                adviceText: this.adviceForm.controls['AdviceText'].value! // Get the advice text from the form
            };

            // Call the service to update the advice
            this.adviceService.updateAdvice(adviceToUpdate).subscribe({
                next: (advice: Advice) => {
                    this.toastr.success("Advice updated successfully."); // Show success notification
                    this.router.navigate(['/uploads/advice/view']); // Navigate to the advice view page
                },
                error: (error) => {
                    console.error("Error updating advice.", error); // Log the error
                    this.errorMessage = "Error updating advice. Please try again later."; // Set the error message
                    this.toastr.error("Error updating advice. Please try again later."); // Show error notification
                }
            });

        } else {
            // Prepare the advice object for adding
            const adviceToAdd: AdviceToAdd = {
                title: this.adviceForm.controls['Title'].value!, // Get the title from the form
                adviceText: this.adviceForm.controls['AdviceText'].value! // Get the advice text from the form
            };

            // Call the service to create the advice
            this.adviceService.createAdvice(adviceToAdd).subscribe({
                next: () => {
                    this.toastr.success("Advice added successfully."); // Show success notification
                    this.router.navigate(['/uploads/advice/view']); // Navigate to the advice view page
                },
                error: (error) => {
                    console.error("Error adding advice.", error); // Log the error
                    this.errorMessage = "Error adding advice. Please try again later."; // Set the error message
                    this.toastr.error("Error adding advice. Please try again later."); // Show error notification
                }
            });
        }
    }

    // Open the confirmation window for delete action
    openConfirmationWindow() {
        this.isConfirmationWindowVisible = true; // Show the confirmation window
    }

    // Cancel the delete action
    cancelDelete(): void {
        this.isConfirmationWindowVisible = false; // Hide the confirmation window
    }

    // Handle the delete action
    onDelete(): void {
        if (this.adviceId) {
            this.isConfirmationWindowVisible = false; // Hide the confirmation window
            this.adviceService.deleteAdvice(this.adviceId).subscribe({
                next: () => {
                    this.toastr.success("Advice deleted successfully."); // Show success notification
                    this.router.navigate(['/uploads/advice/view']); // Navigate to the advice view page
                },
                error: (error) => {
                    console.error("Error deleting advice.", error); // Log the error
                    this.errorMessage = "Error deleting advice. Please try again later."; // Set the error message
                    this.toastr.error("Error deleting advice. Please try again later."); // Show error notification
                }
            });
        }
    }
}