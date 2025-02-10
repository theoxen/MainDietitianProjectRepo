import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReactiveFormErrorComponent } from "../reactive-form-error/reactive-form-error.component";
import { DropdownItem } from './dropdown-item';

@Component({
  selector: 'app-primary-dropdown-input',
  standalone: true,
  imports: [ReactiveFormErrorComponent, ReactiveFormsModule],
  templateUrl: './primary-dropdown-input.component.html',
  styleUrl: './primary-dropdown-input.component.css'
})
export class PrimaryDropdownInputComponent <TValue, TDisplayedValue> {
  @Input() placeholder: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() errorMessages:Map<string,string> = new Map<string,string>();
  @Input() showErrorOnControlTouched: boolean = true;
  @Input() showErrorOnControlDirty: boolean = true;
  @Input() dropdownItems: DropdownItem<TValue, TDisplayedValue>[] = [];
}
