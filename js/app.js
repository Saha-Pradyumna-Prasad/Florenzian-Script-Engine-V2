(function () {
  const $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } },
                  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} } };
  const D = I18N;
  let lang = store.get("flz_lang", null) || ((navigator.language || "").slice(0, 2) === "it" ? "it" : "en");
  const t = k => D[lang][k] || k, IT = () => lang === "it";
  const tErr = m => IT() ? D.errs.reduce((s, [re, it]) => s.replace(re, it), m) : m;
  const fdesc = f => IT() ? D.desc.it[f.id] : f.desc;
  const flabels = f => (IT() && D.labels.it[f.id]) || f.labels;
  const ftitle = f => IT() ? [f.ita, f.eng] : [f.eng, f.ita];   // [heading, tag]

  /* ---------- nav, scroll progress, reveal, counters ---------- */
  const nav = $("nav"), prog = $("prog");
  const onScroll = () => { nav.classList.toggle("solid", scrollY > 60); prog.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100 || 0) + "%"; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target); }), { threshold: .12 });
  document.querySelectorAll(".rv").forEach(el => io.observe(el));
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const n = +e.target.dataset.n, t0 = performance.now();
    (function f(now) { const p = Math.min((now - t0) / 1200, 1); e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .6 });
  document.querySelectorAll(".count").forEach(el => cio.observe(el));

  /* ---------- categories + list ---------- */
  const CATS = { c_ar: [1,2,3,4,5,6,7,8,9,10,13,26], c_nu: [12,14,15,25,27,28,29,32,33], c_bi: [16,17,18,19,20], c_ge: [11,21,22,24,30,34,35], c_fi: [23,31] };
  let cat = "c_all", query = "", active = FL.functions[0];
  function renderChips() {
    $("catChips").innerHTML = ["c_all", ...Object.keys(CATS)].map(c => `<button class="chip ${c === cat ? "on" : ""}" data-c="${c}">${t(c)}</button>`).join("");
    $("catChips").querySelectorAll(".chip").forEach(b => b.onclick = () => { cat = b.dataset.c; renderChips(); renderList(); });
  }
  function renderList() {
    const q = query.toLowerCase();
    const items = FL.functions.filter(f => (cat === "c_all" || CATS[cat].includes(f.id)) && (f.eng + f.ita + f.desc + fdesc(f) + f.fn).toLowerCase().includes(q));
    $("functionList").innerHTML = items.length ? "" : `<p class="text-muted p-3 mb-0">${t("none")}</p>`;
    items.forEach(f => {
      const [a, b] = ftitle(f), d = document.createElement("div"); d.className = "func-item" + (f.id === active.id ? " active" : "");
      d.innerHTML = `<div class="h"><span>${f.id}. ${a}</span><span class="func-badge">${b}</span></div><div class="func-desc">${fdesc(f)}</div>`;
      d.onclick = () => { active = f; renderList(); updateUI(true); }; $("functionList").appendChild(d);
    });
  }
  $("searchInput").oninput = e => { query = e.target.value; renderList(); };

  /* ---------- studio ---------- */
  const INT = [14,15,16,17,18,19,20,25,29];
  function sig(f) {
    const names = f.count === 3 ? ["p","r","t"] : [32,33].includes(f.id) ? ["n","r"] : f.id === 30 ? ["r"] : ["a","b"].slice(0, f.count);
    const ty = [14,15,16,17,18,19,20,29].includes(f.id) ? "int" : "double", ret = INT.includes(f.id) ? "int" : "double";
    return `${ret} ${f.fn}(${names.map(n => ty + " " + n).join(", ")});`;
  }
  function updateUI(reset) {
    const [a, b] = ftitle(active);
    $("activeEng").textContent = a; $("activeIta").textContent = b; $("activeDesc").textContent = fdesc(active); $("sigCode").textContent = sig(active);
    if (reset) { $("outputResult").textContent = "--"; $("outputResult").classList.remove("err"); delete $("outputResult").dataset.raw; }
    ["A", "B", "C"].forEach((k, i) => {
      const show = i < active.count; $("box" + k).style.display = show ? "block" : "none"; $("input" + k).required = show;
      if (reset) $("input" + k).value = "";
      $("label" + k).textContent = flabels(active) ? flabels(active)[i] : active.count === 1 ? t("val") : t("in") + " " + k;
    });
    $("boxA").style.gridColumn = active.count === 1 ? "span 2" : "auto";
    if (reset) { const h = $("consoleHeader"); h.classList.remove("pop"); void h.offsetWidth; h.classList.add("pop"); }
  }
  const showResult = (el, raw) => { el.dataset.raw = raw; el.textContent = tErr(raw); el.classList.toggle("err", raw.startsWith("Error")); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };
  $("calcForm").onsubmit = e => {
    e.preventDefault();
    const args = ["A", "B", "C"].slice(0, active.count).map(k => parseFloat($("input" + k).value));
    if (args.some(isNaN)) return showResult($("outputResult"), "Error: Invalid Inputs");
    const res = FL.call(active, args); showResult($("outputResult"), res);
    if (!res.startsWith("Error")) pushHistory(`${active.fn}(${args.join(", ")}) = ${res}`);
  };
  $("copyBtn").onclick = () => navigator.clipboard && navigator.clipboard.writeText($("outputResult").textContent);
  $("tryLab").onclick = () => { $("src").value = `${active.fn}(${[6, 2, 3].slice(0, active.count).join(", ")})`; runLab(); $("lab").scrollIntoView({ behavior: "smooth" }); };
  function pushHistory(l) { store.set("flz_hist", [l, ...store.get("flz_hist", [])].slice(0, 6)); renderHistory(); }
  function renderHistory() { const h = store.get("flz_hist", []); $("history").innerHTML = h.length ? h.map(x => `<div>${esc(x)}</div>`).join("") : `<div>${t("nothing")}</div>`; }
  $("clearHist").onclick = e => { e.preventDefault(); store.set("flz_hist", []); renderHistory(); };

  /* ---------- script lab ---------- */
  const EX = { ex_c: "raggio = 4\narea_cerchio(raggio)", ex_m: "(2 + 3) * 4 ^ 2 - 10 % 4", ex_x: "mcd(84, 36) + fibonacci(10)", ex_l: "interesse_composto(1000, 5, 3)" };
  function renderExamples() {
    $("examples").innerHTML = Object.keys(EX).map(k => `<button class="chip" data-k="${k}">${t(k)}</button>`).join("");
    $("examples").querySelectorAll(".chip").forEach(b => b.onclick = () => { $("src").value = EX[b.dataset.k]; runLab(); });
  }
  function runLab() {
    const src = $("src").value, out = FL.run(src), lx = FL.lex(src), bad = out.startsWith("Error");
    showResult($("labResult"), out); $("labResult").style.color = bad ? "#e57373" : "#7fd6a8";
    $("labTokens").innerHTML = lx.error ? `<span class="small" style="color:#e57373">${esc(tErr(lx.error))}</span>` : lx.tokens.map(([k, v]) => `<span class="tok ${k}">${esc(v)}</span>`).join("");
    if (!bad) pushHistory(src.trim().split("\n").pop() + " = " + out);
  }
  $("runLab").onclick = runLab;
  $("src").addEventListener("keydown", e => { if (e.ctrlKey && e.key === "Enter") runLab(); });

  /* ---------- hero typing demo ---------- */
  function heroDemo() {
    const lines = ["fibonacci(10)", "mcd(84, 36)", "radice(144) + pi"], el = $("heroTerm");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.innerHTML = lines.map(l => `&gt; ${l}\n<span class="ok">${FL.run(l)}</span>\n`).join(""); return; }
    let done = "", li = 0, ci = 0;
    (function tick() {
      if (li >= lines.length) { el.innerHTML = done; return; }
      const cur = lines[li];
      if (ci <= cur.length) { el.innerHTML = done + "&gt; " + esc(cur.slice(0, ci++)) + '<span class="cur">|</span>'; setTimeout(tick, 70); }
      else { done += `&gt; ${esc(cur)}\n<span class="ok">${esc(FL.run(cur))}</span>\n`; li++; ci = 0; setTimeout(tick, 600); }
    })();
  }

  /* ---------- Italia gallery: [wikiEN, wikiIT, nameEN, nameIT, cityEN, cityIT, years en|it, group] ---------- */
  const LM = [
    ["Florence_Cathedral","Cattedrale_di_Santa_Maria_del_Fiore","Florence Cathedral","Il Duomo di Firenze","Florence","Firenze","1296 - 1436","fi"],
    ["Ponte_Vecchio","Ponte_Vecchio","Ponte Vecchio","Ponte Vecchio","Florence","Firenze","1345","fi"],
    ["Uffizi","Galleria_degli_Uffizi","Uffizi Gallery","Galleria degli Uffizi","Florence","Firenze","1581","fi"],
    ["Palazzo_Vecchio","Palazzo_Vecchio","Palazzo Vecchio","Palazzo Vecchio","Florence","Firenze","1299 - 1314","fi"],
    ["Piazzale_Michelangelo","Piazzale_Michelangelo","Piazzale Michelangelo","Piazzale Michelangelo","Florence","Firenze","1869","fi"],
    ["Basilica_of_Santa_Croce,_Florence","Basilica_di_Santa_Croce_(Firenze)","Santa Croce Basilica","Basilica di Santa Croce","Florence","Firenze","1294","fi"],
    ["Colosseum","Colosseo","The Colosseum","Colosseo","Rome","Roma","70 - 80 AD|70 - 80 d.C.","ro"],
    ["Pantheon,_Rome","Pantheon_(Roma)","The Pantheon","Pantheon","Rome","Roma","126 AD|126 d.C.","ro"],
    ["Trevi_Fountain","Fontana_di_Trevi","Trevi Fountain","Fontana di Trevi","Rome","Roma","1762","ro"],
    ["Roman_Forum","Foro_romano","Roman Forum","Foro Romano","Rome","Roma","7th c. BC|VII sec. a.C.","ro"],
    ["Leaning_Tower_of_Pisa","Torre_di_Pisa","Leaning Tower of Pisa","Torre di Pisa","Pisa","Pisa","1173 - 1372","ot"],
    ["Rialto_Bridge","Ponte_di_Rialto","Rialto Bridge","Ponte di Rialto","Venice","Venezia","1591","ot"],
    ["St_Mark's_Basilica","Basilica_di_San_Marco","St Mark's Basilica","Basilica di San Marco","Venice","Venezia","1092","ot"],
    ["Milan_Cathedral","Duomo_di_Milano","Milan Cathedral","Duomo di Milano","Milan","Milano","1386 - 1965","ot"],
    ["Pompeii","Pompei","Pompeii","Pompei","Campania","Campania","7th c. BC|VII sec. a.C.","ot"],
    ["Valley_of_the_Temples","Valle_dei_Templi","Valley of the Temples","Valle dei Templi","Sicily","Sicilia","6th c. BC|VI sec. a.C.","ot"]
  ];
  
  // তোমার assets ফোল্ডারের ছবির নামগুলো এখানে বসানো হলো
  const ASSET_IMAGES = {
    "Florence_Cathedral": "Florence Cathedral.jpg",
    "Ponte_Vecchio": "Ponte Vecchio.jpg",
    "Uffizi": "Uffizi Gallery.jpg",
    "Palazzo_Vecchio": "Palazzo Vecchio.jpg",
    "Piazzale_Michelangelo": "Piazzale Michelangelo.jpg",
    "Basilica_of_Santa_Croce,_Florence": "Santa Croce Basilica.jpg",
    "Colosseum": "The Colosseum.jpg",
    "Pantheon,_Rome": "The Pantheon.jpg",
    "Trevi_Fountain": "Trevi Fountain.jpg",
    "Roman_Forum": "Roman Forum.jpg",
    "Leaning_Tower_of_Pisa": "Leaning Tower of Pisa.jpg",
    "Rialto_Bridge": "Rialto Bridge.jpg",
    "St_Mark's_Basilica": "st_marks_basilica.jpg",
    "Milan_Cathedral": "Milan Cathedral.jpg",
    "Pompeii": "Pompeii.jpg",
    "Valley_of_the_Temples": "Valley of the Temples.jpg"
  };

  const yr = s => s.split("|")[IT() && s.includes("|") ? 1 : 0], cache = {};
  const getWiki = (title, lg) => cache[lg + title] || (cache[lg + title] = fetch(`https://${lg}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(title)).then(r => r.ok ? r.json() : Promise.reject()).catch(() => null));
  const getLM = async l => (IT() && await getWiki(l[1], "it")) || await getWiki(l[0], "en");
  let grp = "all";
  
  function renderGallery() {
    $("galBar").innerHTML = ["all", "fi", "ro", "ot"].map(g => `<button class="chip ${g === grp ? "on" : ""}" data-g="${g}">${t("g_" + g)}</button>`).join("");
    $("galBar").querySelectorAll(".chip").forEach(b => b.onclick = () => { grp = b.dataset.g; renderGallery(); });
    $("gallery").innerHTML = "";
    
    LM.filter(l => grp === "all" || l[7] === grp).forEach((l, i) => {
      const c = document.createElement("div"); c.className = "arch"; c.tabIndex = 0; c.setAttribute("role", "button"); c.style.setProperty("--i", i);
      c.innerHTML = `<div class="im"></div><h5>${IT() ? l[3] : l[2]}</h5><small>${IT() ? l[5] : l[4]}, ${yr(l[6])}</small>`;
      
      // এখানে API এর বদলে লোকাল assets থেকে ছবি লোড হচ্ছে
      const imgName = ASSET_IMAGES[l[0]] || "bgd_pic.jpg"; // যদি ম্যাপে না থাকে তবে ব্যাকগ্রাউন্ড ছবি
      c.querySelector(".im").style.backgroundImage = `url('assets/${imgName}'), linear-gradient(160deg,#1f4a3a,#1c1a17)`;
      
      const open = () => openLM(l); c.onclick = open; c.onkeydown = e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open());
      $("gallery").appendChild(c);
    });
  }
  
  function openLM(l) {
    $("lmTitle").textContent = IT() ? l[3] : l[2]; $("lmMeta").textContent = `${IT() ? l[5] : l[4]}, ${yr(l[6])}`; $("lmText").textContent = t("loading"); $("lmImg").style.display = "none";
    $("lmLink").href = `https://${IT() ? "it" : "en"}.wikipedia.org/wiki/` + encodeURIComponent(IT() ? l[1] : l[0]);
    bootstrap.Modal.getOrCreateInstance($("lmModal")).show();
    
    // মোডালের ভেতরে ছবি এখনো Wikipedia API থেকেই আসবে (তুমি চেয়েছিলে API যেন থাকে)
    getLM(l).then(d => {
      $("lmText").textContent = d ? d.extract : t("nosum");
      const u = d && (d.originalimage || d.thumbnail); 
      if (u) { $("lmImg").src = u.source; $("lmImg").alt = IT() ? l[3] : l[2]; $("lmImg").style.display = "block"; }
    });
  }

  /* ---------- language ---------- */
  function badge() {
    const b = $("engineBadge"), w = FL.mode === "wasm"; b.textContent = t(w ? "b_wasm" : "b_js"); b.title = t(w ? "b_wasm_t" : "b_js_t"); b.classList.toggle("wasm", w);
  }
  function applyLang() {
    document.documentElement.lang = lang; $("langSw").dataset.l = lang;
    document.querySelectorAll("[data-l]").forEach(b => b.tagName === "BUTTON" && b.setAttribute("aria-pressed", b.dataset.l === lang));
    document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
    document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
    document.querySelectorAll("[data-i18n-title]").forEach(el => el.title = t(el.dataset.i18nTitle));
    renderChips(); renderList(); updateUI(false); renderHistory(); renderExamples(); renderGallery(); badge();
    document.querySelectorAll("[data-raw]").forEach(el => el.textContent = tErr(el.dataset.raw));
    if (!$("outputResult").dataset.raw) $("outputResult").textContent = "--";
  }
  document.querySelectorAll("#langSw button").forEach(b => b.onclick = () => {
    if (b.dataset.l === lang) return; lang = b.dataset.l; store.set("flz_lang", lang);
    document.body.classList.add("swap"); setTimeout(() => { applyLang(); document.body.classList.remove("swap"); }, 230);
  });

  /* ---------- boot ---------- */
  applyLang();
  FL.ready.then(() => { badge(); heroDemo(); runLab(); });
})();