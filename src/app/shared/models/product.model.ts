export interface ProductListItemDto {
    productId : number;
    name : string;
    productNumber : string;
    color : string;
    listPrice : number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages : number;
}

export interface Category {
    categoryId: number;
    name: string;
    parentCategoryName: string | null; 
}

export interface CategoryGroup {
    parent: string;
    categories: Category[];
}