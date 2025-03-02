import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-window',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-window.component.html',
  styleUrl: './confirmation-window.component.css'
})
export class ConfirmationWindowComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure?';
  @Input({required: true}) isVisible: boolean = false;
  @Output() confirmed = new EventEmitter<boolean>();

  confirm() {
    this.confirmed.emit(true);
  }

  close() {
    this.confirmed.emit(false);
  }
}
