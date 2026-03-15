import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define handlers for API endpoints
export const handlers = [
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'aluno@authtask.dev' && body.password === '123456') {
      return HttpResponse.json({ user: { id: 'aluno_demo', name: 'Aluno Demo', email: 'aluno@authtask.dev' } });
    }
    return HttpResponse.json({ errors: { email: 'Credenciais inválidas' } }, { status: 401 });
  }),

  http.get('/api/tasks', () => {
    return HttpResponse.json({ tasks: [] });
  }),

  http.post('/api/tasks', async ({ request }) => {
    const body = await request.json() as { title: string };
    return HttpResponse.json({ task: { id: '1', title: body.title, completed: false } });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);