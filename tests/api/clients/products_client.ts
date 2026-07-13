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

    async getProducts() {
        const start = Date.now();
        const response = await this.request.get('/products');
        const duration = Date.now() - start;
        return { response, duration };
    }

    async getProductById(productId: any) {
        const start = Date.now();
        const response = await this.request.get(`/products/${productId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async putProduct(productId: any, productData: { name: any; price: any; description: any }) {
        const start = Date.now();
        const response = await this.request.put(`/products/${productId}`, {
            data: productData,
        });
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

    async deleteProduct(productId: any) {
        const start = Date.now();
        const response = await this.request.delete(`/products/${productId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }
}