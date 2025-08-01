import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { AdviceService } from '../../services/advice.service';
import { Advice } from '../../models/advice/advice';

@Component({
  selector: 'app-advice-detail',
  standalone: true,
  imports: [CommonModule, NavBarComponent, RouterLink],
  templateUrl: './advice-detail.component.html',
  styleUrls: ['./advice-detail.component.css']
})

export class AdviceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private advicesService = inject(AdviceService);
  private toastr = inject(ToastrService);
  accountService = inject(AccountService);
  userRole = this.accountService.userRole;
  
  advice: Advice | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadAdvice();
  }

  loadAdvice(): void {
    const adviceId = this.route.snapshot.paramMap.get('id');
    if (!adviceId) {
      this.toastr.error('Advice ID is missing');
      this.router.navigate(['/uploads/advices']);
      return;
    }

    this.advicesService.getAdvice(adviceId).subscribe({
      next: (advice) => {
        this.advice = advice;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading advice', error);
        this.toastr.error('Failed to load advice');
        this.loading = false;
        this.error = true;
      }
    });
  }
}