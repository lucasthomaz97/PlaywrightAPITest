import { APIResponse, expect } from '@playwright/test';

export function expectSucessfulResponse(response: APIResponse, expectedStatus: number = 200, duration: number, durationThreshold: number = 1000) {
    expect(duration).toBeLessThan(durationThreshold);
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
};