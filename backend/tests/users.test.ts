import request from 'supertest';
import app from '@/app';

describe('GET /api/users', () => {
  it('returns the four seeded users with expected names and roles', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);

    const byName = Object.fromEntries(
      (res.body as Array<{ id: number; name: string; role: string }>).map((u) => [u.name, u]),
    );
    expect(byName.Alice?.role).toBe('Requester');
    expect(byName.Bob?.role).toBe('Requester');
    expect(byName.Carol?.role).toBe('Validator');
    expect(byName.Dave?.role).toBe('Validator');
  });
});
