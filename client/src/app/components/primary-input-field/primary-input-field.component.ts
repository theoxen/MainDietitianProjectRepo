import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReactiveFormErrorComponent } from '../reactive-form-error/reactive-form-error.component';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../error/error.component';

@Component({
  selector: 'app-primary-input-field',
  standalone: true,
  imports: [ReactiveFormErrorComponent, ReactiveFormsModule, CommonModule, ErrorComponent],
  templateUrl: './primary-input-field.component.html',
  styleUrl: './primary-input-field.component.css'
})
export class PrimaryInputFieldComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() errorMessages:Map<string,string> = new Map<string,string>();
  @Input() showErrorOnControlTouched: boolean = true;
  @Input() showErrorOnControlDirty: boolean = true;
  @Input() type: string = 'text';
  
}
