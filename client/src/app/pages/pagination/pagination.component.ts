import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;   // Total number of items to paginate
  @Input() pageSize = 10;    // Items per page
  @Input() currentPage = 1;  // Current active page

  @Output() pageChanged = new EventEmitter<number>();

  totalPages = 0;

  ngOnChanges(changes: SimpleChanges) {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.pageChanged.emit(this.currentPage);
  }

  /**
   * Computes an array of pages to display.
   * - If total pages <= 5, display all pages.
   * - If more than 5 pages:
   *   - When on one of the first 3 pages, show pages 1-4, ellipsis, last page.
   *   - When on one of the last 3 pages, show first page, ellipsis, last 4 pages.
   *   - Otherwise, show first page, ellipsis, current-1, current, current+1, ellipsis, last page.
   */
  get pagesToDisplay(): (number | string)[] {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1, '...', this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }
    return pages;
  }
}
