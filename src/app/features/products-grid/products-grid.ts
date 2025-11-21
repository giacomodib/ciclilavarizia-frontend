import { Component, input, effect, untracked, computed, OnInit, inject, signal } from '@angular/core';
import { CategoryGroup, Category, ProductListItemDto } from '../../shared/models/product.model';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductService } from '../../shared/services/product';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-products-grid',
    standalone: true,
    imports: [
        CommonModule,
        MatSidenavModule,
        MatListModule,
        MatExpansionModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
        ProductCard
    ],
    templateUrl: './products-grid.html',
    styleUrl: './products-grid.scss',
})
// default for lazy loading (check app.routes.ts)
export default class ProductsGrid implements OnInit {
    private productService = inject(ProductService);
    private readonly PAGE_SIZE = 30;
    category = input<string>();
    categoryValue = computed(() => this.category() || 'all');
    currentCategoryName = computed(() => {
        const val = this.categoryValue();
        const list = this.allCategories();
        if (val === 'all') return 'All Products';
        
        if (!isNaN(Number(val))) {
            const found = list.find(c => c.categoryId.toString() === val);
            return found ? found.name : val; 
        }
        return val; 
    });

    products = signal<ProductListItemDto[]>([]);
    allCategories = signal<Category[]>([]);     
    categoryGroups = signal<CategoryGroup[]>([]); 
    
    totalItems = signal(0); 
    currentPage = signal(1);
    isLoading = signal(true);

    constructor() {
        effect(() => {
            const catVal = this.categoryValue();
            if (this.allCategories().length > 0) {
                untracked(() => {
                    this.currentPage.set(1);
                    this.loadProducts();
                });
            }
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.productService.getCategories().subscribe({
            next: (categories) => {
                this.allCategories.set(categories);
                this.categoryGroups.set(this.groupCategoriesByParent(categories));
                this.loadProducts();
            },
            error: (err) => console.error(err)
        });
    }

    loadProducts(): void {
        this.isLoading.set(true);
        const urlValue = this.categoryValue();
        const isNumeric = urlValue && !isNaN(Number(urlValue));
        const categoryId = isNumeric ? urlValue : undefined;
        const parentCategory = !isNumeric && urlValue !== 'all' ? urlValue : undefined;

        this.productService.getProducts(
            this.currentPage(),
            this.PAGE_SIZE,
            '', 
            categoryId,
            parentCategory,
            'name'
        ).subscribe({
            next: (res) => {
                this.products.set(res.items);
                this.totalItems.set(res.totalCount); 
                this.isLoading.set(false);
            },
            error: () => {
                this.products.set([]);
                this.totalItems.set(0);
                this.isLoading.set(false);
            }
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

    onFiltersApply(): void {
        this.currentPage.set(1);
        this.loadProducts();
    }

    // onSearchTermChange(term: string): void {
    //     this.filters.update((f) => ({ ...f, searchTerm: term }));
    // }

    // onCategoryChange(categoryId: string): void {
    //     this.filters.update((f) => ({ ...f, categoryId }));
    // }

    // onSortByChange(sortBy: string): void {
    //     this.filters.update((f) => ({ ...f, sortBy }));
    // }

    // addToCart(){

    // }
}
