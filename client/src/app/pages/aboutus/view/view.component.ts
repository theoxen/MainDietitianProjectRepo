import { Component } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class AboutUsViewComponent {

}
