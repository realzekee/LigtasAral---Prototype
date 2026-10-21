import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approvePendingReport,
  evaluateRouteSafety,
  filterCityStatuses,
  validateOfficialUrl,
} from './suspensionLogic';
import { INITIAL_CITY_STATUSES, INITIAL_FLOOD_ALERTS } from '../data/seedData';
import { PendingReport } from '../types';

test('filterCityStatuses filters by search query and status filter accurately', () => {
  const all = filterCityStatuses(INITIAL_CITY_STATUSES, '', 'all');
  assert.equal(all.length, INITIAL_CITY_STATUSES.length);

  const suspendedOnly = filterCityStatuses(INITIAL_CITY_STATUSES, '', 'suspended');
  assert.ok(suspendedOnly.length > 0);
  assert.ok(suspendedOnly.every((c) => c.status === 'suspended'));

  const modularOnly = filterCityStatuses(INITIAL_CITY_STATUSES, '', 'modular');
  assert.ok(modularOnly.length > 0);
  assert.ok(modularOnly.every((c) => c.status === 'modular'));

  const ongoingOnly = filterCityStatuses(INITIAL_CITY_STATUSES, '', 'ongoing');
  assert.ok(ongoingOnly.length > 0);
  assert.ok(ongoingOnly.every((c) => c.status === 'ongoing'));

  const caviteSearch = filterCityStatuses(INITIAL_CITY_STATUSES, 'General Trias', 'all');
  assert.equal(caviteSearch.length, 1);
  assert.equal(caviteSearch[0].city, 'General Trias');
});

test('validateOfficialUrl enforces mandatory valid http/https URLs', () => {
  assert.equal(validateOfficialUrl('').valid, false);
  assert.equal(validateOfficialUrl('not-a-url').valid, false);
  assert.equal(validateOfficialUrl('ftp://files.gov.ph/memo.pdf').valid, false);
  assert.equal(
    validateOfficialUrl('https://www.facebook.com/ManilaPIO/posts/12345').valid,
    true
  );
});

test('approvePendingReport updates existing city or prepends newly verified city', () => {
  const sampleReport: PendingReport = {
    id: 'pend-test-1',
    city: 'Bacoor',
    province: 'Cavite',
    levels: 'All Levels',
    modality: 'Complete Cancellation',
    sector: 'Public & Private',
    officialUrl: 'https://www.facebook.com/CityGovtOfBacoor/posts/123',
    submittedBy: '@tester',
    submittedAt: '05:20 AM PST',
    notes: 'Confirmed by Mayor Strike Revilla',
  };

  const nextCities = approvePendingReport(
    INITIAL_CITY_STATUSES,
    sampleReport,
    '05:22 AM PST'
  );

  assert.equal(nextCities[0].city, 'Bacoor');
  assert.equal(nextCities[0].status, 'suspended');
  assert.equal(nextCities[0].verifiedAt, '05:22 AM PST');
  assert.equal(nextCities.length, INITIAL_CITY_STATUSES.length + 1);

  // Also test updating an existing city (e.g., Makati from ongoing -> modular)
  const updateMakati: PendingReport = {
    id: 'pend-test-2',
    city: 'Makati',
    province: 'Metro Manila',
    levels: 'All Levels',
    modality: 'Shift to Asynchronous / Online Only',
    sector: 'Public & Private',
    officialUrl: 'https://www.facebook.com/MyMakatiVerified/posts/999',
    submittedBy: '@makati_student',
    submittedAt: '05:25 AM PST',
  };

  const updatedExisting = approvePendingReport(
    INITIAL_CITY_STATUSES,
    updateMakati,
    '05:26 AM PST'
  );
  assert.equal(updatedExisting.length, INITIAL_CITY_STATUSES.length);
  assert.equal(updatedExisting[0].city, 'Makati');
  assert.equal(updatedExisting[0].status, 'modular');
});

test('evaluateRouteSafety returns appropriate commuter advisory for Home + School combinations', () => {
  const gentri = INITIAL_CITY_STATUSES.find((c) => c.city === 'General Trias');
  const manila = INITIAL_CITY_STATUSES.find((c) => c.city === 'Manila');
  const makati = INITIAL_CITY_STATUSES.find((c) => c.city === 'Makati');
  const qc = INITIAL_CITY_STATUSES.find((c) => c.city === 'Quezon City');

  const routeToManila = evaluateRouteSafety(gentri, manila, INITIAL_FLOOD_ALERTS);
  assert.equal(routeToManila.severity, 'stop');

  const routeToQc = evaluateRouteSafety(gentri, qc, INITIAL_FLOOD_ALERTS);
  assert.equal(routeToQc.severity, 'caution');

  const routeGentriToMakati = evaluateRouteSafety(gentri, makati, INITIAL_FLOOD_ALERTS);
  assert.equal(routeGentriToMakati.severity, 'caution');
});
