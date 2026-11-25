/* Rehobot — landing. Lógica en JavaScript puro (sin frameworks), portada del diseño de Claude Design. */
'use strict';
class Landing {
  // Ajustes de efectos (en el diseño eran controles del editor)
  props = { auroraIntensity: 1, panelLive: true, showCursor: true };
  state = { menu: false, faq: -1, sol: 0, solAuto: true, solHover: false, solVis: false };
  offs = []; hidden = false;

  setState(u) { Object.assign(this.state, typeof u === 'function' ? u(this.state) : u); this.render(); }

  render() {
    const s = this.state, $ = id => document.getElementById(id);
    // menú móvil
    const mb = $('menu-btn'), mn = $('mnav');
    mb.setAttribute('aria-expanded', String(s.menu));
    mb.setAttribute('aria-label', s.menu ? 'Cerrar menú' : 'Abrir menú');
    mb.querySelector('.ic-open').style.display = s.menu ? 'none' : '';
    mb.querySelector('.ic-close').style.display = s.menu ? '' : 'none';
    mn.hidden = !s.menu;
    // soluciones
    const st = $('stabs');
    st.dataset.run = s.solAuto && !s.solHover && s.solVis ? '1' : '0';
    st.dataset.auto = s.solAuto ? '1' : '0';
    for (let i = 0; i < 4; i++) {
      const on = s.sol === i, v = on ? '1' : '0', t = $('stab' + i);
      if (t.dataset.on !== v) { t.dataset.on = v; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; }
      const p = $('spn' + i); if (p.dataset.on !== v) p.dataset.on = v;
    }
    document.querySelectorAll('.sdot').forEach((el, i) => { const v = s.sol === i ? '1' : '0'; if (el.dataset.on !== v) el.dataset.on = v; });
    // preguntas frecuentes
    document.querySelectorAll('.faq-q').forEach((q, i) => {
      const o = s.faq === i;
      q.setAttribute('aria-expanded', String(o));
      q.querySelector('svg').style.transform = 'rotate(' + (o ? '45deg' : '0deg') + ')';
      document.getElementById('fa' + i).style.gridTemplateRows = o ? '1fr' : '0fr';
    });
  }

  bind() {
    const $ = id => document.getElementById(id);
    $('menu-btn').addEventListener('click', () => this.setState(x => ({ menu: !x.menu })));
    document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => this.setState({ menu: false })));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.state.menu) { this.setState({ menu: false }); $('menu-btn').focus(); } });
    matchMedia('(min-width:900px)').addEventListener('change', e => { if (e.matches && this.state.menu) this.setState({ menu: false }); });
    document.querySelectorAll('.stab').forEach(b => {
      b.addEventListener('click', () => this.pickSol(+b.dataset.i, true));
      b.addEventListener('keydown', this.solKey);
    });
    document.querySelectorAll('.sdot').forEach(b => b.addEventListener('click', () => this.pickSol(+b.dataset.i, true)));
    $('stabs').addEventListener('animationend', this.progEnd);
    const g = $('sol-grid');
    g.addEventListener('mouseenter', () => this.setState({ solHover: true }));
    g.addEventListener('mouseleave', () => this.setState({ solHover: false }));
    document.querySelectorAll('.faq-q').forEach((q, i) => q.addEventListener('click', () => this.setState(x => ({ faq: x.faq === i ? -1 : i }))));
  }

  start() { this.bind(); this.render(); requestAnimationFrame(() => this.init()); }

  progEnd = e => { if (e.animationName !== 'prog') return; this.setState(x => ({ sol: (x.sol + 1) % 4 })); };
  solKey = e => {
    const k = e.key, a = this.state.sol; let n = null;
    if (k === 'ArrowDown' || k === 'ArrowRight') n = (a + 1) % 4; else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (a + 3) % 4; else if (k === 'Home') n = 0; else if (k === 'End') n = 3;
    if (n === null) return; e.preventDefault(); this.pickSol(n, true);
    requestAnimationFrame(() => { const b = document.getElementById('stab' + n); if (b) b.focus(); });
  };
  pickSol(i, user) {
    this.setState(x => ({ sol: i, solAuto: user ? false : x.solAuto }));
    if (innerWidth < 1024) {
      const sp = document.getElementById('sol-panels'), el = sp && sp.querySelectorAll('.sp')[i];
      if (el) { this._solLock = Date.now(); sp.scrollTo({ left: el.offsetLeft - (sp.clientWidth - el.offsetWidth) / 2, behavior: this.rm ? 'auto' : 'smooth' }); }
    }
  }
  initSol() {
    const sec = this.$('soluciones'), sp = this.$('sol-panels'); if (!sec || !sp) return;
    if (this.rm) this.setState({ solAuto: false });
    this.io(([e]) => this.setState({ solVis: e.isIntersecting }), { threshold: 0.25 }).observe(sec);
    let t = false;
    this.on(sp, 'scroll', () => {
      if (t || innerWidth >= 1024) return; t = true;
      requestAnimationFrame(() => {
        t = false; if (Date.now() - (this._solLock || 0) < 700) return;
        const mid = sp.scrollLeft + sp.clientWidth / 2; let best = 0, bd = 1e9;
        sp.querySelectorAll('.sp').forEach((el, i) => { const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
        if (best !== this.state.sol) this.setState({ sol: best, solAuto: false });
      });
    }, { passive: true });
  }


  on(t, ev, fn, o) { t.addEventListener(ev, fn, o); this.offs.push(() => t.removeEventListener(ev, fn, o)); }
  io(fn, opts) { const o = new IntersectionObserver(fn, opts); this.offs.push(() => o.disconnect()); return o; }

  init() {
    if (this.dead) return;
    this.$ = id => document.getElementById(id);
    this.rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.touch = matchMedia('(hover: none), (pointer: coarse)').matches;
    this.mob = innerWidth < 768;
    if (!(window.CSS && CSS.registerProperty)) document.querySelectorAll('.gc').forEach(e => e.classList.add('gc-fb'));
    this.on(document, 'visibilitychange', () => { this.hidden = document.hidden; });
    [this.initSol, this.initScroll, this.initReveal, this.initSteps, this.initAurora, this.initPanel, this.initManifesto, this.initCircuits, this.initGlowTouch, this.initCursor]
      .forEach(f => { try { f.call(this); } catch (e) { console.warn(e); } });
  }

  initScroll() {
    const $ = this.$, hdr = $('hdr'), fab = $('fab'), panel = $('panel'), hero = $('hero'), wm = $('wm'), how = $('como-trabajo'), steps = $('steps');
    let tick = false;
    const upd = () => {
      tick = false; const y = scrollY, vh = innerHeight;
      hdr.style.height = y > 40 ? '60px' : '72px';
      const past = y > hero.offsetHeight - vh * 0.4;
      fab.style.opacity = past ? '1' : '0'; fab.style.transform = past ? 'scale(1)' : 'scale(.8)'; fab.style.pointerEvents = past ? 'auto' : 'none';
      if (this.rm) { panel.style.transform = 'none'; }
      else {
        const p = Math.min(1, Math.max(0, y / (vh * 0.4)));
        panel.style.transform = 'rotateX(' + (18 * (1 - p)).toFixed(2) + 'deg)';
        if (wm && how) { const r = how.getBoundingClientRect(); wm.style.transform = 'translate(-50%,' + (-r.top * 0.18).toFixed(1) + 'px)'; }
      }
      if (steps) { const r = steps.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.2))); steps.style.setProperty('--p', p.toFixed(3)); }
    };
    this.on(window, 'scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    this.on(window, 'resize', upd); upd();
  }

  initReveal() {
    if (this.rm) return;
    const els = [...document.querySelectorAll('[data-reveal]')];
    const ease = 'cubic-bezier(.22,1,.36,1)';
    const ob = this.io(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, d = +(el.dataset.reveal || 0);
      el.style.transition = 'opacity .9s ' + ease + ' ' + d + 'ms, transform .9s ' + ease + ' ' + d + 'ms';
      el.style.opacity = '1'; el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; el.style.willChange = ''; }, 1000 + d);
      ob.unobserve(el);
    }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
      el.style.opacity = '0'; el.style.transform = 'translateY(40px)'; el.style.willChange = 'opacity, transform';
      ob.observe(el);
    });
  }

  initSteps() {
    const arrows = [...document.querySelectorAll('.stp-arrow')];
    if (this.rm) { arrows.forEach(a => a.style.strokeDashoffset = '0'); return; }
    const ob = this.io(es => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => { e.target.style.strokeDashoffset = '0'; }, 200); ob.unobserve(e.target); } }), { threshold: 1 });
    arrows.forEach(a => ob.observe(a));
  }

  initAurora() {
    const c = this.$('aurora'), fb = this.$('aurora-fb'), hero = this.$('hero');
    const fallback = () => { c.style.display = 'none'; fb.style.display = 'block'; };
    if (this.rm) return fallback();
    const gl = c.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) return fallback();
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;float as=r.x/r.y;vec2 p=vec2(uv.x*as,uv.y)*2.4;vec2 mp=vec2(m.x*as,m.y);float tt=t*.08;
vec2 q=vec2(fbm(p+vec2(tt,-tt*.6)+(mp-.5)*.7),fbm(p+vec2(-tt*.8,tt*.4)+3.1));
float f=fbm(p+q*1.8+vec2(0.,tt*.5));
float band=smoothstep(.32,.85,f)*(.25+.75*smoothstep(.15,.9,uv.y));
float d=distance(vec2(uv.x*as,uv.y),mp);float g=exp(-d*d/.09);
vec3 c=mix(vec3(.07,.40,.31),vec3(.21,.78,.71),smoothstep(.35,.62,f));
c=mix(c,vec3(.13,.96,.74),smoothstep(.58,.8,f+g*.18)*.75);
c=mix(c,vec3(.89,1.,0.),smoothstep(.82,.95,f)*.12);
float a=clamp(band*(.7+g*1.1),0.,1.)*k;
gl_FragColor=vec4(c*a,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    let pr;
    try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr); }
    catch (e) { console.warn(e); return fallback(); }
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = { r: gl.getUniformLocation(pr, 'r'), t: gl.getUniformLocation(pr, 't'), m: gl.getUniformLocation(pr, 'm'), k: gl.getUniformLocation(pr, 'k') };
    const size = () => { const s = Math.min(devicePixelRatio || 1, 2) * 0.5; c.width = Math.max(1, c.clientWidth * s | 0); c.height = Math.max(1, c.clientHeight * s | 0); gl.viewport(0, 0, c.width, c.height); };
    size(); this.on(window, 'resize', size);
    let mx = 0.5, my = 0.8, tx = 0.5, ty = 0.8, vis = true, running = false;
    this.on(hero, 'pointermove', e => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; });
    const t0 = performance.now();
    const frame = () => {
      if (this.dead || !vis) { running = false; return; }
      requestAnimationFrame(frame);
      if (this.hidden) return;
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      gl.uniform2f(U.r, c.width, c.height); gl.uniform1f(U.t, (performance.now() - t0) / 1000); gl.uniform2f(U.m, mx, my);
      gl.uniform1f(U.k, this.props.auroraIntensity ?? 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    this.io(([e]) => { vis = e.isIntersecting; if (vis && !running) { running = true; requestAnimationFrame(frame); } }).observe(hero);
  }

  initPanel() {
    const $ = this.$, P = $('panel'); if (!P) return;
    const K = { msg: $('k-msg'), rt: $('k-rt'), turn: $('k-turn'), fh: $('k-fh') };
    const V = { msg: 146, turn: 23, fh: 41, rt: 8 };
    const line = $('ch-line'), area = $('ch-area'); $('ch-svg').setAttribute('preserveAspectRatio', 'none');
    const W = 600, H = 160, N = 60, rnd = (a, b) => a + Math.random() * (b - a);
    let pts = [], y = 90; for (let i = 0; i <= N; i++) { y = Math.min(140, Math.max(25, y + rnd(-14, 14))); pts.push(y); }
    const draw = off => {
      const st = W / (N - 1); let d = '';
      for (let i = 0; i < pts.length; i++) {
        const x = (i - off) * st;
        if (!i) d = 'M' + x.toFixed(1) + ' ' + pts[0].toFixed(1);
        else { const px = (i - 1 - off) * st, mxp = (px + x) / 2; d += 'C' + mxp.toFixed(1) + ' ' + pts[i - 1].toFixed(1) + ' ' + mxp.toFixed(1) + ' ' + pts[i].toFixed(1) + ' ' + x.toFixed(1) + ' ' + pts[i].toFixed(1); }
      }
      line.setAttribute('d', d);
      area.setAttribute('d', d + 'L' + ((pts.length - 1 - off) * st).toFixed(1) + ' ' + H + 'L' + (-off * st).toFixed(1) + ' ' + H + 'Z');
    };
    const bars = [0, 1, 2, 3].map(i => ({ f: $('b' + i), t: $('bv' + i), v: [62, 48, 31, 79][i], lock: false }));
    const col = v => (v < 40 ? '#126650' : v <= 75 ? '#35C8B4' : '#E3FF00');
    const setBar = (b, v) => { b.v = v; b.f.style.width = v + '%'; b.f.style.background = col(v); b.f.style.boxShadow = v > 75 ? '0 0 12px rgba(227,255,0,.45)' : 'none'; b.t.textContent = Math.round(v) + '%'; };
    draw(0);
    const live = !this.rm && this.props.panelLive !== false;
    if (!live) return;

    const sc = $('sparks'), sx = sc.getContext('2d'); let parts = [], sparkRun = false;
    const sparkFrame = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), w = sc.clientWidth, h = sc.clientHeight;
      if (sc.width !== (w * dpr | 0)) { sc.width = w * dpr | 0; sc.height = h * dpr | 0; }
      sx.setTransform(dpr, 0, 0, dpr, 0, 0); sx.clearRect(0, 0, w, h);
      const now = performance.now(); parts = parts.filter(p => now - p.b < 600);
      parts.forEach(p => { p.vy += 0.12; p.x += p.vx; p.y += p.vy; sx.globalAlpha = 1 - (now - p.b) / 600; sx.fillStyle = p.c; sx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); });
      sx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(sparkFrame); else sparkRun = false;
    };
    const burst = b => {
      const r = b.f.getBoundingClientRect(), cr = sc.getBoundingClientRect();
      const x = r.right - cr.left, yy = r.top - cr.top + r.height / 2, n = 12 + (Math.random() * 5 | 0), now = performance.now();
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = rnd(1.2, 3.6); parts.push({ x, y: yy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, b: now, c: i % 2 ? '#E3FF00' : '#21F4BD' }); }
      if (!sparkRun) { sparkRun = true; requestAnimationFrame(sparkFrame); }
    };

    let on = false, started = false, chartRun = false, off = 0, last = performance.now();
    const chartFrame = now => {
      if (this.dead || !on) { chartRun = false; return; }
      requestAnimationFrame(chartFrame);
      if (this.hidden) { last = now; return; }
      off += (now - last) / 800; last = now;
      while (off >= 1) { off -= 1; pts.shift(); const lp = pts[pts.length - 1]; pts.push(Math.min(140, Math.max(25, lp + rnd(-16, 16)))); }
      draw(off);
    };
    const bump = (el, txt) => {
      el.textContent = txt;
      el.animate([{ transform: 'scale(1)', color: '#F3F7F4', textShadow: '0 0 0 transparent' }, { transform: 'scale(1.08)', color: '#21F4BD', textShadow: '0 0 14px rgba(33,244,189,.8)' }, { transform: 'scale(1)', color: '#F3F7F4', textShadow: '0 0 0 transparent' }], { duration: 300, easing: 'ease-out' });
    };
    const every = (fn, a, b) => { const go = () => setTimeout(() => { if (this.dead) return; if (on && !this.hidden) fn(); go(); }, rnd(a, b)); go(); };
    const countUp = () => {
      const t0 = performance.now(), keys = ['msg', 'turn', 'fh'];
      const st = now => { const k = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - k, 3); keys.forEach(x => K[x].textContent = Math.round(V[x] * e)); if (k < 1) requestAnimationFrame(st); };
      requestAnimationFrame(st);
    };
    const start = () => {
      countUp();
      every(() => { V.msg++; bump(K.msg, V.msg); }, 1200, 3000);
      every(() => { V.turn++; bump(K.turn, V.turn); }, 4000, 7000);
      every(() => { V.fh++; bump(K.fh, V.fh); }, 5000, 9000);
      every(() => { V.rt = Math.min(11, Math.max(6, V.rt + (Math.random() < 0.5 ? -1 : 1))); K.rt.textContent = V.rt + ' s'; }, 1800, 2600);
      every(() => bars.forEach(b => {
        if (b.lock) return;
        const v = Math.random() < 0.12 ? 100 : Math.round(Math.min(96, Math.max(10, b.v + rnd(-28, 30))));
        setBar(b, v);
        if (v === 100) { b.lock = true; setTimeout(() => { burst(b); setTimeout(() => { setBar(b, Math.round(rnd(20, 60))); b.lock = false; }, 250); }, 620); }
      }), 2000, 2000);
    };
    this.io(([e]) => {
      on = e.isIntersecting;
      if (on && !started) { started = true; start(); }
      if (on && !chartRun) { chartRun = true; last = performance.now(); requestAnimationFrame(chartFrame); }
    }).observe(P);
  }

  initManifesto() {
    const $ = this.$, sec = $('manif'), c = $('manif-c'), h = $('manif-t');
    if (this.rm) {
      h.style.opacity = '0';
      const ob = this.io(([e]) => { if (e.isIntersecting) { h.style.transition = 'opacity 1s'; h.style.opacity = '1'; ob.disconnect(); } }, { threshold: 0.3 });
      ob.observe(sec); return;
    }
    h.style.opacity = '0';
    let done = false;
    const ob = this.io(es => { const e = es[0]; if (!done && e.isIntersecting && e.intersectionRatio >= 0.4) { done = true; ob.disconnect(); this.runManifesto(sec, c, h).catch(err => { console.warn(err); h.style.opacity = '1'; }); } }, { threshold: [0, 0.4, 0.6] });
    ob.observe(sec);
  }

  async runManifesto(sec, c, h) {
    try { await Promise.all([document.fonts.load("800 80px 'Inter Tight'"), document.fonts.load("italic 400 80px 'Instrument Serif'")]); } catch (e) {}
    const sr = sec.getBoundingClientRect(), W = sr.width | 0, H = sr.height | 0, dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = W * dpr; c.height = H * dpr; const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d', { willReadFrequently: true });
    const gap = this.mob ? 6 : 4, max = this.mob ? 1200 : 3500;
    const letters = []; const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let node, li = 0;
    while ((node = tw.nextNode())) {
      const el = node.parentElement, cs = getComputedStyle(el), menta = el.tagName === 'EM';
      o.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      for (let i = 0; i < node.length; i++) {
        const ch = node.data[i]; if (/\s/.test(ch)) continue;
        const rg = document.createRange(); rg.setStart(node, i); rg.setEnd(node, i + 1); const r = rg.getBoundingClientRect();
        const m = o.measureText(ch), asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.92;
        o.clearRect(0, 0, W, H); o.fillStyle = '#fff'; o.fillText(ch, r.left - sr.left, r.top - sr.top + asc);
        const bx = Math.max(0, Math.floor(r.left - sr.left - 16)), by = Math.max(0, Math.floor(r.top - sr.top - 8));
        const bw = Math.max(1, Math.min(W - bx, Math.ceil(r.width + 32))), bh = Math.max(1, Math.min(H - by, Math.ceil(r.height + 16)));
        const d = o.getImageData(bx, by, bw, bh).data, pts = [];
        for (let yy = 0; yy < bh; yy += gap) for (let xx = 0; xx < bw; xx += gap) if (d[(yy * bw + xx) * 4 + 3] > 120) pts.push([bx + xx, by + yy]);
        letters.push({ pts, menta, idx: li++ });
      }
    }
    const total = letters.reduce((s, l) => s + l.pts.length, 0), keep = Math.min(1, max / Math.max(1, total));
    const P = [];
    letters.forEach(L => L.pts.forEach(([tx, ty]) => {
      if (Math.random() > keep) return;
      const left = tx < W / 2, sx = left ? -20 - Math.random() * 240 : W + 20 + Math.random() * 240, sy = Math.random() * H;
      P.push({ tx, ty, sx, sy, cx: (sx + tx) / 2 + (Math.random() - 0.5) * 260, cy: (sy + ty) / 2 + (Math.random() - 0.5) * H * 0.8, d: L.idx * 60 + Math.random() * 80, m: L.menta });
    }));
    const endT = li * 60 + 80 + 900, t0 = performance.now();
    await new Promise(res => {
      const fr = now => {
        if (this.dead) return res();
        const t = now - t0; ctx.clearRect(0, 0, W, H);
        for (const pass of [false, true]) {
          ctx.fillStyle = pass ? '#35C8B4' : '#F3F7F4';
          for (const p of P) {
            if (p.m !== pass) continue;
            const k = (t - p.d) / 900; if (k <= 0) continue;
            const e = k >= 1 ? 1 : 1 - Math.pow(2, -10 * k), u = 1 - e;
            ctx.fillRect(u * u * p.sx + 2 * u * e * p.cx + e * e * p.tx, u * u * p.sy + 2 * u * e * p.cy + e * e * p.ty, 2, 2);
          }
        }
        if (t < endT) requestAnimationFrame(fr); else res();
      };
      requestAnimationFrame(fr);
    });
    c.style.transition = 'opacity .4s'; c.style.opacity = '0';
    h.style.transition = 'opacity .4s, text-shadow 1.5s ease-out'; h.style.opacity = '1'; h.style.textShadow = '0 0 28px rgba(33,244,189,.75)';
    setTimeout(() => { h.style.textShadow = '0 0 0 rgba(33,244,189,0)'; }, 420);
  }

  initCircuits() {
    if (this.rm) return;
    const $ = this.$;
    this.circuit($('cta-hero'), $('circ-hero'), $('hero'), $('hero-grid'));
    this.circuit($('cta-final'), $('circ-final'), $('cierre'), null);
  }

  circuit(btn, svg, sec, grid) {
    if (!btn || !svg || !sec) return;
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
    const D = [[1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071], [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071]];
    let st = null, dying = [];
    const activate = () => {
      dying.forEach(s => { clearTimeout(s.kill); s.root.remove(); }); dying = [];
      if (st) return;
      const sr = sec.getBoundingClientRect(), br = btn.getBoundingClientRect(), W = sr.width, H = sr.height;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      const cx = br.left - sr.left + br.width / 2, cy = br.top - sr.top + br.height / 2;
      const root = mk('g', {}), gt = mk('g', {}), gp = mk('g', {}), gn = mk('g', {});
      gp.style.filter = 'drop-shadow(0 0 6px #21F4BD)';
      root.append(gt, gp, gn); svg.appendChild(root);
      const paths = [], pulses = [], nodes = [];
      const N = this.mob ? 14 : 30;
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.25, w = [Math.cos(a), Math.sin(a)];
        let x = cx + w[0] * (br.width / 2 + 10), y = cy + w[1] * (br.height / 2 + 10);
        let di = 0, best = -9; for (let i = 0; i < 8; i += 2) { const dt = D[i][0] * w[0] + D[i][1] * w[1]; if (dt > best) { best = dt; di = i; } }
        const pts = [[x, y]], nd = [];
        for (let s = 0; s < 40; s++) {
          const len = 30 + Math.random() * 120; x += D[di][0] * len; y += D[di][1] * len; pts.push([x, y]);
          if (x < -10 || x > W + 10 || y < -10 || y > H + 10) break;
          if (Math.random() < 0.4) nd.push(pts.length - 1);
          const opts = [-1, 0, 1, 0].map(o => (di + o + 8) % 8).filter(i => D[i][0] * w[0] + D[i][1] * w[1] > 0.3);
          if (opts.length) di = opts[Math.random() * opts.length | 0];
        }
        const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
        const p = mk('path', { d, fill: 'none', stroke: '#35C8B4', 'stroke-opacity': '0.6', 'stroke-width': (1 + Math.random() * 0.5).toFixed(2), 'stroke-linejoin': 'round' });
        gt.appendChild(p);
        const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        const delay = Math.random() * 300;
        p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1200, delay, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
        paths.push([p, L]);
        const q = mk('path', { d, fill: 'none', stroke: '#21F4BD', 'stroke-width': '2', 'stroke-linecap': 'round' });
        q.style.strokeDasharray = '24 ' + (L + 24); q.style.strokeDashoffset = '24'; gp.appendChild(q);
        pulses.push(q.animate([{ strokeDashoffset: 24 }, { strokeDashoffset: -L }], { duration: L / 0.32, delay: 1500 + Math.random() * 2500, iterations: Infinity }));
        let acc = 0; const segAcc = [0]; for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segAcc.push(acc); }
        nd.concat([pts.length - 1]).forEach(pi => {
          if (!pts[pi]) return;
          const c = mk('circle', { cx: pts[pi][0].toFixed(1), cy: pts[pi][1].toFixed(1), r: (1.5 + Math.random()).toFixed(2), fill: '#35C8B4' });
          c.style.opacity = '0'; c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; gn.appendChild(c);
          const at = delay + (segAcc[pi] / (acc || 1)) * 1000;
          c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: at, fill: 'forwards' });
          nodes.push({ c, dist: segAcc[pi] });
        });
      }
      nodes.sort((a, b) => a.dist - b.dist).forEach((n, i) => {
        n.c.animate([{ fill: '#35C8B4', transform: 'scale(1)' }, { fill: '#21F4BD', transform: 'scale(1.6)', offset: 0.12 }, { fill: '#E3FF00', transform: 'scale(1)', offset: 0.25 }, { fill: '#35C8B4', transform: 'scale(1)', offset: 0.4 }, { fill: '#35C8B4', transform: 'scale(1)' }], { duration: 3200, delay: 1500 + (i % 40) * 70, iterations: Infinity });
      });
      if (grid) { grid.style.opacity = '1'; grid.style.filter = 'brightness(1.8)'; }
      st = { root, paths, pulses, slow: setTimeout(() => pulses.forEach(a => { a.playbackRate = 0.5; }), 10000) };
    };
    const deactivate = () => {
      if (!st) return; const s = st; st = null; clearTimeout(s.slow);
      s.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in', fill: 'forwards' });
      s.paths.forEach(([p, L]) => p.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: L }], { duration: 1000, easing: 'ease-in', fill: 'forwards' }));
      s.kill = setTimeout(() => { s.root.remove(); dying = dying.filter(x => x !== s); }, 1000); dying.push(s);
      if (grid) { grid.style.opacity = '0.8'; grid.style.filter = 'none'; }
    };
    if (this.touch) {
      let once = false;
      const ob = this.io(([e]) => { if (e.isIntersecting && !once) { once = true; ob.disconnect(); setTimeout(() => { activate(); setTimeout(deactivate, 4000); }, 600); } }, { threshold: 1 });
      ob.observe(btn);
    } else {
      this.on(btn, 'mouseenter', activate); this.on(btn, 'focus', activate);
      this.on(btn, 'mouseleave', deactivate); this.on(btn, 'blur', deactivate);
    }
  }

  initGlowTouch() {
    if (!this.touch || this.rm) return;
    const ob = this.io(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 3000); ob.unobserve(el); } }), { threshold: 0.5 });
    document.querySelectorAll('.gc:not(.st)').forEach(el => ob.observe(el));
  }

  initCursor() {
    if (this.touch || this.props.showCursor === false) return;
    const dot = this.$('cur'); dot.style.display = 'block';
    let x = -100, y = -100, tx = -100, ty = -100, big = false;
    this.on(window, 'pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      const b = !!(e.target.closest && e.target.closest('a,button'));
      if (b !== big) { big = b; const s = b ? 40 : 8; dot.style.width = dot.style.height = s + 'px'; dot.style.mixBlendMode = b ? 'difference' : 'normal'; }
    }, { passive: true });
    const fr = () => {
      if (this.dead) return; requestAnimationFrame(fr); if (this.hidden) return;
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      const s = big ? 20 : 4; dot.style.transform = 'translate(' + (x - s).toFixed(1) + 'px,' + (y - s).toFixed(1) + 'px)';
    };
    requestAnimationFrame(fr);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => new Landing().start());
else new Landing().start();
