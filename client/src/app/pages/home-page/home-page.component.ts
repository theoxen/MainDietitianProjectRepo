import { Component } from '@angular/core';
import { WavySvgComponent } from "../../components/wavy-svg/wavy-svg.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { ReviewsListComponent } from '../reviews-management/reviews-list/reviews-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [WavySvgComponent, NavBarComponent, ReviewsListComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  constructor(private router: Router) { }

  navigateToMeetUs() {
    this.router.navigate(['/meet-us']).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
