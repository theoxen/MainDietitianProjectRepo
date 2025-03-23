import { Component } from '@angular/core';
import { WavySvgComponent } from "../../components/wavy-svg/wavy-svg.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { ReviewsListComponent } from '../reviews-management/reviews-list/reviews-list.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [WavySvgComponent, NavBarComponent, ReviewsListComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
