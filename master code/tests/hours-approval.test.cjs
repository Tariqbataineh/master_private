const test = require('node:test'),
  assert = require('node:assert/strict');
const { scenario, env } = require('./test-helpers.cjs');
const schedule = (open = '09:00', close = '17:00') => ({
  workingHours: Object.fromEntries(
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => [
      day,
      { isOpen: true, openTime: open, closeTime: close },
    ]),
  ),
  specialHours: [],
  closedDates: [],
});
const data = (e) => JSON.parse(e.local.getItem('wusool.database.v2'));
const admin = (s) => s.login('admin@wusool.com', 'WusoolAdmin2026@', 'Admin');
test('organization request preserves approved hours and branch publication until admin comparison approval', async () => {
  const { e, s, org, branch } = await scenario();
  await s.login(org.email, 'Password123@', 'Organization');
  const original = await s.getSchedule('branches', branch.id);
  const result = await s.saveHours('branches', branch.id, schedule(), {
    expectedHoursRevision: original.hoursRevision,
    reason: 'New seasonal hours',
  });
  assert.equal(result.status, 'pending');
  assert.equal(result.applied, false);
  assert.equal(data(e).branches[0].workingHours.Monday.openTime, '00:00');
  assert.equal(data(e).branches[0].status, 'approved');
  assert.equal((await s.places()).items.length, 1);
  let requests = (await s.getHoursChangeRequests()).items;
  assert.equal(requests.length, 1);
  assert.equal(requests[0].before.workingHours.monday.openTime, '00:00');
  assert.equal(requests[0].proposed.workingHours.monday.openTime, '09:00');
  await admin(s);
  assert.ok(
    (await s.listAll('notifications')).items.some((n) => n.hoursChangeRequestId === requests[0].id),
  );
  await s.reviewHoursChangeRequest(
    requests[0].id,
    'approved',
    'Approved seasonal hours',
    requests[0].revision,
  );
  const approved = await s.getSchedule('branches', branch.id);
  assert.equal(approved.schedule.workingHours.monday.openTime, '09:00');
  assert.equal(approved.hoursRevision, 1);
  assert.equal(approved.pending, null);
  await s.login(org.email, 'Password123@', 'Organization');
  assert.equal((await s.getHoursChangeRequests()).items[0].status, 'approved');
  assert.ok(
    (await s.listAll('notifications')).items.some((n) => n.title === 'Working hours approved'),
  );
});
test('admin directly edits organization and branch schedules and supersedes older pending requests', async () => {
  const { e, s, org, branch } = await scenario();
  await s.login(org.email, 'Password123@', 'Organization');
  const pending = await s.saveHours('branches', branch.id, schedule('10:00', '16:00'));
  await admin(s);
  assert.equal(
    (
      await s.saveHours('organizations', org.id, schedule('08:00', '18:00'), {
        expectedHoursRevision: 0,
      })
    ).applied,
    true,
  );
  assert.equal(
    (
      await s.saveHours('branches', branch.id, schedule('11:00', '15:00'), {
        expectedHoursRevision: 0,
      })
    ).applied,
    true,
  );
  assert.equal(
    data(e).hoursChangeRequests.find((r) => r.id === pending.request.id).status,
    'superseded',
  );
  await assert.rejects(s.reviewHoursChangeRequest(pending.request.id, 'approved', '', 1), {
    code: 'REQUEST_ALREADY_REVIEWED',
  });
  assert.equal((await s.getOrganizationById(org.id)).workingHours.monday.openTime, '08:00');
});
test('reject requires reason, preserves old hours, and sends organization the reason', async () => {
  const { e, s, org, branch } = await scenario();
  await s.login(org.email, 'Password123@', 'Organization');
  const { request } = await s.saveHours('branches', branch.id, schedule());
  await admin(s);
  await assert.rejects(s.reviewHoursChangeRequest(request.id, 'rejected', '', 1), {
    code: 'VALIDATION_ERROR',
  });
  await s.reviewHoursChangeRequest(request.id, 'rejected', 'Keep current opening hours', 1);
  assert.equal(data(e).branches[0].workingHours.Monday.openTime, '00:00');
  assert.equal(data(e).hoursChangeRequests[0].status, 'rejected');
  await s.login(org.email, 'Password123@', 'Organization');
  assert.ok(
    (await s.listAll('notifications')).items.some((n) =>
      n.message.includes('Keep current opening hours'),
    ),
  );
});
test('ownership, validation, stale revisions and pending uniqueness block unauthorized or lost updates', async () => {
  const { e, s, org, branch, user } = await scenario();
  await s.login(user.email, 'Password123@');
  await assert.rejects(s.saveHours('branches', branch.id, schedule()), { code: 'FORBIDDEN' });
  const other = await s.register(
    { name: 'Other', email: 'hours-other@example.test', password: 'Password123@' },
    'Organization',
  );
  await admin(s);
  await s.setOrganizationStatus(other.id, 'active', 'approved');
  await s.login(other.email, 'Password123@', 'Organization');
  await assert.rejects(s.getSchedule('branches', branch.id), { code: 'FORBIDDEN' });
  await s.login(org.email, 'Password123@', 'Organization');
  const bad = schedule('18:00', '09:00');
  await assert.rejects(s.saveHours('branches', branch.id, bad), { code: 'VALIDATION_ERROR' });
  await assert.rejects(
    s.saveHours('branches', branch.id, {
      ...schedule(),
      workingHours: { monday: { isOpen: false } },
    }),
    { code: 'VALIDATION_ERROR' },
  );
  await assert.rejects(
    s.saveHours('branches', branch.id, {
      ...schedule(),
      specialHours: [{ date: '2026-02-30', status: 'closed' }],
    }),
    { code: 'VALIDATION_ERROR' },
  );
  const first = await s.saveHours('branches', branch.id, schedule());
  const again = await s.saveHours('branches', branch.id, schedule());
  assert.equal(first.request.id, again.request.id);
  assert.equal(data(e).hoursChangeRequests.length, 1);
  await assert.rejects(s.saveHours('branches', branch.id, schedule('10:00', '15:00')), {
    code: 'HOURS_REQUEST_PENDING',
  });
  await admin(s);
  await assert.rejects(s.reviewHoursChangeRequest(first.request.id, 'approved', '', 99), {
    code: 'STALE_SCHEDULE',
  });
  await s.reviewHoursChangeRequest(first.request.id, 'approved', '', 1);
  await assert.rejects(
    s.saveHours('branches', branch.id, schedule('08:00', '12:00'), { expectedHoursRevision: 0 }),
    { code: 'STALE_SCHEDULE' },
  );
});
test('legacy/full-form branch save cannot bypass schedule approval', async () => {
  const { e, s, org, branch } = await scenario();
  await s.login(org.email, 'Password123@', 'Organization');
  const row = await s.getBranchById(branch.id);
  const updated = await s.saveBranch({ ...row, ...schedule('10:00', '15:00'), hoursRevision: 0 });
  assert.equal(updated.hoursChangeStatus, 'pending');
  assert.equal(data(e).branches[0].workingHours.Monday.openTime, '00:00');
  assert.equal(data(e).branches[0].status, 'approved');
  assert.equal(data(e).hoursChangeRequests.length, 1);
  await s.rawWrite(
    'wusoolCurrentBranchDraft',
    JSON.stringify({ ...row, ...schedule('10:00', '15:00') }),
  );
  assert.equal(data(e).hoursChangeRequests.length, 1);
});
test('initial branch draft schedule is saved as setup evidence and never publishes the branch', async () => {
  const { s, org } = await scenario();
  await s.login(org.email, 'Password123@', 'Organization');
  const branch = await s.saveBranch({ name: 'New draft', city: 'Amman' });
  const outcome = await s.saveHours('branches', branch.id, schedule());
  assert.equal(outcome.applied, true);
  assert.equal(outcome.resource.status, 'draft');
  assert.equal(outcome.resource.completedSteps.workingHours, true);
  assert.equal(
    (await s.places()).items.some((x) => x.id === branch.id),
    false,
  );
});
test('organization defaults are used only when branch has no own schedule', async () => {
  const { e, s, org, branch } = await scenario();
  await admin(s);
  await s.saveHours('organizations', org.id, schedule('10:00', '13:00'));
  const raw = data(e);
  raw.branches[0].workingHours = {};
  e.local.setItem('wusool.database.v2', JSON.stringify(raw));
  await s.login(org.email, 'Password123@', 'Organization');
  const outcome = await s.saveHours('organizations', org.id, schedule('08:00', '18:00'));
  assert.equal(outcome.status, 'pending');
  assert.equal(
    (await s.getSchedule('organizations', org.id)).schedule.workingHours.monday.openTime,
    '10:00',
  );
});
test('approved shorter hours flag existing bookings and notify without silent cancellation', async () => {
  const { e, s, org, branch, user } = await scenario();
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await s.login(user.email, 'Password123@');
  const booking = await s.createBooking(
    { branchId: branch.id, date: future, time: '15:00' },
    'hours-impact',
  );
  await s.login(org.email, 'Password123@', 'Organization');
  await s.bookingStatus(booking.id, 'confirmed');
  const { request } = await s.saveHours('branches', branch.id, schedule('09:00', '12:00'));
  await admin(s);
  const reviewed = await s.reviewHoursChangeRequest(request.id, 'approved', '', 1);
  const record = data(e).bookings.find((b) => b.id === booking.id);
  assert.equal(record.status, 'confirmed');
  assert.equal(record.scheduleConflict, true);
  assert.deepEqual(JSON.parse(JSON.stringify(reviewed.affectedBookingIds)), [booking.id]);
  await s.login(user.email, 'Password123@');
  assert.ok(
    (await s.listAll('notifications')).items.some((n) => n.title === 'Working hours changed'),
  );
  await assert.rejects(
    s.createBooking({ branchId: branch.id, date: future, time: '16:00' }, 'hours-block'),
    { code: 'OUTSIDE_HOURS' },
  );
});
test('API schedules use dedicated endpoints and preserve conflict errors with no local writes', async () => {
  const e = env(undefined, { mode: 'api', baseUrl: '/api' }),
    s = e.api,
    calls = [];
  e.ctx.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () =>
        url.includes('hours-change-requests')
          ? { items: [], total: 0, page: 1, pageSize: 500 }
          : { status: 'pending', applied: false },
    };
  };
  await s.getSchedule('organizations', 'org/1');
  await s.saveHours('branches', 'branch/1', schedule(), {
    expectedHoursRevision: 4,
    reason: 'Seasonal',
  });
  await s.getHoursChangeRequests({ status: 'pending' });
  await s.reviewHoursChangeRequest('request/1', 'approved', 'OK', 2);
  assert.ok(calls[0].url.endsWith('/organizations/org%2F1/hours'));
  assert.equal(calls[1].options.method, 'PUT');
  assert.equal(JSON.parse(calls[1].options.body).expectedHoursRevision, 4);
  assert.ok(calls[3].url.endsWith('/hours-change-requests/request%2F1/decision'));
  assert.equal(e.local.getItem('wusool.database.v2'), null);
});
test('admin can edit blocked organization hours; deleting target closes pending requests', async () => {
  const { s, org, branch, e } = await scenario();
  await s.login(org.email, 'Password123@', 'Organization');
  const { request } = await s.saveHours('branches', branch.id, schedule());
  await admin(s);
  await s.setOrganizationStatus(org.id, 'blocked', 'Temporary account hold');
  assert.equal((await s.saveHours('organizations', org.id, schedule())).applied, true);
  await s.deleteBranch(branch.id, 'Removed branch');
  assert.equal(data(e).hoursChangeRequests.find((r) => r.id === request.id).status, 'superseded');
});
test('special holiday edits require approval and only then block reservations', async () => {
  const { s, org, branch, user } = await scenario();
  const date = new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10);
  await s.login(org.email, 'Password123@', 'Organization');
  const { request } = await s.saveHours('branches', branch.id, {
    ...schedule(),
    specialHours: [{ date, status: 'closed', note: 'Holiday' }],
  });
  await s.login(user.email, 'Password123@');
  await s.createBooking({ branchId: branch.id, date, time: '10:00' }, 'before-holiday');
  await admin(s);
  await s.reviewHoursChangeRequest(request.id, 'approved', 'Holiday verified', 1);
  await s.login(user.email, 'Password123@');
  await assert.rejects(
    s.createBooking({ branchId: branch.id, date, time: '12:00' }, 'after-holiday'),
    { code: 'HOLIDAY_CLOSED' },
  );
});
test('approved hours compare full booking duration and clear conflicts after compatible hours', async () => {
  const { s, org, branch, user, e } = await scenario();
  const date = new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10);
  await s.login(user.email, 'Password123@');
  const booking = await s.createBooking(
    { branchId: branch.id, date, time: '11:45', durationMinutes: 30 },
    'closing-impact',
  );
  await admin(s);
  await s.saveHours('branches', branch.id, schedule('09:00', '12:00'));
  assert.equal(data(e).bookings.find((b) => b.id === booking.id).scheduleConflict, true);
  await s.saveHours('branches', branch.id, schedule('09:00', '13:00'));
  assert.equal(data(e).bookings.find((b) => b.id === booking.id).scheduleConflict, undefined);
});
test('valid reschedule clears the prior approved-hours conflict', async () => {
  const { e, s, branch, user } = await scenario();
  const date = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await s.login(user.email, 'Password123@');
  const booking = await s.createBooking(
    { branchId: branch.id, date, time: '15:00' },
    'reschedule-conflict',
  );
  await admin(s);
  await s.saveHours('branches', branch.id, schedule('09:00', '12:00'));
  assert.equal(data(e).bookings.find((b) => b.id === booking.id).scheduleConflict, true);
  await s.updateBooking(booking.id, { date, time: '10:00', reason: 'Move within approved hours' });
  const updated = data(e).bookings.find((b) => b.id === booking.id);
  assert.equal(updated.scheduleConflict, undefined);
  assert.equal(updated.scheduleConflictAt, undefined);
  assert.equal(updated.time, '10:00');
});
