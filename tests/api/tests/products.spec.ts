import { test, expect } from '@playwright/test';
import { ProductsClient } from '../clients/products_client';
import { Product } from '../models/Product';
import { expectCorrectResponse } from '../helpers/response_helper';
import { expectCorrectData } from '../helpers/product_helper';

test.describe('GET Products - empty', () => {
    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        await productsClient.deleteAllProducts();
    });

    test('should return an empty list of products', async ( { request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.getProducts();
        const products = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(products).toEqual([]);
    });

});

test.describe('GET Products', () => {
    let productId: number;

    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        const product = await response.json();
        productId = product.id;
    });

    test('should return a list of products', async ( { request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.getProducts();
        const products = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(Array.isArray(products)).toBe(true);

        products.forEach((product: Product) => {
            expect(product).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(String),
                    description: expect.any(String),
                    created_at: expect.any(String)
                })
            );

            expectCorrectData(product);
        });
    });

    test('should return a product by ID', async ( { request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.getProductById(productId);
        const product = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(product).toEqual(
            expect.objectContaining({
                id: productId,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String)
            })
        );

        expectCorrectData(product);
    });

    test('should return 404 for a non-existent product ID', async ( { request }) => {
        const nonExistentProductId = 999999999;
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.getProductById(nonExistentProductId);
        const errorResponse = await response.json();

        expectCorrectResponse(response, 404, duration);
        expect(errorResponse).toEqual({ error: 'Product not found' });
    });

    test('should return 400 for an invalid product ID', async ( { request }) => {
        const invalidProductId = 'invalid-id';
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.getProductById(invalidProductId as unknown as number);
        const errorResponse = await response.json();

        expectCorrectResponse(response, 400, duration);
        expect(errorResponse).toEqual({ error: 'Invalid product ID' });
    });
});

test.describe('POST Product', () => {
    test('should create a new product', async ( { request }) => {
        const productData = {
            name: 'New Product',
            price: '29.99',
            description: 'This is a new product',
        };

        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.postProduct(productData);
        const product = await response.json();

        expectCorrectResponse(response, 201, duration);
        expect(product.name).toBe(productData.name);
        expect(product.price).toBe(productData.price);
        expect(product.description).toBe(productData.description);
    });

    const errorCasesTests = [
        {"scenario": "should return 400 when creating a product with missing fields", "productData": { name: '', price: '', description: '' }, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with no name", "productData": { name: '', price: '29.99', description: 'This is a new product' }, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with non-string name", "productData": { name: 123, price: '29.99', description: 'This is a new product' }, "expectedError": { error: 'Name must be a string' }},
        {"scenario": "should return 400 when creating a product with no price", "productData": { name: 'Product without price', price: '', description: 'This is a new product' }, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with non-numeric-string price", "productData": { name: 'Invalid Price Product', price: 'not-a-number', description: 'This product has an invalid price' }, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a product with non-string price", "productData": { name: 'Invalid Price Product', price: 123, description: 'This product has an invalid price' }, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a product with negative price", "productData": { name: 'Negative Price Product', price: '-10.00', description: 'This product has a negative price' }, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a product with non-string description", "productData": { name: 'Invalid Description Product', price: '29.99', description: 123 }, "expectedError": { error: 'Description must be a string' }}
    ];

    errorCasesTests.forEach(({ scenario, productData, expectedError }) => {
        test(scenario, async ( { request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const { response, duration } = await productsClient.postProduct(productData);
            const errorResponse = await response.json();

            expectCorrectResponse(response, 400, duration);
            expect(errorResponse).toEqual(expectedError);
        });
    });

});

test.describe('PUT Product', () => {
    let productId: number;

    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        const product = await response.json();
        productId = product.id;
    });

    test('should update an existing product', async ( { request }) => {
        const updatedProductData = {
            name: 'Updated Product',
            price: '39.99',
            description: 'This is an updated product',
        };
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.putProduct(productId, updatedProductData);
        const updatedProduct = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(updatedProduct).toEqual({
            id: productId,
            name: updatedProductData.name,
            price: updatedProductData.price,
            description: updatedProductData.description,
            created_at: expect.any(String)
        });
    });

    test('should return 404 when updating a non-existent product', async ( { request }) => {
        const nonExistentProductId = 999999999;
        const updatedProductData = {
            name: 'Updated Product',
            price: '39.99',
            description: 'This is an updated product'
        };
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.putProduct(nonExistentProductId, updatedProductData);
        const errorResponse = await response.json();

        expectCorrectResponse(response, 404, duration);
        expect(errorResponse).toEqual({ error: 'Product not found' });
    });

    test('should return 400 when updating a product with invalid ID', async ( { request }) => {
        const invalidProductId = 'invalid-id';
        const updatedProductData = {
            name: 'Updated Product',
            price: '39.99',
            description: 'This is an updated product'
        };
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.putProduct(invalidProductId, updatedProductData);
        const errorResponse = await response.json();

        expectCorrectResponse(response, 400, duration);
        expect(errorResponse).toEqual({ error: 'Invalid product ID' });
    });

    const errorCasesTests = [
        {"scenario": "should return 400 when updating a product with missing fields", "productData": { name: '', price: '', description: '' }, "expectedError": { error: 'At least one field must be provided' }},
        {"scenario": "should return 400 when updating a product with non-string name", "productData": { name: 123, price: '39.99', description: 'This is an updated product' }, "expectedError": { error: 'Name must be a string' }},
        {"scenario": "should return 400 when updating a product with non-numeric-string price", "productData": { name: 'Updated Product', price: 'not-a-number', description: 'This is an updated product' }, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when updating a product with non-string price", "productData": { name: 'Updated Product', price: 123, description: 'This is an updated product' }, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when updating a product with negative price", "productData": { name: 'Updated Product', price: '-10.00', description: 'This is an updated product' }, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when updating a product with non-string description", "productData": { name: 'Updated Product', price: '39.99', description: 123 }, "expectedError": { error: 'Description must be a string' }}
    ];

    errorCasesTests.forEach(({scenario, productData, expectedError}) => {
        test(scenario, async ({ request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const { response, duration } = await productsClient.putProduct(productId, productData);
            const errorResponse = await response.json();

            expectCorrectResponse(response, 400, duration);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('DELETE Product', () => {
    let productId: number;

    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        const product = await response.json();
        productId = product.id;
    });

    test('should delete an existing product', async ( { request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.deleteProduct(productId);
        const deletedProduct = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(deletedProduct).toEqual({
            "message": "Product deleted",
            "product": {
                id: productId,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String)
            }
        });
    });

    const errorCasesTests = [
        {"scenario": "should return 404 when deleting a non-existent product", "productId": 999999999, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 400 when deleting a product with invalid ID", "productId": 'invalid-id', "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when deleting a product with negative ID", "productId": -1, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
    ];

    errorCasesTests.forEach(({ scenario, productId, errorCode, expectedError }) => {
        test(scenario, async ( { request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const { response, duration } = await productsClient.deleteProduct(productId);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode, duration);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});