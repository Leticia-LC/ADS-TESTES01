import "@testing-library/jest-dom";

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
