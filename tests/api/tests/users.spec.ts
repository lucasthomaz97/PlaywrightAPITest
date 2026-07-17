import { test, expect } from '@playwright/test';
import { expectCorrectResponse } from '../helpers/response_helper';
import { UsersClient } from '../clients/users_client';
import { expectCorrectUserData } from '../helpers/user_helper';

test.describe('GET users', () => {
    let userId: number;

    test.beforeAll( async ({request}) => {
        const usersClient: UsersClient = new UsersClient(request);
        const {response, duration} = await usersClient.createUser('Test User' ,usersClient.generateEmail());
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

test.describe('POST users', () => {
    test('should create an user sucessfully', async({ request })=>{
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {
            name: 'New User', email: usersClient.generateEmail()
        }
        const { response, duration } = await usersClient.createUser(userData.name, userData.email);
        const user = await response.json();

        expectCorrectResponse(response, 201, duration);
        expect(user).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: userData.name,
            email: userData.email,
            created_at: expect.any(String)
        }));
        expectCorrectUserData(user);
    });

    test('should return 409 when creating an user with an email already in use', async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {
            name: 'New User', email: usersClient.generateEmail()
        }
        const { response, duration } = await usersClient.createUser(userData.name, userData.email);
        const user = await response.json();

        expectCorrectResponse(response, 201, duration);
        expect(user).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: userData.name,
            email: userData.email,
            created_at: expect.any(String)
        }));
        expectCorrectUserData(user);

        const {response: secondResponse, duration: secondDuration} = await usersClient.createUser(userData.name, userData.email);
        const error = await secondResponse.json();

        expectCorrectResponse(secondResponse, 409, secondDuration);
        expect(error).toEqual({"error": "Email already exists"});

    });

    const testCases = [
        {"scenario": "should return 400 when trying to create an user with empty fields", "data": {name: "", "email": ""}, "code": 400, "error": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create an user with no fields", "data": {}, "code": 400, "error": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create an user with empty name", "data": {name: "", "email": `post_test${Date.now()}@example.com`}, "code": 400, "error": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create an user with no name field", "data": {"email": `post_test${Date.now()}@example.com`}, "code": 400, "error": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create an user with a numeric value in the name field", "data": {name: 2026, "email": `post_test${Date.now()}@example.com`}, "code": 400, "error": {"error": 'Name must be a string'}},
        {"scenario": "should return 400 when trying to create an user with empty email", "data": {name: "Post Tests", "email": ""}, "code": 400, "error": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create an user with no email field", "data": {name: "Post Tests"}, "code": 400, "error": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create an user with a numeric value in the email field", "data": {name: "Post Tests", "email": 2026}, "code": 400, "error": {"error": "Email must be a valid email string"}},
        {"scenario": "should return 400 when trying to create an user with an invalid email string in the email field", "data": {name: "Post Tests", "email": "pretend_to_be_email"}, "code": 400, "error": {"error": "Email must be a valid email string"}}
    ]

    testCases.forEach(({ scenario, data, code, error}) => {
        test(scenario, async ({ request }) => {
            const usersClient: UsersClient = new UsersClient(request);
            const {response, duration} = await usersClient.createUser(data.name, data.email);
            const ret = await response.json()

            expectCorrectResponse(response, code, duration);
            expect(ret).toEqual(error);
        });
    });
});

//
// PUT /:id
//   - 200: Update user successfully
//   - 400: Invalid user ID
//   - 400: At least name or email must be provided
//   - 400: Name must be a string
//   - 400: Email must be a valid email string
//   - 404: User not found
//   - 409: Email already exists (unique constraint violation - 23505)
//

test.describe('DELETE users', () => {
    let userId: number;

    test.beforeAll( async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const {response, duration} = await usersClient.createUser('User to Delete', usersClient.generateEmail());
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

        const {response: createRes, duration: createDuration} = await usersClient.createUser('User To Delete', usersClient.generateEmail());
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