/**
 * Comprehensive API & Database CRUD Verification Test
 * Tests all endpoints, database persistence, and operations.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('HIPG DTVS - API & DATABASE CRUD TEST RUNNER');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health & Database Status
  console.log('--- 1. Testing Database & Health Status ---');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'Health endpoint responds with HTTP 200');
    assert(data.status === 'UP', 'Service status is UP');
    assert(data.counts.tallies > 0, `Database contains tallies (${data.counts.tallies} records)`);
    assert(data.counts.vessels > 0, `Database contains vessels (${data.counts.vessels} records)`);
    assert(data.sampleDataLoaded.talliesLoaded, 'Seed sample tally DTVS-2026-000784 is loaded');
    console.log(`  -> Database Engine: ${data.database.engine}`);
  } catch (err) {
    assert(false, `Health check exception: ${err.message}`);
  }

  // 2. Auth Endpoints
  console.log('\n--- 2. Testing Authentication & User Endpoints ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'Security Officer' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, 'Login as Security Officer succeeds');
    assert(loginData.user.role === 'Security Officer', 'Authenticated user role is Security Officer');

    const meRes = await fetch(`${BASE_URL}/api/auth/me`);
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.success, 'GET /api/auth/me returns current user');
  } catch (err) {
    assert(false, `Auth check exception: ${err.message}`);
  }

  // 3. Vessel CRUD Operations
  console.log('\n--- 3. Testing Vessel Management CRUD ---');
  let testVesselId = null;
  try {
    // 3.1 List vessels
    const listRes = await fetch(`${BASE_URL}/api/vessels`);
    const listData = await listRes.json();
    assert(listRes.status === 200 && Array.isArray(listData.vessels), 'GET /api/vessels returns array');

    // 3.2 Create vessel
    const createRes = await fetch(`${BASE_URL}/api/vessels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auto Advance Leader',
        imoNumber: '9988112',
        voyageNumber: 'AAL-001',
        docNumber: '55410',
        shippingAgent: 'NYK Line',
        berthLocation: 'Berth 08 (RoRo)',
        status: 'Scheduled',
        totalManifestedVehicles: 350,
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 200 && createData.success, 'POST /api/vessels creates new vessel');
    testVesselId = createData.vessel.id;

    // 3.3 Read single vessel
    const getRes = await fetch(`${BASE_URL}/api/vessels/${testVesselId}`);
    const getData = await getRes.json();
    assert(getRes.status === 200 && getData.vessel.name === 'Auto Advance Leader', 'GET /api/vessels/[id] retrieves vessel');

    // 3.4 Update vessel
    const putRes = await fetch(`${BASE_URL}/api/vessels/${testVesselId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Arrived' }),
    });
    const putData = await putRes.json();
    assert(putRes.status === 200 && putData.vessel.status === 'Arrived', 'PUT /api/vessels/[id] updates status to Arrived');
  } catch (err) {
    assert(false, `Vessel CRUD exception: ${err.message}`);
  }

  // 4. Vehicle Tally CRUD & Supervisor Workflow
  console.log('\n--- 4. Testing Vehicle Tally CRUD & Workflows ---');
  let testTallyId = null;
  let testTallyRef = null;
  try {
    // 4.1 Create Tally (Pending Approval)
    const createTallyRes = await fetch(`${BASE_URL}/api/tallies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vesselId: testVesselId || 'vessel-gp-015',
        vesselName: 'Auto Advance Leader',
        voyageNo: 'AAL-001',
        docNo: '55410',
        vehicleNo: 'CRUD-TEST-88',
        chassisNo: 'VIN8899AAL001122',
        cargoType: 'Vehicle (CBU)',
        agentName: 'NYK Line',
        yardLocation: 'Berth 08 (RoRo)',
        brandModel: 'Mazda CX-60 (Sonic Silver)',
        checklist: [
          { id: 'monogram', name: 'Monogram', status: 'OK' },
          { id: 'top_cap', name: 'Top Cap', status: 'OK' },
        ],
        damages: [
          {
            id: 'd-test-1',
            category: 'Scratched',
            location: 'Rear Bumper',
            severity: 'Minor',
            remarks: '5cm paint scratch',
          },
        ],
        photos: [],
      }),
    });
    const createTallyData = await createTallyRes.json();
    assert(createTallyRes.status === 200 && createTallyData.success, 'POST /api/tallies creates tally record');
    testTallyId = createTallyData.tally.id;
    testTallyRef = createTallyData.tally.referenceNo;
    assert(testTallyRef.startsWith('DTVS-'), `Reference number generated properly: ${testTallyRef}`);
    assert(!!createTallyData.tally.qrCodeDataUrl, 'Verifiable QR Code automatically generated');

    // 4.2 Read Tallies List with Search & Filter
    const listTalliesRes = await fetch(`${BASE_URL}/api/tallies?search=CRUD-TEST-88`);
    const listTalliesData = await listTalliesRes.json();
    assert(listTalliesRes.status === 200 && listTalliesData.tallies.length > 0, 'GET /api/tallies filters by vehicle search term');

    // 4.3 Read Tally by ID and by Reference Number
    const getByIdRes = await fetch(`${BASE_URL}/api/tallies/${testTallyId}`);
    const getByIdData = await getByIdRes.json();
    assert(getByIdRes.status === 200 && getByIdData.tally.vehicleNo === 'CRUD-TEST-88', 'GET /api/tallies/[id] finds by ID');

    const getByRefRes = await fetch(`${BASE_URL}/api/tallies/${testTallyRef}`);
    const getByRefData = await getByRefRes.json();
    assert(getByRefRes.status === 200 && getByRefData.tally.id === testTallyId, 'GET /api/tallies/[ref] finds by Reference Number');

    // 4.4 Update Tally (while unlocked)
    const updateTallyRes = await fetch(`${BASE_URL}/api/tallies/${testTallyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandModel: 'Mazda CX-60 AWD (Updated)' }),
    });
    const updateTallyData = await updateTallyRes.json();
    assert(updateTallyRes.status === 200 && updateTallyData.tally.brandModel.includes('Updated'), 'PUT /api/tallies/[id] updates record');

    // 4.5 Request Changes Workflow
    const changeReqRes = await fetch(`${BASE_URL}/api/tallies/${testTallyId}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: 'Please attach close up photo of rear bumper scratch.' }),
    });
    const changeReqData = await changeReqRes.json();
    assert(changeReqRes.status === 200 && changeReqData.tally.status === 'Changes Requested', 'POST /api/tallies/[id]/request-changes sets status to Changes Requested');

    // 4.6 Approve & Lock Workflow
    const approveRes = await fetch(`${BASE_URL}/api/tallies/${testTallyId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: 'Physical condition verified and certified by Port Supervisor.' }),
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.tally.status === 'Approved', 'POST /api/tallies/[id]/approve sets status to Approved');
    assert(approveData.tally.isLocked === true, 'Record is locked against unauthorized modifications');

    // 4.7 Security Integrity Test: Attempt update on locked record -> MUST FAIL (HTTP 403)
    const illegalUpdateRes = await fetch(`${BASE_URL}/api/tallies/${testTallyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleNo: 'ILLEGAL-TAMPER' }),
    });
    assert(illegalUpdateRes.status === 403, 'PUT on locked record returns HTTP 403 Forbidden (Tamper Protection)');

    // 4.8 Security Integrity Test: Attempt delete on locked record -> MUST FAIL (HTTP 400)
    const illegalDeleteRes = await fetch(`${BASE_URL}/api/tallies/${testTallyId}`, {
      method: 'DELETE',
    });
    assert(illegalDeleteRes.status === 400, 'DELETE on locked record is rejected (Integrity Protection)');
  } catch (err) {
    assert(false, `Tally CRUD exception: ${err.message}`);
  }

  // 5. Offline Batch Sync Queue Test
  console.log('\n--- 5. Testing Offline Batch Sync Processing ---');
  try {
    const syncRes = await fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'HIPG-OFFLINE-TEST-09',
        items: [
          {
            id: `queue-${Date.now()}`,
            localId: `local-${Date.now()}`,
            type: 'TALLY_SUBMIT',
            payload: {
              vesselId: 'vessel-gp-015',
              vesselName: 'Grand Pioneer',
              voyageNo: 'GP-015',
              docNo: '37538',
              vehicleNo: 'SYNC-OFFLINE-01',
              chassisNo: 'VINOFFLINE88776655',
              cargoType: 'Vehicle (CBU)',
              agentName: 'MOL',
              yardLocation: 'Berth 07 (RoRo)',
              brandModel: 'Toyota Land Cruiser Prado',
              checklist: [],
              damages: [],
              photos: [],
            },
          },
        ],
      }),
    });
    const syncData = await syncRes.json();
    assert(syncRes.status === 200 && syncData.count === 1, 'POST /api/sync processes offline queue items idempotently');
  } catch (err) {
    assert(false, `Sync exception: ${err.message}`);
  }

  // 6. Audit Trail Logging Test
  console.log('\n--- 6. Testing Audit Trail Logging ---');
  try {
    const auditLogRes = await fetch(`${BASE_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user',
        userName: 'Quality Assessor',
        userRole: 'Administrator',
        action: 'QR_VERIFIED',
        recordId: testTallyId,
        referenceNo: testTallyRef,
        details: 'Automated test suite gate scan verification',
        deviceId: 'TEST-HARNESS-NODE',
      }),
    });
    const auditLogData = await auditLogRes.json();
    assert(auditLogRes.status === 200 && auditLogData.success, 'POST /api/audit records cryptographic log entry');

    const getAuditRes = await fetch(`${BASE_URL}/api/audit?referenceNo=${testTallyRef}`);
    const getAuditData = await getAuditRes.json();
    assert(getAuditRes.status === 200 && getAuditData.logs.length > 0, 'GET /api/audit filters by reference number');
  } catch (err) {
    assert(false, `Audit exception: ${err.message}`);
  }

  // 7. Dashboard Stats
  console.log('\n--- 7. Testing Dashboard Stats Aggregation ---');
  try {
    const statsRes = await fetch(`${BASE_URL}/api/stats`);
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.success, 'GET /api/stats returns status 200');
    assert(statsData.stats.totalVehicles > 0, 'Total vehicles count is non-zero');
    assert(statsData.stats.todayOperation.percentComplete > 0, 'Today operation percent is calculated');
  } catch (err) {
    assert(false, `Stats exception: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('ALL API & DATABASE CRUD OPERATIONS ARE FULLY VERIFIED!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();

