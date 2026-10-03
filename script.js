// ===== TAILWIND THEME EXTENSION =====
    // Purpose: Brand colors + font family so utility classes like bg-ink / text-brand-400 work.
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ink: { DEFAULT: '#07070d', 900: '#0b0b14', 800: '#111120', 700: '#181829', 600: '#22223a' },
            brand: { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
            volt: { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4' }
          },
          fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] }
        }
      }
    }

(function () {
      if (customElements.get("superstack-flow-demo")) return;

      class SuperstackFlowDemo extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: "open" });

          this.nodes = [
            { id: "start", type: "start", x: 30, y: 120, w: 120, h: 48 },
            { id: "condition", type: "condition", x: 160, y: 90, w: 220, h: 96 },
            { id: "support", type: "message", x: 420, y: 20, w: 220, h: 116 },
            { id: "ai", type: "action", x: 420, y: 150, w: 220, h: 116 },
            { id: "reply", type: "message", x: 680, y: 150, w: 220, h: 116 }
          ];

          this.initialNodes = this.nodes.map(node => ({ ...node }));
          this.nodeElements = new Map();
          this.onPointerMove = this.onPointerMove.bind(this);
          this.onPointerUp = this.onPointerUp.bind(this);
          this.onKeyDown = this.onKeyDown.bind(this);

          this.shadowRoot.innerHTML = `
            

            <section class="section">
              <i class="glow"></i>
              <i class="glow two"></i>
              <div class="inner">
                <header class="intro">
                  <p class="eyebrow">Next-Gen Visual Flow Builder</p>
                  <h2>Build Conversations <span>Visually</span></h2>
                  <p class="description">
                    Drag and drop nodes to create powerful AI agent flows.
                    No coding required. Try it yourself below!
                  </p>
                </header>
                <div class="demo">
                  <div class="frame">
                    <div class="titlebar">
                      <span class="dots" aria-hidden="true">
                        <i class="dot red"></i><i class="dot yellow"></i><i class="dot green"></i>
                      </span>
                      <span>Flow Builder</span>
                    </div>
                    <div class="canvas" role="group" aria-label="Interactive sample conversation flow">
                      <svg class="edges" aria-hidden="true"></svg>
                      <div class="toolbar">
                        <button type="button" class="reset" aria-label="Reset">Reset</button>
                      </div>
                      <div class="nodes"></div>
                    </div>
                  </div>
                  <div class="float-badges" aria-hidden="true">
                    <div class="float-tag left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 3 14 9-7 1-3 7-4-17z"/></svg>
                      Drag &amp; Drop
                    </div>
                    <div class="float-tag right">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>
                      AI Powered
                    </div>
                  </div>
                </div>
                <div class="badges">
                  <div class="badge">
                    <span class="badge-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
                    </span>
                    Send Messages
                  </div>
                  <div class="badge">
                    <span class="badge-icon spark">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3zM19 14l1.2 3.1L23 18l-2.8 1-1.2 3-1-3-3-1 3-.9L19 14z"/></svg>
                    </span>
                    AI Powered
                  </div>
                </div>
              </div>
            </section>
          `;

          this.canvas = this.shadowRoot.querySelector(".canvas");
          this.nodesEl = this.shadowRoot.querySelector(".nodes");
          this.svg = this.shadowRoot.querySelector(".edges");

          this.shadowRoot.querySelector(".reset").addEventListener("click", () => {
            this.cancelDrag();
            this.nodes = this.initialNodes.map(node => ({ ...node }));
            this.render();
          });

          this.observer = new ResizeObserver(() => this.fit());
        }

        connectedCallback() {
          this.observer.observe(this.canvas);
          this.ownerDocument.addEventListener("pointermove", this.onPointerMove);
          this.ownerDocument.addEventListener("pointerup", this.onPointerUp);
          this.ownerDocument.addEventListener("pointercancel", this.onPointerUp);
          this.render();
        }

        disconnectedCallback() {
          this.cancelDrag();
          this.observer.disconnect();
          this.ownerDocument.removeEventListener("pointermove", this.onPointerMove);
          this.ownerDocument.removeEventListener("pointerup", this.onPointerUp);
          this.ownerDocument.removeEventListener("pointercancel", this.onPointerUp);
        }

        fit() {
          const width = this.canvas.clientWidth;
          const height = this.canvas.clientHeight;
          if (!width || !height) return;

          const minX = 10, minY = 5, maxX = 920, maxY = 280;
          this.scale = Math.min(
            (width - 28) / (maxX - minX),
            (height - 28) / (maxY - minY)
          );
          this.offsetX = (width - (maxX - minX) * this.scale) / 2 - minX * this.scale;
          this.offsetY = (height - (maxY - minY) * this.scale) / 2 - minY * this.scale;
          this.render();
        }

        nodeMarkup(node) {
          const handle = (side, cls = "") => `<i class="handle ${side} ${cls}"></i>`;

          if (node.type === "start") {
            return `
              ${handle("right")}
              <div class="start-card">
                <span class="start-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 4 13 8-13 8V4z"/></svg>
                </span>
                Start
              </div>
            `;
          }

          const icon = node.type === "condition"
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v12m0 0a3 3 0 1 0 3 3m-3-3a3 3 0 1 1-3 3m3-3h8a4 4 0 0 0 4-4V5m0 0-3 3m3-3 3 3"/></svg>`
            : node.type === "action"
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m13 2-3 9h7L9 22l2-9H4l9-11z"/></svg>`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>`;

          if (node.type === "condition") {
            return `
              ${handle("left")}
              <div class="card">
                <div class="node-head yellowhead">${icon}<span>Condition</span></div>
                <div class="node-body">
                  <div class="condition-row">
                    <code>intent</code><span class="operator">=</span><code class="value">support</code>
                  </div>
                </div>
              </div>
              ${handle("right", "true")}
              ${handle("right", "false")}
            `;
          }

          const label = node.type === "action" ? "AI Generate" : "Send Message";
          const text = node.id === "support"
            ? "Connecting you to support..."
            : node.type === "action" ? "Generate response with GPT" : "{{ai_reply}}";

          return `
            ${handle("left")}
            <div class="card">
              <div class="node-head ${node.type === "action" ? "redhead" : "bluehead"}">
                ${icon}<span>${label}</span>
              </div>
              <div class="node-body"><div class="message">${text}</div></div>
            </div>
            ${node.id === "reply" ? "" : handle("right")}
          `;
        }

        render() {
          if (!this.scale) {
            const w = this.canvas.clientWidth;
            const h = this.canvas.clientHeight;
            if (!w || !h) return;
            this.scale = Math.min((w - 28) / 910, (h - 28) / 275);
            this.offsetX = (w - 910 * this.scale) / 2 - 10 * this.scale;
            this.offsetY = (h - 275 * this.scale) / 2 - 5 * this.scale;
          }

          this.nodes.forEach(node => {
            let el = this.nodeElements.get(node.id);
            if (!el) {
              el = this.ownerDocument.createElement("div");
              el.className = "node";
              el.dataset.id = node.id;
              el.dataset.nodeId = ({ start: "1", condition: "2", support: "3", ai: "4", reply: "5" })[node.id];
              el.tabIndex = 0;
              el.setAttribute("role", "group");
              el.setAttribute(
                "aria-label",
                node.id === "condition"
                  ? "Condition: intent equals support. Use arrow keys to move."
                  : `${node.type === "start" ? "Start" : node.type === "action" ? "AI Generate" : "Send Message"}. Use arrow keys to move.`
              );
              el.style.width = `${node.w}px`;
              el.style.height = `${node.h}px`;
              el.innerHTML = this.nodeMarkup(node);
              el.addEventListener("pointerdown", event => this.startDrag(event, node.id, el));
              el.addEventListener("keydown", this.onKeyDown);
              this.nodeElements.set(node.id, el);
              this.nodesEl.appendChild(el);
            }
            el.style.transform = `translate(${this.offsetX + node.x * this.scale}px,${this.offsetY + node.y * this.scale}px) scale(${this.scale})`;
          });
          this.drawEdges();
        }

        drawEdges() {
          const pos = id => this.nodes.find(node => node.id === id);
          const start = pos("start");
          const condition = pos("condition");
          const support = pos("support");
          const ai = pos("ai");
          const reply = pos("reply");
          const point = (node, x, y) => [
            this.offsetX + (node.x + x) * this.scale,
            this.offsetY + (node.y + y) * this.scale
          ];
          const curve = (a, b, cls) => {
            const [x1, y1] = a;
            const [x2, y2] = b;
            const dx = Math.max(22, (x2 - x1) * .45);
            return `<path class="edge ${cls}" d="M${x1} ${y1} C${x1 + dx} ${y1},${x2 - dx} ${y2},${x2} ${y2}"/>`;
          };
          this.svg.innerHTML = [
            curve(point(start, start.w, start.h / 2), point(condition, 0, condition.h / 2), "teal"),
            curve(point(condition, condition.w, condition.h * .4), point(support, 0, support.h / 2), "true"),
            curve(point(condition, condition.w, condition.h * .7), point(ai, 0, ai.h / 2), "false"),
            curve(point(ai, ai.w, ai.h / 2), point(reply, 0, reply.h / 2), "teal")
          ].join("");
        }

        constrainNode(node, x, y) {
          const freeMove = node.id === "ai";
          const minX = freeMove ? (6 - this.offsetX) / this.scale : 10;
          const minY = freeMove ? (6 - this.offsetY) / this.scale : 5;
          const maxX = freeMove ? (this.canvas.clientWidth - 6 - this.offsetX) / this.scale - node.w : 920 - node.w;
          const maxY = freeMove ? (this.canvas.clientHeight - 6 - this.offsetY) / this.scale - node.h : 280 - node.h;
          node.x = Math.max(minX, Math.min(maxX, x));
          node.y = Math.max(minY, Math.min(maxY, y));
        }

        startDrag(event, id, element) {
          if (event.button !== 0) return;
          event.preventDefault();
          const node = this.nodes.find(item => item.id === id);
          this.drag = {
            id, pointer: event.pointerId, x: event.clientX, y: event.clientY,
            nodeX: node.x, nodeY: node.y
          };
          element.focus({ preventScroll: true });
          element.setPointerCapture?.(event.pointerId);
        }

        onPointerMove(event) {
          if (!this.drag || event.pointerId !== this.drag.pointer) return;
          const node = this.nodes.find(item => item.id === this.drag.id);
          this.constrainNode(
            node,
            this.drag.nodeX + (event.clientX - this.drag.x) / this.scale,
            this.drag.nodeY + (event.clientY - this.drag.y) / this.scale
          );
          this.render();
        }

        cancelDrag() {
          if (!this.drag) return;
          const element = this.nodeElements.get(this.drag.id);
          try {
            if (element?.hasPointerCapture(this.drag.pointer)) {
              element.releasePointerCapture(this.drag.pointer);
            }
          } catch (_) {}
          this.drag = null;
        }

        onPointerUp(event) {
          if (this.drag && event.pointerId === this.drag.pointer) this.cancelDrag();
        }

        onKeyDown(event) {
          const delta = {
            ArrowLeft: [-8, 0], ArrowRight: [8, 0],
            ArrowUp: [0, -8], ArrowDown: [0, 8]
          }[event.key];
          if (!delta) return;
          event.preventDefault();
          const node = this.nodes.find(item => item.id === event.currentTarget.dataset.id);
          this.constrainNode(node, node.x + delta[0], node.y + delta[1]);
          this.render();
          this.nodeElements.get(node.id)?.focus({ preventScroll: true });
        }
      }

      customElements.define("superstack-flow-demo", SuperstackFlowDemo);
    })();

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ===== MOBILE MENU TOGGLE =====
    // Function: toggleMobileMenu()
    // Purpose: Show/hide navigation menu on mobile devices and update aria state
    // Triggers: Click on hamburger button; closes when a link is tapped
    (function(){var b=document.getElementById('nav-toggle'),m=document.getElementById('mobile-menu');if(!b||!m)return;b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open');b.setAttribute('aria-expanded','false');});});})();

    // ===== HERO INTRO TIMELINE =====
    // Function: initHeroIntro()
    // Purpose: Stagger badge → headline → subtext → CTAs → dashboard in from hidden on load
    // Note: Hidden states are set ONLY here in JS so content is visible without JavaScript
    (function initHeroIntro() {
      gsap.set(['.hero-badge', '.hero-title', '.hero-sub', '.hero-ctas', '.hero-meta'], { autoAlpha: 0, y: 48 });
      gsap.set('.hero-visual', { autoAlpha: 0, y: 90, scale: 0.94 });
      gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
        .to('.hero-badge', { autoAlpha: 1, y: 0 }, 0.1)
        .to('.hero-title', { autoAlpha: 1, y: 0 }, '-=0.6')
        .to('.hero-sub', { autoAlpha: 1, y: 0 }, '-=0.65')
        .to('.hero-ctas', { autoAlpha: 1, y: 0 }, '-=0.65')
        .to('.hero-meta', { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.6')
        .to('.hero-visual', { autoAlpha: 1, y: 0, scale: 1, duration: 1.2 }, '-=0.7');
    })();

    // ===== SCROLL REVEALS =====
    // Function: initReveals()
    // Purpose: Every .reveal element starts hidden/offset and fades up when entering viewport
    // Behaviour: once:true so content never re-hides; siblings stagger for a cascading feel
    (function initReveals() {
      var items = gsap.utils.toArray('.reveal');
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, y: 48 });
      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: function (els) {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 });
        }
      });
    })();

    // ===== ANIMATED STAT COUNTERS =====
    // Function: initCounters()
    // Purpose: Count each .counter from 0 to its data-count value when scrolled into view
    // Edit: Change data-count / data-suffix attributes in the STATS section
    (function initCounters() {
      document.querySelectorAll('.counter').forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { v: 1 },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString() + suffix; }
        });
      });
    })();

    // ===== STACK REPLACEMENT PINNED SCENE =====
    // Function: initStackScene()
    // Purpose: Pin the section and, as the user scrolls, pull every scattered SaaS card
    //          into the center where they collapse into the glowing SuperStack OS core
    // Behaviour: scrub:1 ties progress to scroll; headline A fades out, caption B fades in
    (function initStackScene() {
      var scene = document.querySelector('.stack-scene');
      var cards = gsap.utils.toArray('.stack-card');
      if (!scene || !cards.length) return;

      // Give each card its tilt from data-rot
      cards.forEach(function (c) { gsap.set(c, { rotation: parseFloat(c.getAttribute('data-rot')) || 0 }); });
      gsap.set('.stack-core', { scale: 0.7, autoAlpha: 0.35 });
      gsap.set('.stack-headline-b', { autoAlpha: 0, y: 40 });

      gsap.timeline({
        scrollTrigger: { trigger: scene, start: 'top top', end: '+=220%', pin: true, scrub: 1, anticipatePin: 1 }
      })
        .to(cards, {
          left: '50%', top: '50%', right: 'auto', xPercent: -50, yPercent: -50,
          rotation: 0, scale: 0.45, duration: 1.4, ease: 'power2.inOut', stagger: 0.06
        }, 0)
        .to('.stack-headline-a', { autoAlpha: 0, y: -40, duration: 0.5 }, 0.7)
        .to(cards, { autoAlpha: 0, duration: 0.35, stagger: 0.02 }, 1.35)
        .to('.stack-core', { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 1.3)
        .to('.stack-headline-b', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.7)
        .to({}, { duration: 0.4 }); // brief hold at the end
    })();

    // ===== MCP FLOW PATH DRAW + TRACER DOT =====
    // Function: initFlowPath()
    // Purpose: Draw the SVG line down the "How it works" steps as you scroll and ride a
    //          glowing dot along it using MotionPathPlugin (scrubbed to scroll position)
    // Note: The path is rebuilt in real pixel coordinates on every resize so the curve,
    //       stroke and dot stay perfectly round and aligned with each step on any screen.
    (function initFlowPath() {
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.getElementById('flowSvg');
      var col = document.getElementById('flowCol');
      var path = document.getElementById('flowPath');
      var track = document.getElementById('flowTrack');
      var nodesG = document.getElementById('flowNodes');
      var dot = document.getElementById('flowDot');
      var list = document.querySelector('.flow-steps');
      if (!svg || !col || !path || !track || !dot || !list) return;

      var steps = Array.prototype.slice.call(list.children);
      var len = 0, nodes = [], state = { p: 0 };

      function build() {
        var w = col.clientWidth, h = col.clientHeight;
        if (!w || !h) return;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        var cx = w / 2;
        var amp = Math.max(8, w * 0.32);

        // Anchor points: top, one per step (aligned with STEP label, transform-independent), bottom
        var pts = [{ x: cx, y: 0 }];
        steps.forEach(function (li) {
          var y = li.offsetTop - col.offsetTop + Math.min(40, li.offsetHeight / 2);
          pts.push({ x: cx, y: y, node: true });
        });
        pts.push({ x: cx, y: h });

        var d = 'M' + cx + ' 0';
        for (var i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], dy = b.y - a.y;
          var s = (i % 2 ? 1 : -1) * amp;
          d += ' C' + (cx + s) + ' ' + (a.y + dy * 0.3) + ', ' + (cx + s) + ' ' + (b.y - dy * 0.3) + ', ' + b.x + ' ' + b.y;
        }
        path.setAttribute('d', d);
        track.setAttribute('d', d);
        len = path.getTotalLength();
        path.style.strokeDasharray = len;

        // Step nodes
        while (nodesG.firstChild) nodesG.removeChild(nodesG.firstChild);
        nodes = [];
        pts.forEach(function (p) {
          if (!p.node) return;
          var c = document.createElementNS(NS, 'circle');
          c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', w < 60 ? 5 : 7);
          c.setAttribute('fill', '#0b0b14'); c.setAttribute('stroke', 'rgba(255,255,255,0.2)'); c.setAttribute('stroke-width', '2');
          c.style.transition = 'fill .3s, stroke .3s';
          nodesG.appendChild(c);
          nodes.push({ el: c, y: p.y });
        });
        render();
      }

      function render() {
        if (!len) return;
        var l = len * state.p;
        path.style.strokeDashoffset = len - l;
        var pt = path.getPointAtLength(l);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        nodes.forEach(function (n) {
          var on = pt.y >= n.y - 1;
          n.el.setAttribute('fill', on ? '#22d3ee' : '#0b0b14');
          n.el.setAttribute('stroke', on ? '#a78bfa' : 'rgba(255,255,255,0.2)');
        });
      }

      build();

      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 70%', scrub: 0.6, invalidateOnRefresh: true }
      });

      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { build(); }).observe(col);
      } else {
        window.addEventListener('resize', build);
      }
      ScrollTrigger.addEventListener('refresh', build);
      window.addEventListener('load', build);
    })();


    // ===== REFRESH SCROLLTRIGGER AFTER FONTS/LAYOUT SETTLE =====
    // Function: refreshTriggers()
    // Purpose: Recalculate pinned/scrubbed positions once web fonts have loaded
    (function refreshTriggers() {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    })();