import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { PageFooterComponent } from "./components/page-footer/page-footer.component";
import { AccountService } from './services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, PageFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  // title = 'client';
  constructor(private accountService: AccountService, private router: Router, private toastr: ToastrService) {}

  ngOnInit() {
    // Check token on app start
    const token = this.accountService.getUserToken();
    if (token && this.accountService.isTokenExpired()) {
      // console.log('Token expired on app initialization');
      this.toastr.error('Session expired. Please log in again.');
      this.accountService.logout();
      this.router.navigateByUrl('/login');
    }
  }
}
