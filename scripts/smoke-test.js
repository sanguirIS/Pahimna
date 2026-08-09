/*
Pahimna - personal website and creative hub.
Copyright (C) 2026 DJKAM & DEVKLENN

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * Smoke test for the Pahimna site. Run via: npm test
 *
 * Checks:
 *  1. Every project-owned HTML/CSS/JS file carries the GPL-3.0 notice
 *     (with the HTML doctype kept on line 1, and balanced comments).
 *  2. Every project JS file parses (node --check).
 *  3. The static preview server serves key pages/assets with HTTP 200,
 *     the notice present, the doctype first, plus expected 404s and
 *     blocked path traversal.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { createServer } = require('./serve');

const ROOT = path.resolve(__dirname, '..');

const HTML_FILES = [
  'HOME.html', 'Klenn.html', 'info.html', 'waiting.html', 'terms&regulation.html',
  'hytemala/jcls.html', 'hytemala/pass.html', 'hytemala/pectol.html',
  'hytemala/Pinsan.html', 'hytemala/stibsis.html', 'hytemala/welder.html',
];
const JS_FILES = [
  'JavaScript/babagi.js', 'JavaScript/backtab.js', 'JavaScript/codis.js', 'JavaScript/port.js',
  'JavaScript/security.js', 'JavaScript/waiting.js',
  'hytemala/java/kalkol.js', 'hytemala/java/pswel.js', 'hytemala/java/wear.js',
  'src/index.js', 'src/functions/httpTrigger1.js', 'src/functions/weather.js',
  'scripts/serve.js', 'scripts/smoke-test.js',
];
const CSS_FILES = [
  'design/codi.css', 'design/Ohjie.css', 'design/port.css',
  'design/TRrules.css', 'design/waiting.css',
  'hytemala/cs/Cousin.css', 'hytemala/cs/jakel.css', 'hytemala/cs/jclsfamily.css',
  'hytemala/cs/pser.css', 'hytemala/cs/stibsisone.css', 'hytemala/cs/wed.css',
];

// Pages/assets served over HTTP, with the expected status code.
const HTTP_TARGETS = [
  { path: '/', status: 200 },
  { path: '/HOME.html', status: 200 },
  { path: '/Klenn.html', status: 200 },
  { path: '/info.html', status: 200 },
  { path: '/terms&regulation.html', status: 200 },
  { path: '/waiting.html', status: 200 },
  { path: '/hytemala/welder.html', status: 200 },
  { path: '/design/port.css', status: 200 },
  { path: '/JavaScript/codis.js', status: 200 },
  { path: '/does-not-exist.html', status: 404 },
  { path: '/../LICENSE', status: 403 }, // path traversal must be blocked
];

let failures = 0;

function check(label, cond) {
  if (cond) {
    console.log('  ok - ' + label);
  } else {
    console.error('  FAIL - ' + label);
    failures++;
  }
}

/**
 * Counts block comments in JS/CSS code while ignoring string literals,
 * template literals, and regex literals (which can contain the literal
 * comment-open and comment-close sequences without being comments).
 */
function blockCommentCount(code) {
  let opens = 0;
  let closes = 0;
  let i = 0;
  let prev = '';
  const n = code.length;
  const isWordish = (c) => /[\w)\]}]/.test(c);

  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];

    if (ch === '/' && next === '/') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      opens++;
      i += 2;
      while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
      if (i < n) {
        closes++;
        i += 2;
      }
      prev = ' ';
      continue;
    }
    if (ch === '"' || ch === "'") {
      const q = ch;
      i++;
      while (i < n) {
        if (code[i] === '\\') { i += 2; continue; }
        if (code[i] === q) { i++; break; }
        i++;
      }
      prev = 'x';
      continue;
    }
    if (ch === '`') {
      i++;
      while (i < n) {
        if (code[i] === '\\') { i += 2; continue; }
        if (code[i] === '`') { i++; break; }
        i++;
      }
      prev = 'x';
      continue;
    }
    if (ch === '/' && prev !== '' && !isWordish(prev)) {
      // regex literal
      i++;
      let inClass = false;
      while (i < n) {
        const c = code[i];
        if (c === '\\') { i += 2; continue; }
        if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if (c === '/' && !inClass) { i++; break; }
        else if (c === '\n') break;
        i++;
      }
      prev = 'x';
      continue;
    }
    if (!/\s/.test(ch)) prev = ch;
    i++;
  }
  return { opens, closes };
}

console.log('1) GPL notice headers and file structure');
for (const f of HTML_FILES) {
  const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
  check(f + ': doctype on line 1', /^<!DOCTYPE html>$/i.test(c.split(/\r?\n/)[0].trim()));
  const opens = (c.match(/<!--/g) || []).length;
  check(f + ': balanced HTML comments', opens === (c.match(/-->/g) || []).length);
  check(f + ': GPL notice before <html>', c.indexOf('GNU General Public License') < c.indexOf('<html'));
}
for (const f of CSS_FILES.concat(JS_FILES)) {
  const c = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const bc = blockCommentCount(c);
  check(f + ': balanced block comments', bc.opens === bc.closes && bc.opens > 0);
  check(f + ': starts with GPL notice', /^(?:\uFEFF)?\/\*/.test(c));
}

console.log('2) JS syntax (node --check)');
for (const f of JS_FILES) {
  const r = spawnSync(process.execPath, ['--check', path.join(ROOT, f)], {
    encoding: 'utf8',
  });
  check(f, r.status === 0);
}

console.log('3) HTTP smoke test');
const server = createServer(ROOT);
server.listen(0, () => {
  const port = server.address().port;
  let pending = HTTP_TARGETS.length;
  HTTP_TARGETS.forEach((t) => {
    http
      .get({ host: 'localhost', port, path: t.path }, (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          check(t.path + ' -> ' + res.statusCode + ' (expected ' + t.status + ')', res.statusCode === t.status);
          if (res.statusCode === 200) {
            check(t.path + ': GPL notice served', body.includes('GNU General Public License'));
            if (body.includes('<!DOCTYPE html>')) {
              check(t.path + ': doctype first', /^<!DOCTYPE html>/.test(body.trim()));
            }
          }
          if (--pending === 0) {
            server.close();
            finish();
          }
        });
      })
      .on('error', (e) => {
        check(t.path + ': request error ' + e.message, false);
        if (--pending === 0) {
          server.close();
          finish();
        }
      });
  });
});

function finish() {
  if (failures === 0) {
    console.log('\nAll smoke tests passed.');
    process.exit(0);
  }
  console.error('\n' + failures + ' check(s) failed.');
  process.exit(1);
}
