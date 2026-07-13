import { APIRequestContext } from '@playwright/test';

export class ProductsClient {
    constructor(private request: APIRequestContext) {}

    async addProduct() {
        const response = await this.request.post('/products', {
            data: {
                name: 'Test Product',
                price: '19.99',
                description: 'This is a test product',
            },
        });
        return response;
    }

    async deleteAllProducts() {
        const response = await this.request.get('/products');
        const products = await response.json();
        for (const product of products) {
            await this.request.delete(`/products/${product.id}`);
        }
    }

    async getProducts(request: APIRequestContext) {
        const start = Date.now();
        const response = await request.get('/products');
        const duration = Date.now() - start;
        return { response, duration };
    }

    async postProduct(productData: { name: any; price: any; description: any }) {
        const start = Date.now();
        const response = await this.request.post('/products', {
            data: productData,
        });
        const duration = Date.now() - start;
        return { response, duration };
    }

}