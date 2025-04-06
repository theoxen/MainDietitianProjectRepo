import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ReturnedArticle } from '../models/articles/returned-article';
import { UpdateArticle } from '../models/articles/update-article';
import { AddArticle } from '../models/articles/add-article';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getArticles() {
    const url = `${this.baseUrl}articles`;
    return this.http.get<ReturnedArticle[]>(url);
  }

  updateArticle(articleToUpdate: UpdateArticle) {
    const url = `${this.baseUrl}articles`;
    return this.http.put<ReturnedArticle>(url, articleToUpdate);
  }

  deleteArticle(id: string) {
    const url = `${this.baseUrl}articles/${id}`;
    return this.http.delete(url);
  }

  addArticle(articleToAdd: AddArticle) {
    const url = `${this.baseUrl}articles`;
    return this.http.post<ReturnedArticle>(url, articleToAdd);
  }
}
