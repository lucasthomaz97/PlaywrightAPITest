import { test, expect } from '@playwright/test';
import { expectCorrectResponse } from '../helpers/response_helper';
import { UsersClient } from '../clients/users_client';
import { expectCorrectUserData } from '../helpers/user_helper';

// TODO: Write tests for the following user API validations:
//
// GET /:id
//   - 200: Return user by ID
//   - 400: Invalid user ID (non-numeric, negative, empty, decimal)
//   - 404: User not found

test.describe('GET users', () => {
    let userId: number;

    test.beforeAll( async ({request}) => {
        const usersClient: UsersClient = new UsersClient(request);
        const {response, duration} = await usersClient.createUser();
        const user = await response.json();
        userId = user.id;
    });

    test('should return a correspondent user by its id', async ({request})=> {
        const usersClient: UsersClient = new UsersClient(request);
        const { response, duration } = await usersClient.getUserById(userId);
        const user = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(user).toEqual(
            expect.objectContaining({
                id: userId,
                name: expect.any(String),
                email: expect.any(String),
                created_at: expect.any(String)
            })
        )
        expectCorrectUserData(user);
    });

    const testCases = [
        {"scenario": "should return 404 for a non existent user id", "id": 999999999, "code": 404, "res": {"error": "User not found"}},
        {"scenario": "should return 400 for an invalid user id", "id": "invalid-id", "code": 400, "res": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 for a negative user id", "id": -1, "code": 400, "res": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 for a decimal user id", "id": 1.5, "code": 400, "res": {"error": "Invalid user ID"}}
    ]

    testCases.forEach(({ scenario, id, code, res })=> {
        test(scenario, async ( { request } ) => {
            const usersClient: UsersClient = new UsersClient(request);
            const { response, duration } = await usersClient.getUserById(id);
            const error = await response.json();

            expectCorrectResponse(response, code, duration);
            expect(error).toEqual(res);
        })
    })
});

// POST /
//   - 201: Create user successfully
//   - 400: Missing name or email
//   - 400: Name must be a string
//   - 400: Email must be a valid email string
//   - 409: Email already exists (unique constraint violation - 23505)
//   - 500: Internal server error on unexpected DB failures
//
// PUT /:id
//   - 200: Update user successfully
//   - 400: Invalid user ID
//   - 400: At least name or email must be provided
//   - 400: Name must be a string
//   - 400: Email must be a valid email string
//   - 404: User not found
//   - 409: Email already exists (unique constraint violation - 23505)
//   - 500: Internal server error on unexpected DB failures
//
// DELETE /:id
//   - 200: Delete user successfully
//   - 400: Invalid user ID
//   - 404: User not found
//   - 409: Cannot delete user with associated orders (FK violation - 23503)
//   - 500: Internal server error on unexpected DB failures
