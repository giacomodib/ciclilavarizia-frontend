import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { CategoryGroup, Category, ProductListItemDto } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/product';
import { ProductCard } from '../../shared/components/product-card/product-card';

interface ProductFilters {
  searchTerm: string;
  categoryId: string;
  sortBy: string;
}

@Component({
  selector: 'app-products-grid',
  imports: [ProductCard],
  templateUrl: './products-grid.html',
  styleUrl: './products-grid.scss',
})
// default for lazy loading (check app.routes.ts)
export default class ProductsGrid implements OnInit {
  @Input()
  set category(val: string) {
    this.categorySignal.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  private productService = inject(ProductService);
  private readonly PAGE_SIZE = 30;

  categorySignal = signal<string>('');
  products = signal<ProductListItemDto[]>([]);
  categoryGroups = signal<CategoryGroup[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(true);
  error = signal<string | null>(null);

  filters = signal<ProductFilters>({
    searchTerm: '',
    categoryId: '',
    sortBy: 'name',
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        const groupedArray = this.groupCategoriesByParent(categories);
        this.categoryGroups.set(groupedArray);
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  private groupCategoriesByParent(categories: Category[]): CategoryGroup[] {
    const groups = categories.reduce((acc, category) => {
      const parent = category.parentCategoryName || 'Other';
      (acc[parent] = acc[parent] || []).push(category);
      return acc;
    }, {} as Record<string, Category[]>);

    return Object.entries(groups).map(([parent, categories]) => ({
      parent,
      categories,
    }));
  }

  loadProducts(): void {
    const urlValue = this.categorySignal();
    const isNumeric = urlValue && !isNaN(Number(urlValue));

    const categoryId = isNumeric ? urlValue : undefined;
    const parentCategory = !isNumeric && urlValue !== 'all' ? urlValue : undefined;

    this.productService
      .getProducts(
        this.currentPage(),
        this.PAGE_SIZE,
        this.filters().searchTerm,
        categoryId,
        parentCategory,
        this.filters().sortBy
      )
      .subscribe({
        next: (response) => {
          this.products.set(response.items);
          this.totalPages.set(response.totalPages);
          this.currentPage.set(response.pageNumber);
        },
        error: (err) => {
          console.error('Error fetching products:', err);
          this.error.set('Failed to load products.');
          this.products.set([]);
        },
      });
  }

  onFiltersApply(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSearchTermChange(term: string): void {
    this.filters.update((f) => ({ ...f, searchTerm: term }));
  }

  onCategoryChange(categoryId: string): void {
    this.filters.update((f) => ({ ...f, categoryId }));
  }

  onSortByChange(sortBy: string): void {
    this.filters.update((f) => ({ ...f, sortBy }));
  }

  // addToCart(){

  // }
  
}
