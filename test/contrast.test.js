import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'node:http';
import crypto from 'node:crypto';

/**
 * Headless Chromium Real DOM Contrast Audit (WCAG 2.1 AA)
 * 
 * Verifies:
 * - Light and Dark themes
 * - All 5 tabs: #home, #emosi, #uang, #kita, #saya
 * - An open bottom sheet
 * - One lesson step
 * 
 * Fails under 4.5:1 for normal text or 3.0:1 for large text.
 */

class SimpleWebSocket {
  constructor(url) {
    this._url = new URL(url);
    this._listeners = {};
    this.onopen = null;
    this._connect();
  }

  addEventListener(type, fn) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(cb => cb !== fn);
  }

  emit(type, arg) {
    if (this._listeners[type]) {
      this._listeners[type].forEach(fn => fn(arg));
    }
  }

  _connect() {
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request({
      host: this._url.hostname,
      port: this._url.port,
      path: this._url.pathname,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Version': 13,
        'Sec-WebSocket-Key': key
      }
    });

    req.on('upgrade', (res, socket) => {
      this._socket = socket;
      socket.on('error', () => {});
      if (typeof this.onopen === 'function') this.onopen();

      let buffer = Buffer.alloc(0);
      socket.on('data', chunk => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.length >= 2) {
          const b0 = buffer[0];
          const b1 = buffer[1];
          const opcode = b0 & 0x0f;
          let payloadLen = b1 & 0x7f;
          let offset = 2;
          if (payloadLen === 126) {
            if (buffer.length < 4) break;
            payloadLen = buffer.readUInt16BE(2);
            offset = 4;
          } else if (payloadLen === 127) {
            if (buffer.length < 10) break;
            payloadLen = Number(buffer.readBigUInt64BE(2));
            offset = 10;
          }
          if (buffer.length < offset + payloadLen) break;
          const data = buffer.slice(offset, offset + payloadLen);
          buffer = buffer.slice(offset + payloadLen);
          if (opcode === 1) { // text
            this.emit('message', { data: data.toString('utf8') });
          }
        }
      });
    });

    req.on('error', (err) => {
      this.emit('error', err);
    });

    req.end();
  }

  send(str) {
    const data = Buffer.from(str, 'utf8');
    const mask = crypto.randomBytes(4);
    let header;
    if (data.length < 126) {
      header = Buffer.alloc(6);
      header[0] = 0x81;
      header[1] = 0x80 | data.length;
      mask.copy(header, 2);
    } else if (data.length < 65536) {
      header = Buffer.alloc(8);
      header[0] = 0x81;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(data.length, 2);
      mask.copy(header, 4);
    } else {
      header = Buffer.alloc(14);
      header[0] = 0x81;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(data.length), 2);
      mask.copy(header, 10);
    }
    const masked = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) {
      masked[i] = data[i] ^ mask[i % 4];
    }
    this._socket.write(Buffer.concat([header, masked]));
  }

  close() {
    if (this._socket) {
      try {
        this._socket.removeAllListeners();
        this._socket.on('error', () => {});
        this._socket.destroy();
      } catch (e) {}
    }
  }
}

const WSClient = typeof globalThis.WebSocket === 'function' ? globalThis.WebSocket : SimpleWebSocket;

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];

function findChromePath() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

describe('Headless Chromium Contrast Audit (WCAG 2.1 AA)', { timeout: 60000 }, () => {
  const chromePath = findChromePath();
  if (!chromePath) {
    it('skipped: Chrome executable not found on this system', () => {
      assert.ok(true);
    });
    return;
  }

  const debugPort = 9444;
  let chromeProc = null;
  let serverProc = null;
  let mainWs = null;

  before(async () => {
    // 1. Ensure static server is running on port 3000
    let serverReady = false;
    try {
      const res = await fetch('http://127.0.0.1:3000/');
      if (res.ok) serverReady = true;
    } catch (e) {}

    if (!serverReady) {
      serverProc = spawn('node', ['serve.js'], { stdio: 'ignore' });
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 150));
        try {
          const res = await fetch('http://127.0.0.1:3000/');
          if (res.ok) {
            serverReady = true;
            break;
          }
        } catch (e) {}
      }
    }

    // 2. Launch headless Chrome
    const userData = path.join(process.env.TEMP || '.', 'chrome_contrast_' + Math.random().toString(36).slice(2));
    chromeProc = spawn(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userData}`,
      'about:blank'
    ]);

    let wsEndpoint = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const res = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
        const data = await res.json();
        wsEndpoint = data.webSocketDebuggerUrl;
        if (wsEndpoint) break;
      } catch (e) {}
    }

    if (!wsEndpoint) {
      throw new Error('Failed to connect to headless Chrome DevTools endpoint');
    }

    mainWs = new WSClient(wsEndpoint);
    await new Promise(r => mainWs.onopen = r);
  });

  after(async () => {
    if (mainWs) {
      try { mainWs.close(); } catch (e) {}
    }
    if (chromeProc) {
      try { chromeProc.kill(); } catch (e) {}
    }
    if (serverProc) {
      try { serverProc.kill(); } catch (e) {}
    }
  });

  // CDP helper
  function createPageSession() {
    let id = 1;
    return new Promise(async (resolve) => {
      const sendMain = (method, params = {}) => new Promise((res) => {
        const reqId = id++;
        const handler = (msg) => {
          const parsed = JSON.parse(typeof msg.data === 'string' ? msg.data : msg.toString());
          if (parsed.id === reqId) {
            mainWs.removeEventListener('message', handler);
            res(parsed.result);
          }
        };
        mainWs.addEventListener('message', handler);
        mainWs.send(JSON.stringify({ id: reqId, method, params }));
      });

      const target = await sendMain('Target.createTarget', { url: 'about:blank' });
      const tabWs = new WSClient(`ws://127.0.0.1:${debugPort}/devtools/page/${target.targetId}`);
      await new Promise(r => tabWs.onopen = r);

      const send = (method, params = {}) => new Promise((res, rej) => {
        const reqId = id++;
        const handler = (msg) => {
          const parsed = JSON.parse(typeof msg.data === 'string' ? msg.data : msg.toString());
          if (parsed.id === reqId) {
            tabWs.removeEventListener('message', handler);
            if (parsed.error) rej(parsed.error);
            else res(parsed.result);
          }
        };
        tabWs.addEventListener('message', handler);
        tabWs.send(JSON.stringify({ id: reqId, method, params }));
      });

      resolve({
        send,
        close: async () => {
          tabWs.close();
          try {
            await sendMain('Target.closeTarget', { targetId: target.targetId });
          } catch (e) {}
        }
      });
    });
  }

  // The client-side contrast audit evaluation script
  const auditClientScript = `(() => {
    function parseRgba(colorStr) {
      if (!colorStr || colorStr === 'transparent') return [0, 0, 0, 0];
      const match = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
      if (match) {
        return [
          Number(match[1]),
          Number(match[2]),
          Number(match[3]),
          match[4] !== undefined ? Number(match[4]) : 1
        ];
      }
      return [0, 0, 0, 1];
    }

    function sRGBtoLinear(c) {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }

    function relativeLuminance(r, g, b) {
      return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
    }

    function contrastRatio(rgb1, rgb2) {
      const l1 = relativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
      const l2 = relativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function blendOver(topRgba, botRgb) {
      const [r1, g1, b1, a1] = topRgba;
      const [r2, g2, b2] = botRgb;
      const r = Math.round(r1 * a1 + r2 * (1 - a1));
      const g = Math.round(g1 * a1 + g2 * (1 - a1));
      const b = Math.round(b1 * a1 + b2 * (1 - a1));
      return [r, g, b];
    }

    const isDark = document.body.classList.contains('theme-dark') || document.documentElement.classList.contains('theme-dark');
    const defaultCanvas = isDark ? [14, 21, 20] : [244, 246, 245];

    function getEffectiveBg(el) {
      let current = el;
      const layers = [];
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(current);
        const bg = parseRgba(style.backgroundColor);
        if (bg[3] > 0) {
          layers.push(bg);
          if (bg[3] >= 0.99) break;
        }
        current = current.parentElement;
      }

      let res = defaultCanvas;
      for (let i = layers.length - 1; i >= 0; i--) {
        res = blendOver(layers[i], res);
      }
      return res;
    }

    const failures = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;

    while (node = walker.nextNode()) {
      const text = node.nodeValue.trim();
      if (!text || text.length < 2) continue;

      const el = node.parentElement;
      if (!el) continue;

      // Skip script, style, noscript, hidden elements, skip-link
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
      if (el.closest('.skip-link')) continue;

      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const fgRgba = parseRgba(style.color);
      if (fgRgba[3] === 0) continue; // transparent text

      const bgRgb = getEffectiveBg(el);
      const fgRgb = fgRgba[3] < 1 ? blendOver(fgRgba, bgRgb) : [fgRgba[0], fgRgba[1], fgRgba[2]];

      const ratio = contrastRatio(fgRgb, bgRgb);
      const fontSize = parseFloat(style.fontSize) || 16;
      const fontWeight = style.fontWeight;
      const isBold = fontWeight === 'bold' || parseInt(fontWeight, 10) >= 600;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
      const threshold = isLarge ? 3.0 : 4.5;

      if (ratio < threshold) {
        failures.push({
          text: text.slice(0, 30),
          tag: el.tagName,
          className: el.className,
          fontSize,
          fontWeight,
          isLarge,
          ratio: Number(ratio.toFixed(2)),
          threshold,
          fg: 'rgb(' + fgRgb.join(',') + ')',
          bg: 'rgb(' + bgRgb.join(',') + ')'
        });
      }
    }

    return failures;
  })()`;

  for (const theme of ['light', 'dark']) {
    describe(`${theme.toUpperCase()} Theme Contrast Verification`, () => {
      it(`passes WCAG 2.1 AA across all 5 tabs in ${theme} mode`, async () => {
        const session = await createPageSession();
        const { send, close } = session;

        try {
          await send('Page.enable');
          await send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 780,
            deviceScaleFactor: 2,
            mobile: true
          });

          await send('Page.navigate', { url: `http://127.0.0.1:3000/?theme=${theme}#home` });
          await new Promise(r => setTimeout(r, 600));

          const tabs = ['home', 'emosi', 'uang', 'kita', 'saya'];
          for (const tab of tabs) {
            await send('Runtime.evaluate', {
              expression: `(() => {
                if (window.TemanSiap && window.TemanSiap.navigate) {
                  window.TemanSiap.navigate('${tab}');
                } else {
                  location.hash = '#${tab}';
                }
              })()`
            });
            await new Promise(r => setTimeout(r, 350));

            const result = await send('Runtime.evaluate', {
              expression: auditClientScript,
              returnByValue: true
            });

            const failures = result.result?.value || [];
            if (failures.length > 0) {
              const details = failures.map(f =>
                `"${f.text}" (${f.tag}.${f.className}): ratio ${f.ratio}:1 < required ${f.threshold}:1 [fg: ${f.fg}, bg: ${f.bg}]`
              ).join('\n  ');
              assert.fail(`Contrast violations on tab "${tab}" in ${theme} theme:\n  ${details}`);
            }
          }
        } finally {
          await close();
        }
      });

      it(`passes WCAG 2.1 AA inside open bottom sheet in ${theme} mode`, async () => {
        const session = await createPageSession();
        const { send, close } = session;

        try {
          await send('Page.enable');
          await send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 780,
            deviceScaleFactor: 2,
            mobile: true
          });

          await send('Page.navigate', { url: `http://127.0.0.1:3000/?theme=${theme}#uang` });
          await new Promise(r => setTimeout(r, 600));

          // Open topup / Pelajari bottom sheet
          await send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.querySelector('#hubGoalRow') || document.querySelector('#openQuickLogBtn');
              if (btn) btn.click();
            })()`
          });
          await new Promise(r => setTimeout(r, 400));

          const result = await send('Runtime.evaluate', {
            expression: auditClientScript,
            returnByValue: true
          });

          const failures = result.result?.value || [];
          if (failures.length > 0) {
            const details = failures.map(f =>
              `"${f.text}" (${f.tag}.${f.className}): ratio ${f.ratio}:1 < required ${f.threshold}:1 [fg: ${f.fg}, bg: ${f.bg}]`
            ).join('\n  ');
            assert.fail(`Contrast violations in bottom sheet (${theme} theme):\n  ${details}`);
          }
        } finally {
          await close();
        }
      });

      it(`passes WCAG 2.1 AA inside a lesson step in ${theme} mode`, async () => {
        const session = await createPageSession();
        const { send, close } = session;

        try {
          await send('Page.enable');
          await send('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 780,
            deviceScaleFactor: 2,
            mobile: true
          });

          await send('Page.navigate', { url: `http://127.0.0.1:3000/?theme=${theme}#home` });
          await new Promise(r => setTimeout(r, 600));

          // Start first lesson or hero action
          await send('Runtime.evaluate', {
            expression: `(() => {
              const heroBtn = document.querySelector('#heroActionBtn') || document.querySelector('.path-node.tersedia');
              if (heroBtn) heroBtn.click();
            })()`
          });
          await new Promise(r => setTimeout(r, 450));

          const result = await send('Runtime.evaluate', {
            expression: auditClientScript,
            returnByValue: true
          });

          const failures = result.result?.value || [];
          if (failures.length > 0) {
            const details = failures.map(f =>
              `"${f.text}" (${f.tag}.${f.className}): ratio ${f.ratio}:1 < required ${f.threshold}:1 [fg: ${f.fg}, bg: ${f.bg}]`
            ).join('\n  ');
            assert.fail(`Contrast violations in lesson step (${theme} theme):\n  ${details}`);
          }
        } finally {
          await close();
        }
      });
    });
  }
});
