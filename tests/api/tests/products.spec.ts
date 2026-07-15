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
    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        const product = await response.json();
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
});

test.describe('GET Product by ID', () => {
    let productId: number;

    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        const product = await response.json();
        productId = product.id;
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

    const errorCasesTests = [
        {"scenario": "should return 404 for a product with ID 0", "productId": 0, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 404 for a non-existent product ID", "productId": 999999999, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 400 for an invalid product ID", "productId": 'invalid-id', "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 for a negative product ID", "productId": -1, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 for a decimal ID", "productId": 1.5, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
    ];

    errorCasesTests.forEach(({ scenario, productId, errorCode, expectedError }) => {
        test(scenario, async ( { request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const { response, duration } = await productsClient.getProductById(productId);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode, duration);
            expect(errorResponse).toEqual(expectedError);
        });
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
        {"scenario": "should return 400 when creating a product with no fields", "productData": {}, "errorCode": 400, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with missing fields", "productData": { name: '', price: '', description: '' }, "errorCode": 400, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with no name", "productData": { name: '', price: '29.99', description: 'This is a new product' }, "errorCode": 400, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with non-string name", "productData": { name: 123, price: '29.99', description: 'This is a new product' }, "errorCode": 400, "expectedError": { error: 'Name must be a string' }},
        {"scenario": "should return 400 when creating a product with no price", "productData": { name: 'Product without price', price: '', description: 'This is a new product' }, "errorCode": 400, "expectedError": { error: 'Name and price are required' }},
        {"scenario": "should return 400 when creating a product with non-numeric-string price", "productData": { name: 'Invalid Price Product', price: 'not-a-number', description: 'This product has an invalid price' }, "errorCode": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a free product", "productData": {name: "Free Product", price: '0.00', description:"For free!"}, "errorCode": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a product with non-string price", "productData": { name: 'Invalid Price Product', price: 123, description: 'This product has an invalid price' }, "errorCode": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a product with negative price", "productData": { name: 'Negative Price Product', price: '-10.00', description: 'This product has a negative price' }, "errorCode": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when creating a product with non-string description", "productData": { name: 'Invalid Description Product', price: '29.99', description: 123 }, "errorCode": 400, "expectedError": { error: 'Description must be a string' }},
        {"scenario": "should create a new product with an empty description", "productData": { name: 'Product with empty description', price: '29.99', description: '' }, "errorCode":201, "expectedError": {id: expect.any(Number), name: expect.any(String), price: expect.any(String), description: expect.any(String), created_at: expect.any(String)}}
    ];

    errorCasesTests.forEach(({ scenario, productData, errorCode, expectedError }) => {
        test(scenario, async ( { request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const { response, duration } = await productsClient.postProduct(productData);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode, duration);
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

    const errorCasesTests = [
        {"scenario": "should return 404 when updating a non-existent product", "prodID": 999999999, "productData": {name: 'Updated Product', price: '39.99', description: 'This is an updated product'}, "code": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 400 when updating a product with invalid ID", "prodID": "invalid-id", "productData": {name: 'Updated Product', price: '39.99', description: 'This is an updated product'}, "code": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when updating the product with ID 0", "prodID": 0, "productData": {name: 'Updated Product', price: '39.99', description: 'This is an updated product'}, "code": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when trying to update a product with a decimal ID", "prodID": "1.5", "productData": {name: 'Decimal Product', price: '3.14', description: 'This is a decimal product'}, "code": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when trying to update a product with a negative ID", "prodID": "-1", "productData": {name: 'Negative Product', price: '10.00', description: 'This is a negative product'}, "code": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when updating a product with missing fields", "prodID": null, "productData": { name: '', price: '', description: '' }, "code": 400, "expectedError": { error: 'At least one field must be provided' }},
        {"scenario": "should return 400 when updating a product with no fields", "prodID": null, "productData": {}, "code": 400, "expectedError": { error: 'At least one field must be provided' }},
        {"scenario": "should return 200 when updating a product with only name", "prodID": null, "productData": { name: 'Updated Product' }, "code": 200, "expectedError": { id: expect.any(Number), name: expect.any(String), price: expect.any(String), description: expect.any(String), created_at: expect.any(String) }},
        {"scenario": "should return 400 when updating a product with non-string name", "prodID": null, "productData": { name: 123, price: '39.99', description: 'This is an updated product' }, "code": 400, "expectedError": { error: 'Name must be a string' }},
        {"scenario": "should return 200 when updating a product with only price", "prodID": null, "productData": { price: '49.99' }, "code": 200, "expectedError": { id: expect.any(Number), name: expect.any(String), price: expect.any(String), description: expect.any(String), created_at: expect.any(String) }},
        {"scenario": "should return 400 when updating a product with non-numeric-string price", "prodID": null, "productData": { name: 'Updated Product', price: 'not-a-number', description: 'This is an updated product' }, "code": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when updating a product with non-string price", "prodID": null, "productData": { name: 'Updated Product', price: 123, description: 'This is an updated product' }, "code": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 400 when updating a product with negative price", "prodID": null, "productData": { name: 'Updated Product', price: '-10.00', description: 'This is an updated product' }, "code": 400, "expectedError": { error: 'Price must be a numeric string' }},
        {"scenario": "should return 200 when updating a product with only description", "prodID": null, "productData": { description: 'This is an updated product' }, "code": 200, "expectedError": { id: expect.any(Number), name: expect.any(String), price: expect.any(String), description: expect.any(String), created_at: expect.any(String) }},
        {"scenario": "should return 400 when updating a product with non-string description", "prodID": null, "productData": { name: 'Updated Product', price: '39.99', description: 123 }, "code": 400, "expectedError": { error: 'Description must be a string' }},
        {"scenario": "should return 200 when updating a product with no description", "prodID": null, "productData": { name: 'Updated Product', price: '39.99' }, "code": 200, "expectedError": { id: expect.any(Number), name: expect.any(String), price: expect.any(String), description: expect.any(String), created_at: expect.any(String) }}
    ];

    errorCasesTests.forEach(({scenario, prodID, productData, code, expectedError}) => {
        test(scenario, async ({ request }) => {
            let id = prodID ?? productId;
            const productsClient: ProductsClient = new ProductsClient(request);
            const { response, duration } = await productsClient.putProduct(id, productData);
            const errorResponse = await response.json();

            expectCorrectResponse(response, code, duration);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('DELETE Product', () => {
    test('should delete an existing product', async ( { request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);

        const addResponse = await productsClient.addProduct();
        const product = await addResponse.json();
        let id = product.id;

        const { response, duration } = await productsClient.deleteProduct(id);
        const deletedProduct = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(deletedProduct).toEqual({
            "message": "Product deleted",
            "product": {
                id: id,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String)
            }
        });

        const { response: getResponse, duration: getDuration } = await productsClient.getProductById(id);
        expectCorrectResponse(getResponse, 404, getDuration);
        expect(await getResponse.json()).toEqual({ error: 'Product not found' });
    });

    test('should return 404 when trying to delete a product for a second time', async ( { request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);

        const res = await productsClient.addProduct();
        const product = await res.json();
        let id = product.id;

        const { response, duration } = await productsClient.deleteProduct(id);
        const errorResponse = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(errorResponse).toEqual({
            "message": "Product deleted",
            "product": {
                id: id,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String)
            }
        });

        const { response: secondResponse, duration: secondDuration } = await productsClient.deleteProduct(id);
        const secondErrorResponse = await secondResponse.json();
        expectCorrectResponse(secondResponse, 404, secondDuration);
        expect(secondErrorResponse).toEqual({ error: 'Product not found' });
    });

    const errorCasesTests = [
        {"scenario": "should return 404 for a product with ID 0", "productId": 0, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 404 when deleting a non-existent product", "productId": 999999999, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 400 when deleting a product with invalid ID", "productId": 'invalid-id', "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when deleting a product with negative ID", "productId": -1, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 when deleting a product with decimal ID", "productId": 1.5, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
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