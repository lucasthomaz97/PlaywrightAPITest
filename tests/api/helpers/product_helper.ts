import { expect } from '@playwright/test';
import { Product } from '../models/Product';

export function expectCorrectProductData(product: Product) {
    expect(product.id).toBeGreaterThan(0);
    expect(product.name.trim()).not.toBe("");
    expect(Number(product.price)).toBeGreaterThanOrEqual(0);
    expect(Number(product.price)).not.toBeNaN();
    expect(Date.parse(product.created_at)).not.toBeNaN();
}