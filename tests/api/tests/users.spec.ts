import { test, expect } from '@playwright/test';
import { expectCorrectResponse } from '../helpers/response_helper';
import { UsersClient } from '../clients/users_client';
import { expectCorrectUserData } from '../helpers/user_helper';
import { User } from '../models/User';

// TODO: Write tests for the following user API validations:

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

    testCases.forEach(({ scenario, id, code, res }) => {
        test(scenario, async ( { request } ) => {
            const usersClient: UsersClient = new UsersClient(request);
            const { response, duration } = await usersClient.getUserById(id);
            const error = await response.json();

            expectCorrectResponse(response, code, duration);
            expect(error).toEqual(res);
        });
    });
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

test.describe('DELETE users', () => {
    let userId: number;

    test.beforeAll( async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const {response, duration} = await usersClient.createUser();
        const user = await response.json();
        userId = user.id;
    });

    test('should delete an existing user', async ({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const { response, duration } = await usersClient.deleteUser(userId);
        const user = await response.json();

        expectCorrectResponse(response, 200, duration);
        expect(user).toEqual(
            expect.objectContaining({
                "message": "User deleted",
                "user": {
                    "id": userId,
                    "name": expect.any(String),
                    "email": expect.any(String),
                    "created_at": expect.any(String)
                }
            })
        );
    });

    test('should return a 404 when trying to delete an user for the second time', async ({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);

        const {response: createRes, duration: createDuration} = await usersClient.createUser();
        const user = await createRes.json();
        const newUserId = user.id;

        const {response, duration} = await usersClient.deleteUser(newUserId);
        const userDel = await response.json();
        expectCorrectResponse(response, 200, duration);
        expect(userDel).toEqual(
            expect.objectContaining({
                "message": "User deleted",
                "user": {
                    "id": newUserId,
                    "name": expect.any(String),
                    "email": expect.any(String),
                    "created_at": expect.any(String)
                }
            })
        );

        const {response: secondResponse, duration: secondDuration} = await usersClient.deleteUser(newUserId);
        const errorRes = await secondResponse.json();
        console.log(errorRes);
        expectCorrectResponse(secondResponse, 404, secondDuration);
        expect(errorRes).toEqual({"error": "User not found"});
    });

    const testCases = [
        {"scenario": "should return 404 when deleting an user with id 0", "id": 0, "code": 404, "res": {"error": "User not found"}},
        {"scenario": "should return 404 when deleting a non existent user id", "id": 999999999, "code": 404, "res": {"error": "User not found"}},
        {"scenario": "should return 400 when deleting an user with invalid id", "id": "invalid-id", "code": 400, "res": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when deleting an user with a negative id", "id": -1, "code": 400, "res": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when deleting an user with a decimal id", "id": 1.5, "code": 400, "res": {"error": "Invalid user ID"}}
    ]

    testCases.forEach(({ scenario, id, code, res }) => {
        test(scenario, async({ request }) => {
            const usersClient: UsersClient = new UsersClient(request);
            const { response, duration } = await usersClient.deleteUser(id);
            const error = await response.json();

            expectCorrectResponse(response, code, duration);
            expect(error).toEqual(res);
        });
    })

})