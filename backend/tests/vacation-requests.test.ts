import request from 'supertest';
import app from '@/app';

const ALICE = 1;
const BOB = 2;
const CAROL = 3;

function dateOffset(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function createPendingAs(
  userId: number,
  overrides: Partial<{ startDate: string; endDate: string; reason: string }> = {},
): Promise<number> {
  const body = {
    startDate: overrides.startDate ?? dateOffset(7),
    endDate: overrides.endDate ?? dateOffset(10),
    reason: overrides.reason ?? 'Trip',
  };
  const res = await request(app)
    .post('/api/vacation-requests')
    .set('X-User-Id', String(userId))
    .send(body);
  if (res.status !== 201) {
    throw new Error(`Setup createPendingAs failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

describe('POST /api/vacation-requests', () => {
  it('creates a request as a Requester (Alice) and returns 201 with full object', async () => {
    const startDate = dateOffset(7);
    const endDate = dateOffset(10);

    const res = await request(app)
      .post('/api/vacation-requests')
      .set('X-User-Id', String(ALICE))
      .send({ startDate, endDate, reason: 'Family trip' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      startDate,
      endDate,
      reason: 'Family trip',
      status: 'Pending',
      comments: null,
      validator: null,
      user: { id: ALICE, name: 'Alice', role: 'Requester' },
    });
    expect(typeof res.body.id).toBe('number');
    expect(res.body.createdAt).toBeTruthy();
  });

  it('returns 403 when a Validator (Carol) tries to create a request', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('X-User-Id', String(CAROL))
      .send({ startDate: dateOffset(7), endDate: dateOffset(10) });

    expect(res.status).toBe(403);
    expect(res.body.error?.message).toBeTruthy();
  });

  it('returns 401 when X-User-Id header is missing', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .send({ startDate: dateOffset(7), endDate: dateOffset(10) });

    expect(res.status).toBe(401);
    expect(res.body.error?.message).toBeTruthy();
  });

  it('returns 400 when endDate is before startDate', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('X-User-Id', String(ALICE))
      .send({ startDate: dateOffset(10), endDate: dateOffset(7) });

    expect(res.status).toBe(400);
    expect(res.body.error?.message).toBe('Validation failed.');
    const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
    expect(fields).toContain('endDate');
  });

  it('returns 400 when startDate is in the past', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('X-User-Id', String(ALICE))
      .send({ startDate: dateOffset(-5), endDate: dateOffset(-1) });

    expect(res.status).toBe(400);
    expect(res.body.error?.message).toBe('Validation failed.');
    const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
    expect(fields).toContain('startDate');
  });
});

describe('GET /api/vacation-requests/my', () => {
  it('returns only the current Requester’s requests (Alice)', async () => {
    await createPendingAs(ALICE, { reason: 'Alice 1' });
    await createPendingAs(ALICE, { reason: 'Alice 2' });
    await createPendingAs(BOB, { reason: 'Bob 1' });

    const res = await request(app)
      .get('/api/vacation-requests/my')
      .set('X-User-Id', String(ALICE));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    for (const r of res.body as Array<{ user: { id: number } }>) {
      expect(r.user.id).toBe(ALICE);
    }
  });
});

describe('GET /api/vacation-requests', () => {
  it('returns all requests when called as a Validator (Carol)', async () => {
    await createPendingAs(ALICE);
    await createPendingAs(BOB);
    await createPendingAs(ALICE);

    const res = await request(app)
      .get('/api/vacation-requests')
      .set('X-User-Id', String(CAROL));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('filters by status=Pending', async () => {
    const aliceId = await createPendingAs(ALICE);
    await createPendingAs(BOB);

    await request(app)
      .patch(`/api/vacation-requests/${aliceId}/approve`)
      .set('X-User-Id', String(CAROL))
      .send({});

    const pending = await request(app)
      .get('/api/vacation-requests?status=Pending')
      .set('X-User-Id', String(CAROL));

    expect(pending.status).toBe(200);
    expect(pending.body).toHaveLength(1);
    expect((pending.body as Array<{ status: string }>)[0].status).toBe('Pending');
  });
});

describe('PATCH /api/vacation-requests/:id/approve', () => {
  it('as Validator: sets status to Approved, sets validator and comments', async () => {
    const id = await createPendingAs(ALICE);

    const res = await request(app)
      .patch(`/api/vacation-requests/${id}/approve`)
      .set('X-User-Id', String(CAROL))
      .send({ comments: 'Enjoy your vacation!' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      status: 'Approved',
      comments: 'Enjoy your vacation!',
      validator: { id: CAROL, name: 'Carol', role: 'Validator' },
    });
  });

  it('returns 409 when approving a request that is already Approved', async () => {
    const id = await createPendingAs(ALICE);

    const first = await request(app)
      .patch(`/api/vacation-requests/${id}/approve`)
      .set('X-User-Id', String(CAROL))
      .send({});
    expect(first.status).toBe(200);

    const second = await request(app)
      .patch(`/api/vacation-requests/${id}/approve`)
      .set('X-User-Id', String(CAROL))
      .send({});

    expect(second.status).toBe(409);
    expect(second.body.error?.message).toMatch(/Approved/);
  });
});

describe('PATCH /api/vacation-requests/:id/reject', () => {
  it('returns 400 when comments are missing', async () => {
    const id = await createPendingAs(ALICE);

    const res = await request(app)
      .patch(`/api/vacation-requests/${id}/reject`)
      .set('X-User-Id', String(CAROL))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error?.message).toBe('Validation failed.');
    const fields = (res.body.error.details as Array<{ field: string }>).map((d) => d.field);
    expect(fields).toContain('comments');
  });

  it('rejects a request when comments are provided', async () => {
    const id = await createPendingAs(ALICE);

    const res = await request(app)
      .patch(`/api/vacation-requests/${id}/reject`)
      .set('X-User-Id', String(CAROL))
      .send({ comments: 'Insufficient coverage during requested period.' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      status: 'Rejected',
      comments: 'Insufficient coverage during requested period.',
      validator: { id: CAROL, name: 'Carol', role: 'Validator' },
    });
  });
});

describe('PATCH /api/vacation-requests/:id (not found)', () => {
  it('returns 404 for approve on a non-existent id', async () => {
    const res = await request(app)
      .patch('/api/vacation-requests/999999/approve')
      .set('X-User-Id', String(CAROL))
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.error?.message).toBeTruthy();
  });
});
