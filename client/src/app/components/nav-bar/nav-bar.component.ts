import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  @ViewChild('navLinks') navLinks!: ElementRef;

  showMenu() {
    this.navLinks.nativeElement.style.right = '0';
  }

  hideMenu() {
    this.navLinks.nativeElement.style.right = '-200px';
  }

}
