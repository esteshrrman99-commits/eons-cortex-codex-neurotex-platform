'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function request(url) {
  let handler;
  const source = fs.readFileSync(process.env.VAULT_ROUTER_SOURCE || path.join(__dirname, '../backend/vault-api/src/server.js'), 'utf8');
  const dependencies = {
    http: {createServer(fn) {handler = fn; return {listen() {}};}},
    crypto: require('node:crypto'), path,
    fs: {mkdirSync() {}, appendFileSync() {}},
    './services/encryption-service': {gate() {return {kind:'encryption'};}},
    './services/auth-service': {mockSession(role) {return {kind:'session', role};},gate() {return {kind:'auth'};}},
    './db/schema-service': {getSchema() {return {kind:'schema'};},getMigrationGate() {return {kind:'migration',production_gate:'BLOCKED'};}},
    './services/parser-service': {}, './services/reviewer-service': {}, './services/backup-service': {}
  };
  vm.runInNewContext(source, {
    require(name) {assert.ok(Object.hasOwn(dependencies,name), 'Unexpected dependency: '+name); return dependencies[name];},
    __dirname: '/isolated/mock-api', process: {env: {EONS_VAULT_PORT:'0'}}, console: {log() {}}
  }, {timeout: 1000});
  let status, body;
  handler({method:'GET',url}, {writeHead(code) {status=code;},end(value) {body=JSON.parse(value);}});
  return {status,body};
}

test('migration gate remains explicit and blocked', () => {
  assert.deepEqual(request('/migration-gate'), {status:200,body:{kind:'migration',production_gate:'BLOCKED'}});
});
test('unknown route returns 404', () => {assert.equal(request('/missing-route').status,404);});
test('session mock is reachable after migration gate', () => {
  const result=request('/session-mock?role=owner');assert.equal(result.status,200);assert.equal(result.body.kind,'session');assert.equal(result.body.role,'owner');
});
test('audit mock remains reachable after migration gate', () => {
  const result=request('/audit-demo');assert.equal(result.status,200);assert.equal(result.body.action,'audit-demo');assert.equal(result.body.external_action,false);
});
