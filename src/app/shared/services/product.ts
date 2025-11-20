import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, PaginatedResponse, ProductListItemDto } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7028/api/Products';

  getProducts(
    page: number,
    pageSize: number,
    search?: string,
    categoryId?: string,
    parentCategory?: string,
    sort?: string
  ): Observable<PaginatedResponse<ProductListItemDto>> {
    let params = new HttpParams().set('pageNum', page).set('pageSize', pageSize);
    if (search) params = params.set('searchTerm', search);
    if (categoryId && categoryId !== '0') {
      params = params.set('categoryId', categoryId);
    } else if (parentCategory) {
      params = params.set('parentCategory', parentCategory);
    }
    if (sort) params = params.set('sortBy', sort);
    return this.http.get<PaginatedResponse<ProductListItemDto>>(this.baseUrl, { params });
  }

  getCategories(): Observable<Category[]> {
    const url = `${this.baseUrl}/categories`;
    return this.http.get<Category[]>(url);
  }
}
