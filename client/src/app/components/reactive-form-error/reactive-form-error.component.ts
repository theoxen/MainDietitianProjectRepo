import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Validator } from '../../validation/validator';

@Component({
  selector: 'app-reactive-form-error',
  standalone: true,
  imports: [],
  templateUrl: './reactive-form-error.component.html',
  styleUrl: './reactive-form-error.component.css'
})
export class ReactiveFormErrorComponent {
  @Input({required:true}) control:AbstractControl =null!
  @Input({required:true}) errorMessages:Map<string,string> = new Map<string,string>();
  @Input() showOnControlDirty=false;
  @Input() showOnControlTouched=false;

  get errorMessage():string {

    if(this.showOnControlDirty && !this.control.dirty || 
      this.showOnControlTouched && !this.control.touched)
      {
        return ""
      }


    return Validator.getValidationError(this.control.errors,this.errorMessages)
  }
}
