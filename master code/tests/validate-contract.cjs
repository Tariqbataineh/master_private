const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const SwaggerParser = require('@apidevtools/swagger-parser');
(async () => {
  const root = path.resolve(__dirname, '..'),
    spec = JSON.parse(fs.readFileSync(path.join(root, 'docs/openapi.json'))),
    manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/api-endpoints.json')));
  await SwaggerParser.validate(spec);
  const operations = Object.entries(spec.paths).flatMap(([route, verbs]) =>
    Object.entries(verbs)
      .filter(([method]) => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(([method, operation]) => ({ method: method.toUpperCase(), route, operation })),
  );
  assert.equal(operations.length, manifest.length);
  const seen = new Set();
  for (const item of manifest) {
    const key = item.method + ' ' + item.path;
    assert.ok(!seen.has(key), key);
    seen.add(key);
    const op = spec.paths[item.path]?.[item.method.toLowerCase()];
    assert.ok(op, key);
    assert.ok(item.roles && item.ownership && item.validation, key);
    assert.ok(op.responses, key);
    for (const schema of [item.requestDto, item.responseDto].filter((x) => x && x !== '204'))
      assert.ok(spec.components.schemas[schema], schema);
  }
  assert.equal(spec.paths['/bookings/{id}'].patch, undefined);
  assert.ok(spec.paths['/bookings/{id}/appointment'].patch);
  assert.ok(spec.paths['/plans'].get);
  assert.ok(spec.paths['/auth/antiforgery'].get);
  assert.ok(spec.components.schemas.PasswordResetRequest.anyOf);
  for (const route of ['/branches', '/organizations'])
    for (const method of ['post', 'put'])
      if (spec.paths[route]?.[method])
        assert.ok(!spec.paths[route][method]['x-roles'].includes('Public'));
  const report = {
    openapi: spec.openapi,
    paths: Object.keys(spec.paths).length,
    operations: operations.length,
    schemas: Object.keys(spec.components.schemas).length,
    valid: true,
    validator: '@apidevtools/swagger-parser',
    scope: 'Structural specification and manifest consistency, not real server execution',
  };
  fs.writeFileSync(
    path.join(root, 'docs/contract-validation-results.json'),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
