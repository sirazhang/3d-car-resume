(function () {
  "use strict";

  // ---------------- Data ----------------
  var EDUCATION = [
    { flag: "\ud83c\uddfa\ud83c\uddf8", school: "University of Southern California", year: "2018", degree: "M.A. \u00b7 \u6587\u5b66\u7855\u58eb" },
    { flag: "\ud83c\uddea\ud83c\uddf8", school: "Universidad de Salamanca", year: "2014", degree: "B.A. \u00b7 \u6587\u5b66\u5b66\u58eb" },
    { flag: "\ud83c\udded\ud83c\uddf0", school: "The Chinese University of Hong Kong", year: "2024", degree: "PhD Candidate \u00b7 \u535a\u58eb\u5728\u8bfb" }
  ];

  var PAPERS = [
    { title: "Chatbots & L2 Vocabulary Acquisition", venue: "Heliyon", tag: "Vocabulary", award: "AERA 2024", cover: "paper1.jpg" },
    { title: "GenAI-Supported Creative Writing", venue: "Int. J. of Applied Linguistics", tag: "Writing", cover: "paper2.jpg" },
    { title: "Hybrid Feedback in L2 Writing", venue: "Innovation in Language Learning and Teaching", tag: "Writing", award: "BERA 2025", cover: "paper3.jpg" }
  ];

  var PROJECTS = [
    { num: "01", name: "AI Journey", desc: "\u6e38\u620f\u5316 AI \u5b66\u4e60\u5192\u9669", color: "#ff7a7a" },
    { num: "02", name: "GenAI Postcard", desc: "\u751f\u6210\u5f0f AI \u660e\u4fe1\u7247\u5bf9\u8bdd", color: "#ffb86b" },
    { num: "03", name: "Vocab Testing", desc: "\u6e38\u620f\u5316\u8bcd\u6c47\u6d4b\u8bd5", color: "#7ac6a3" },
    { num: "04", name: "IELTS Writing", desc: "AI \u96c5\u601d\u5199\u4f5c\u8bc4\u6d4b", color: "#8FBFD8" },
    { num: "05", name: "AutoWorksheet", desc: "\u4e00\u952e\u751f\u6210\u7ec3\u4e60\u7eb8", color: "#c5a3d6" },
    { num: "06", name: "BookTail", desc: "AI \u5ba0\u7269\u9605\u8bfb\u4f19\u4f34", color: "#e6b85c" }
  ];

  var MOVIE_PHOTOS = ["photo3.jpg", "photo4.jpg", "photo5.jpg"];

  var CONTACT = [
    { lbl: "Name", val: "\u5f20\u6dfd\u535c (Zhihui Zhang)" },
    { lbl: "Role", val: "PhD Candidate \u00b7 CUHK" },
    { lbl: "Phone", val: "+852 6090 5092" },
    { lbl: "Email", val: "zhihuiz@link.cuhk.edu.hk" },
    { lbl: "GitHub", val: "github.com/sirazhang" }
  ];

  var HONORS = [
    "Postgraduate Research Output Award 2026",
    "Duolingo Research Grant \u00b7 2025",
    "Vice-Chancellor's Scholarship, CUHK \u00b7 2024"
  ];

  // ---------------- Stops on the route ----------------
  // progress 0..1 along the road. 0 = home, 1 = summit.
  var STOPS = [
    { t: 0.14, name: "Education",   shop: "school",  panel: "education" },
    { t: 0.34, name: "Publication", shop: "library", panel: "publication" },
    { t: 0.56, name: "Projects",    shop: "tech",    panel: "projects" },
    { t: 0.78, name: "Movie",       shop: "movie",   panel: "movie" },
    { t: 1.00, name: "Contact",     shop: "lounge",  panel: "contact" }
  ];

  // Shop visual styles along the road (drawn as 2.5D rectangles).
  var SHOP_STYLE = {
    school:  { color: "#f1d9a6", roof: "#cda86b", sign: "School" },
    library: { color: "#c9d6dc", roof: "#7a99a4", sign: "Library" },
    tech:    { color: "#a8c2d8", roof: "#5b7d99", sign: "Tech" },
    movie:   { color: "#d6a3b3", roof: "#9c5c70", sign: "Cinema" },
    lounge:  { color: "#e6cdb3", roof: "#a07a55", sign: "Lounge" }
  };

  // ---------------- State ----------------
  var state = {
    t: 0,                 // 0..1 along the road
    dir: 0,               // -1 / 0 / 1
    speed: 0.00075,       // per ms
    car: { x: 0, y: 0, yaw: 0, bob: 0 },
    panel: null,          // null | intro | education | publication | projects | movie | contact
    panelData: null,
    lastStopT: -1,
    crashed: false
  };

  // ---------------- DOM ----------------
  var canvas = document.getElementById("scene");
  var ctx = canvas.getContext("2d");
  var cardRoot = document.getElementById("cardRoot");
  var btnUp = document.getElementById("btnUp");
  var btnDown = document.getElementById("btnDown");
  var fuelFill = document.getElementById("fuelFill");
  var hudHint = document.getElementById("hudHint");

  // ---------------- Layout (responsive) ----------------
  var W = 0, H = 0, DPR = 1;
  var ROAD_TOP = 0;       // y in world where road disappears to horizon
  var ROAD_BOTTOM = 0;    // y in world where road ends at the bottom
  var VP_X = 0;           // vanishing point x
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    VP_X = W * 0.5;
    ROAD_TOP = H * 0.32;
    ROAD_BOTTOM = H * 0.86;
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------------- Path helpers ----------------
  // progress t (0..1) -> world y along the road (linear interpolation is enough for a stylized look)
  function roadY(t) {
    return ROAD_BOTTOM - (ROAD_BOTTOM - ROAD_TOP) * t;
  }
  // The road has slight curvature; offset x to fake 2.5D.
  function roadX(t, lane) {
    var wob = Math.sin(t * Math.PI * 1.2) * (W * 0.04);
    return VP_X + wob + (lane || 0);
  }

  // ---------------- Stops: detect arrival ----------------
  function checkStops(prevT) {
    for (var i = 0; i < STOPS.length; i++) {
      var s = STOPS[i];
      if (s.t > prevT + 0.0005 && s.t <= state.t + 0.0005) {
        state.t = s.t;
        state.dir = 0;
        openPanel(s.panel);
        return;
      }
    }
    // Bounce off start
    if (state.t <= 0 && state.dir < 0) {
      state.t = 0;
      state.dir = 0;
    }
  }

  // ---------------- Panel rendering ----------------
  function clearPanel() {
    cardRoot.innerHTML = "";
    cardRoot.setAttribute("aria-hidden", "true");
  }

  function openPanel(kind) {
    if (state.panel === kind) return;
    state.panel = kind;
    if (kind !== "intro") state.lastStopT = state.t;
    if (kind === "intro") {
      state.panelData = renderIntro;
    } else if (kind === "education") {
      state.panelData = renderEducation;
    } else if (kind === "publication") {
      state.panelData = renderPublication;
    } else if (kind === "projects") {
      state.panelData = renderProjects;
    } else if (kind === "movie") {
      state.panelData = renderMovie;
    } else if (kind === "contact") {
      state.panelData = renderContact;
    }
    paintPanel();
  }

  function paintPanel() {
    if (!state.panel) { clearPanel(); return; }
    var html = "";
    html += '<div class="card-backdrop" data-close="1"></div>';
    html += '<div class="card" role="dialog" aria-modal="true">';
    html += '  <div class="card-head">';
    html += '    <h2>' + panelTitle(state.panel) + '</h2>';
    html += '    <button class="card-close" data-close="1" aria-label="\u5173\u95ed">\u00d7</button>';
    html += '  </div>';
    html += '  <div class="card-body" id="cardBody"></div>';
    html += '</div>';
    cardRoot.innerHTML = html;
    cardRoot.setAttribute("aria-hidden", "false");
    var body = document.getElementById("cardBody");
    state.panelData(body);
  }

  function panelTitle(p) {
    if (p === "education") return "Education \u00b7 \u6559\u80b2\u7ecf\u5386";
    if (p === "publication") return "Publication \u00b7 \u8bba\u6587\u53d1\u8868";
    if (p === "projects") return "Projects \u00b7 \u4e3e\u4e2a\u9879\u76ee";
    if (p === "movie") return "Movie \u00b7 \u751f\u6d3b\u5377\u5e55";
    if (p === "contact") return "Contact \u00b7 \u8054\u7cfb";
    if (p === "intro") return "Hi!";
    return p;
  }

  function renderIntro(body) {
    var html = '<div class="intro">';
    html += '<h1>Hi, I\u2019m \u5f20\u6dfd\u535b</h1>';
    html += '<div class="role">PhD Candidate \u00b7 The Chinese University of Hong Kong</div>';
    html += '<div class="awards">' + HONORS.map(function (h) { return '\u00b7 ' + h; }).join('<br/>') + '</div>';
    html += '<div class="langs">\u4e2d\u6587 \u00b7 English \u00b7 Espa\u00f1ol \u00b7 Fran\u00e7ais</div>';
    html += '<div style="margin-top:14px;font-size:12px;color:#4a5070;">\u70b9 \u25b2 \u542f\u52a8\u5c0f\u8f66\uff0c\u4e00\u8def\u9a76\u5230\u9876\u3002</div>';
    html += '</div>';
    body.innerHTML = html;
  }

  function renderEducation(body) {
    var html = '<div class="card-section">';
    EDUCATION.forEach(function (e) {
      html += '<div class="edu-item">';
      html += '  <div class="head"><span class="school">' + e.flag + ' ' + e.school + '</span><span class="year">' + e.year + '</span></div>';
      html += '  <div class="degree">' + e.degree + '</div>';
      html += '</div>';
    });
    html += '</div>';
    body.innerHTML = html;
  }

  function renderPublication(body) {
    var html = '<div class="card-section">';
    PAPERS.forEach(function (p) {
      html += '<div class="paper-item">';
      html += '  <img src="./assets/img/' + p.cover + '" alt=""/>';
      html += '  <div class="meta">';
      html += '    <div class="title">' + p.title + '</div>';
      html += '    <div class="venue">' + p.venue + '</div>';
      html += '    <div><span class="tag">' + p.tag + '</span>' + (p.award ? '<span class="tag" style="background:rgba(255,184,107,0.5)">' + p.award + '</span>' : '') + '</div>';
      html += '  </div>';
      html += '</div>';
    });
    html += '</div>';
    body.innerHTML = html;
  }

  function renderProjects(body) {
    var html = '<div class="card-section"><div class="proj-grid">';
    PROJECTS.forEach(function (p) {
      html += '<div class="proj-card" style="background:' + p.color + '">';
      html += '  <div class="num">' + p.num + '</div>';
      html += '  <div class="name">' + p.name + '</div>';
      html += '  <div>' + p.desc + '</div>';
      html += '</div>';
    });
    html += '</div></div>';
    body.innerHTML = html;
  }

  function renderMovie(body) {
    var html = '<div class="card-section"><div class="movie-reel">';
    MOVIE_PHOTOS.forEach(function (src) {
      html += '<img src="./assets/img/' + src + '" alt=""/>';
    });
    html += '</div>';
    html += '<div style="margin-top:12px;font-size:12.5px;color:#4a5070;">\u4f60\u53ef\u4ee5\u5de6\u53f3\u6ed1\u52a8\u770b\u66f4\u591a\u7167\u7247\u3002</div>';
    html += '</div>';
    body.innerHTML = html;
  }

  function renderContact(body) {
    var html = '<div class="card-section">';
    CONTACT.forEach(function (c) {
      html += '<div class="contact-line"><span class="lbl">' + c.lbl + '</span><span class="val">' + c.val + '</span></div>';
    });
    html += '</div>';
    body.innerHTML = html;
  }

  // Card interactions: backdrop and close button
  cardRoot.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== cardRoot) {
      if (t.getAttribute && t.getAttribute("data-close") === "1") {
        state.panel = null;
        state.panelData = null;
        clearPanel();
        return;
      }
      t = t.parentNode;
    }
  });

  // ---------------- Controls ----------------
  function setDir(d) {
    if (state.panel && state.panel !== "intro") {
      // any tap to close panel returns to drive mode
      state.panel = null;
      state.panelData = null;
      clearPanel();
    }
    if (state.panel === "intro") {
      state.panel = null;
      state.panelData = null;
      clearPanel();
    }
    state.dir = d;
  }
  btnUp.addEventListener("click", function () { setDir(1); });
  btnDown.addEventListener("click", function () { setDir(-1); });

  // keyboard
  window.addEventListener("keydown", function (e) {
    if (e.keyCode === 38) { e.preventDefault(); setDir(1); }
    else if (e.keyCode === 40) { e.preventDefault(); setDir(-1); }
    else if (e.keyCode === 27) { // Esc closes card
      if (state.panel) {
        state.panel = null;
        state.panelData = null;
        clearPanel();
      }
    }
  });

  // ---------------- Drawing ----------------
  function drawSky() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#8FBFD8");
    g.addColorStop(0.55, "#DCEBF0");
    g.addColorStop(1, "#F4F3EE");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // clouds: lazy deterministic positions
  var CLOUDS = [
    { x: 0.18, y: 0.16, s: 1.0 },
    { x: 0.72, y: 0.12, s: 1.3 },
    { x: 0.35, y: 0.24, s: 0.7 },
    { x: 0.58, y: 0.22, s: 0.6 },
    { x: 0.85, y: 0.30, s: 0.5 }
  ];
  function drawClouds(t) {
    CLOUDS.forEach(function (c, i) {
      var x = (c.x + Math.sin(t * 0.0004 + i) * 0.012) * W;
      var y = c.y * H;
      drawCloud(x, y, 30 * c.s);
    });
  }
  function drawCloud(x, y, r) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 0.7, y - r * 0.1, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x + r * 1.4, y, r * 0.65, 0, Math.PI * 2);
    ctx.arc(x + r * 0.6, y + r * 0.2, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hot air balloons: 2 small ones
  function drawBalloons(t) {
    var bal = [
      { x: 0.22, y: 0.18, c: "#ff7a7a" },
      { x: 0.78, y: 0.16, c: "#ffb86b" }
    ];
    bal.forEach(function (b, i) {
      var yOff = Math.sin(t * 0.0014 + i) * 6;
      var x = b.x * W;
      var y = b.y * H + yOff;
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.ellipse(x, y, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 6, y + 18, 12, 8);
    });
  }

  // Far ridge silhouette
  function drawRidge() {
    ctx.fillStyle = "rgba(166, 189, 198, 0.6)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.36);
    var pts = 32;
    for (var i = 0; i <= pts; i++) {
      var x = (i / pts) * W;
      var y = H * 0.36 - Math.sin(i * 0.6) * 6 - Math.cos(i * 0.22) * 4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H * 0.45);
    ctx.lineTo(W, H * 0.36);
    ctx.closePath();
    ctx.fill();
  }

  // Town body: cloud sea below, far mountains behind tower
  function drawCloudSea() {
    var g = ctx.createLinearGradient(0, H * 0.55, 0, H);
    g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(1, "rgba(244, 243, 238, 1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
  }

  // The spiral tower silhouette
  function drawTower() {
    var cx = VP_X;
    var baseY = H * 0.55;
    var top = H * 0.10;
    var w = 70;
    // Tower body (curved by sampling ellipses)
    ctx.fillStyle = "#b6a89e";
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.6, baseY);
    var segments = 18;
    for (var i = 0; i <= segments; i++) {
      var k = i / segments;
      var y = baseY - (baseY - top) * k;
      var radius = w * (0.5 + 0.32 * Math.sin(k * Math.PI * 2.3));
      var x = cx + Math.sin(k * Math.PI * 4.0) * 8;
      ctx.lineTo(x - radius, y);
    }
    for (var j2 = segments; j2 >= 0; j2--) {
      var k2 = j2 / segments;
      var y2 = baseY - (baseY - top) * k2;
      var radius2 = w * (0.5 + 0.32 * Math.sin(k2 * Math.PI * 2.3));
      var x2 = cx + Math.sin(k2 * Math.PI * 4.0) * 8;
      ctx.lineTo(x2 + radius2, y2);
    }
    ctx.closePath();
    ctx.fill();

    // Tower windows
    ctx.fillStyle = "#f1d9a6";
    for (var wIdx = 0; wIdx < 12; wIdx++) {
      var wk = (wIdx + 0.5) / 12;
      var wy = baseY - (baseY - top) * wk;
      var wr = w * (0.5 + 0.32 * Math.sin(wk * Math.PI * 2.3));
      var wx = cx + Math.sin(wk * Math.PI * 4.0) * 8;
      ctx.fillRect(wx - 6, wy - 4, 12, 8);
    }
  }

  // Road
  function drawRoad() {
    // back of the road (dark) at the horizon -> wide at the bottom
    var topW = 16;
    var botW = W * 0.78;
    var yTop = ROAD_TOP;
    var yBot = ROAD_BOTTOM;

    ctx.fillStyle = "#3b3744";
    ctx.beginPath();
    ctx.moveTo(VP_X - topW, yTop);
    ctx.lineTo(VP_X + topW, yTop);
    ctx.lineTo(VP_X + botW / 2, yBot);
    ctx.lineTo(VP_X - botW / 2, yBot);
    ctx.closePath();
    ctx.fill();

    // Center dashes
    ctx.strokeStyle = "#f3d680";
    ctx.lineWidth = 3;
    var dashes = 12;
    for (var i = 0; i < dashes; i++) {
      var tA = i / dashes;
      var tB = (i + 0.45) / dashes;
      var yA = yTop + (yBot - yTop) * tA;
      var yB = yTop + (yBot - yTop) * tB;
      var xA = VP_X + (Math.sin(tA * Math.PI * 1.2) * (W * 0.04));
      var xB = VP_X + (Math.sin(tB * Math.PI * 1.2) * (W * 0.04));
      ctx.beginPath();
      ctx.moveTo(xA, yA);
      ctx.lineTo(xB, yB);
      ctx.stroke();
    }
  }

  // Shops along the road as 2.5D prisms
  function drawShops() {
    var left = true;
    STOPS.forEach(function (s, i) {
      var y = roadY(s.t);
      var side = left ? -1 : 1;
      left = !left;
      var style = SHOP_STYLE[s.shop] || { color: "#ccc", roof: "#888", sign: s.shop };
      var baseW = 60 + (1 - s.t) * 30;
      var baseH = 80 + (1 - s.t) * 30;
      var cx = roadX(s.t, side * (W * 0.18));
      // glow ring
      if (Math.abs(state.t - s.t) < 0.04 || state.panel) {
        ctx.strokeStyle = "rgba(255, 200, 120, 0.55)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(roadX(s.t, 0), y + 4, 60, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // body
      ctx.fillStyle = style.color;
      ctx.fillRect(cx - baseW / 2, y - baseH, baseW, baseH);
      // roof
      ctx.fillStyle = style.roof;
      ctx.beginPath();
      ctx.moveTo(cx - baseW / 2 - 6, y - baseH);
      ctx.lineTo(cx + baseW / 2 + 6, y - baseH);
      ctx.lineTo(cx + baseW / 2, y - baseH - 14);
      ctx.lineTo(cx - baseW / 2, y - baseH - 14);
      ctx.closePath();
      ctx.fill();
      // sign
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(cx - baseW / 2 + 4, y - 22, baseW - 8, 14);
      ctx.fillStyle = "#1f2330";
      ctx.font = "10px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(style.sign, cx, y - 11);
    });
  }

  // The car
  function drawCar() {
    var t = state.t;
    var y = roadY(t) - 6;
    var x = roadX(t, 0);
    // shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = "#ff7a7a";
    ctx.fillRect(x - 18, y - 8, 36, 14);
    // cabin
    ctx.fillStyle = "#ffd1d1";
    ctx.fillRect(x - 12, y - 16, 24, 10);
    // wheels
    ctx.fillStyle = "#1f2330";
    ctx.fillRect(x - 16, y + 4, 6, 6);
    ctx.fillRect(x + 10, y + 4, 6, 6);
    // front highlight
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 14, y - 4, 4, 4);
  }

  function drawIdleCar() {
    // car parked at start when nothing happening
    var x = W * 0.5;
    var y = H * 0.86 - 6;
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 32, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7a7a";
    ctx.fillRect(x - 22, y - 8, 44, 16);
    ctx.fillStyle = "#ffd1d1";
    ctx.fillRect(x - 14, y - 18, 28, 12);
    ctx.fillStyle = "#1f2330";
    ctx.fillRect(x - 20, y + 4, 7, 7);
    ctx.fillRect(x + 13, y + 4, 7, 7);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 18, y - 4, 4, 4);
  }

  // ---------------- Frame loop ----------------
  var lastTs = 0;
  function frame(ts) {
    if (!lastTs) lastTs = ts;
    var dt = ts - lastTs;
    lastTs = ts;

    if (state.dir !== 0 && !state.panel) {
      var prevT = state.t;
      state.t += state.dir * state.speed * dt;
      if (state.t > 1) state.t = 1;
      if (state.t < 0) state.t = 0;
      checkStops(prevT);
    }

    // Canvas clear & redraw
    drawSky();
    drawClouds(ts);
    drawBalloons(ts);
    drawRidge();
    drawCloudSea();
    drawTower();
    drawRoad();
    drawShops();
    if (state.t > 0.005) drawCar(); else drawIdleCar();

    // HUD fuel
    fuelFill.style.width = Math.min(100, state.t * 100) + "%";

    requestAnimationFrame(frame);
  }

  // Pause rAF when page hidden to save battery
  var rafId = null;
  function startLoop() {
    if (rafId) return;
    lastTs = 0;
    rafId = requestAnimationFrame(function (t) { rafId = frame(t); });
  }
  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLoop(); else startLoop();
  });

  // Initial state: open intro card
  openPanel("intro");
  startLoop();
})();
