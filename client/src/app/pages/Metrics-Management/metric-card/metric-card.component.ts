import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.css']
})
export class MetricCardComponent {
  @Input() Id!: string;
  @Input() title!: Date;
  @Input() data: { title: string; value: number; unit: string }[] = []; // ✅ Ensures `data` is always an array
}