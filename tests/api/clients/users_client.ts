import { APIRequestContext } from '@playwright/test';

export class UsersClient {
    constructor(private request: APIRequestContext) {}

    async createUser() {
        const start = Date.now()
        const response = await this.request.post('/users', {
            data: {
                'name': 'Test User',
                'email': `test_${start}@example.com`
            }
        });
        const duration = Date.now() - start;
        return {response, duration};
    }

    async getUserById(userId: any) {
        const start = Date.now();
        const response = await this.request.get(`/users/${userId}`);
        const duration = Date.now() - start;
        return {response, duration};
    }
}