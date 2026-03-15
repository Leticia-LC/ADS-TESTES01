import "@testing-library/jest-dom";
// import { server } from './src/mocks/handlers';

// Establish API mocking before all tests.
// beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// afterEach(() => server.resetHandlers());

// Clean up after all tests are done.
// afterAll(() => server.close());

const mockResponse = (data: any, options?: { status?: number }) => {
  const response = new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
  (response as any).cookies = {
    set: jest.fn(),
  };
  return response;
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(mockResponse),
  },
}));
