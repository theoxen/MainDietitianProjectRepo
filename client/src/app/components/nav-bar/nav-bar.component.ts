import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {
  @ViewChild('navLinks') navLinks!: ElementRef;
  private accountService = inject(AccountService);

  role = this.accountService.userRole; // Assigning the userRole signal to the role in this component

  constructor() {
    
  }

  ngOnInit(): void {
  }

  showMenu() {
    this.navLinks.nativeElement.style.right = '0';
  }

  hideMenu() {
    this.navLinks.nativeElement.style.right = '-200px';
  }

  logout() {
    this.accountService.logout();
  }
}
