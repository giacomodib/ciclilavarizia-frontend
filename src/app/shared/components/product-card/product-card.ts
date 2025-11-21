import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ProductListItemDto } from '../../models/product.model';

@Component({
    selector: 'app-product-card',
    imports: [MatButtonModule, MatIcon],
    templateUrl: './product-card.html',
    styleUrl: './product-card.scss',
})
export class ProductCard {
    product = input.required<ProductListItemDto>();

    AddToCartClicked = output<ProductListItemDto>();
}
