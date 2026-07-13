import { test, expect } from '@playwright/test';
import { ProductsClient } from '../clients/products_client';
import { Product } from '../models/Product';
import { expectSucessfulResponse } from '../helpers/response_helper';
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

        expectSucessfulResponse(response, 200, duration);
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

        expectSucessfulResponse(response, 200, duration);
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

        expectSucessfulResponse(response, 200, duration);
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

        expectSucessfulResponse(response, 404, duration);
        expect(errorResponse).toEqual({ error: 'Product not found' });
    });

    test('should return 400 for an invalid product ID', async ( { request }) => {
        const invalidProductId = 'invalid-id';
        const productsClient: ProductsClient = new ProductsClient(request);
        const { response, duration } = await productsClient.getProductById(invalidProductId as unknown as number);
        const errorResponse = await response.json();

        expectSucessfulResponse(response, 400, duration);
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

        expectSucessfulResponse(response, 201, duration);
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

            expectSucessfulResponse(response, 400, duration);
            expect(errorResponse).toEqual(expectedError);
        });
    });

});
