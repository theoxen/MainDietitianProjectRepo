import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { ArticlesService } from '../../services/articles.service';
import { ReturnedArticle } from '../../models/articles/returned-article';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, NavBarComponent, RouterLink],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})

export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articlesService = inject(ArticlesService);
  private toastr = inject(ToastrService);
  accountService = inject(AccountService);
  userRole = this.accountService.userRole;
  
  article: ReturnedArticle | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadArticle();
  }

  loadArticle(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (!articleId) {
      this.toastr.error('Article ID is missing');
      this.router.navigate(['/uploads/articles']);
      return;
    }

    this.articlesService.getArticleById(articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading article', error);
        this.toastr.error('Failed to load article');
        this.loading = false;
        this.error = true;
      }
    });
  }
}