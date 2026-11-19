/* ============================================================
   落雁镇 · 引擎
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const screenEl = $("#screen");
  const overlayEl = $("#overlay");
  const toastEl = $("#toast");

  /* ---------------- 状态 ---------------- */
  const SAVE_KEY = "luoyanzhen.save.v2";

  function freshState() {
    return {
      step: 0, page: null, stack: [],
      time: "21:40", signal: 3, battery: 87,
      flags: { box_given: 0, helped_hezhou: 0, ledger_traded: 0 },
      ev: { name: false, bones: false, ledger: false, video: false, forged: false },
      known: {}, chats: {}, unread: {}, taboo: 0,
      clues: [], places: [], sent: {},
      friends: ["zhiyao", "he"],
      nightDone: false, ended: false
    };
  }
  let S = freshState();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || typeof d.step !== "number") return false;
      S = Object.assign(freshState(), d);
      S.stack = [];
      return true;
    } catch (e) { return false; }
  }
  function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S = freshState(); }

  /* ---------------- 声音（audio.js 负责合成） ---------------- */
  function sfx(n) { try { if (window.Sound) window.Sound.sfx(n); } catch (e) {} }
  function scene(n) { try { if (window.Sound) window.Sound.scene(n); } catch (e) {} }
  function setRain(on) { document.body.classList.toggle("rain-on", !!on); }
  function setLightTop(on) { document.body.classList.toggle("light-top", !!on); }
  function soundOn() { return !(window.Sound && window.Sound.isMuted && window.Sound.isMuted()); }

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }
  function flash() {
    const d = document.createElement("div");
    d.className = "flash on";
    $("#phone").appendChild(d);
    setTimeout(() => d.remove(), 560);
    try { if (navigator.vibrate) navigator.vibrate([30, 40, 70]); } catch (e) {}
  }
  function shake() {
    const p = $("#phone");
    p.classList.add("shake");
    setTimeout(() => p.classList.remove("shake"), 480);
  }
  const pad = n => (n < 10 ? "0" + n : "" + n);

  /* ---------------- 状态栏 ---------------- */
  function syncStatus() {
    $("#sb-time").textContent = S.time;
    $("#sb-batt-num").textContent = S.battery + "%";
    const fill = $("#sb-batt-fill");
    fill.style.width = Math.max(4, Math.min(100, S.battery)) + "%";
    fill.style.background = S.battery <= 15 ? "#d63b2f" : "#cfc9bd";
    const sig = $("#sb-signal");
    sig.dataset.n = String(S.signal);
    sig.style.opacity = S.signal === 0 ? ".3" : "1";
  }

  /* ---------------- 消息 ---------------- */
  function m(from, text, time, loc) { return { from: from, text: text, time: time || S.time, loc: loc }; }
  function push(chatId, from, text, time, loc) {
    if (!S.chats[chatId]) S.chats[chatId] = [];
    S.chats[chatId].push(m(from, text, time, loc));
    if (from === "sys") { save(); return; }
    if (S.page !== "chat:" + chatId) {
      S.unread[chatId] = (S.unread[chatId] || 0) + 1;
      if (!S.ended) notify(chatId, loc ? "发来一个位置：" + loc.label : text);
      if (S.page === "app" && wxTab === "chats") renderWeChat();
    }
    save();
  }
  function pushLoc(chatId, label, place, time) {
    push(chatId, "them", label, time, { label: label, place: place });
  }
  function unreadTotal() { return Object.keys(S.unread).reduce((a, k) => a + (S.unread[k] || 0), 0); }

  function isFriend(id) { return (S.friends || []).indexOf(id) >= 0; }
  function isKnownContact(id) { return isFriend(id) || (S.chats[id] || []).length > 0; }
  function addFriend(id, silent) {
    if (!S.friends) S.friends = [];
    if (S.friends.indexOf(id) >= 0) return;
    S.friends.push(id);
    if (!silent) toast("已添加 " + CHAT_DEFS[id].name);
    save();
  }

  /* 手机横幅通知 */
  const notifQueue = [];
  let notifBusy = false;
  function notify(chatId, text) {
    notifQueue.push({ chatId: chatId, text: text });
    if (!notifBusy) showNotif();
  }
  function showNotif() {
    const el = document.getElementById("notif");
    if (!el) return;
    if (!notifQueue.length) { notifBusy = false; el.classList.remove("show"); el.innerHTML = ""; return; }
    notifBusy = true;
    const n = notifQueue.shift();
    const c = CHAT_DEFS[n.chatId];
    const icon = AVATAR_IMG[n.chatId]
      ? `<div class="nicon" style="background-image:url('${AVATAR_IMG[n.chatId]}')"></div>`
      : `<div class="nicon" style="background:linear-gradient(135deg,${c.color},#17171b)">${c.avatar}</div>`;
    el.innerHTML = `${icon}
      <div class="nbody">
        <div class="nhead"><b>${c.name}</b><span>现在</span></div>
        <div class="npre">${esc(n.text)}</div>
        <div class="napp">微信</div>
      </div>`;
    el.dataset.chat = n.chatId;
    el.classList.add("show");
    sfx("notify");
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(showNotif, 420);
    }, 3800);
  }
  function dismissNotif() {
    const el = document.getElementById("notif");
    if (el) { el.classList.remove("show"); el.dataset.chat = ""; }
    notifQueue.length = 0;
    notifBusy = false;
  }

  function seedChats() {
    S.chats = {
      zhiyao: [
        m("them", "到啦。房间比照片好看。", "21:12"),
        m("them", "我先洗个澡，你把 wifi 连一下，我想看明天下不下雨。", "21:13")
      ],
      he: [
        m("them", "203 给你们留着，门没锁。房卡在鞋柜上。", "20:58"),
        m("them", "wifi 密码在房卡背面。", "20:59")
      ],
      zhao: [], zhou: [], net: []
    };
    S.unread = { zhiyao: 2, he: 2 };
  }

  /* ---------------- 目标 / 线索 / 地点 ---------------- */
  const CLUE_DEFS = {
    card:   { t: "房卡", d: "203 / 660203" },
    bazi:   { t: "知遥的生辰", d: "丁丑年 · 三月初六 · 辰时" },
    order:  { t: "纸扎店订单", d: "881703 · 收货：赵家老宅后进" },
    jiri:   { t: "赵鹤鸣忌日", d: "一九八六年七月初七" },
    name:   { t: "她的名字", d: "陈阿棠" },
    bones:  { t: "尸骨位置", d: "祠堂后墙，砖第三排，第二块" },
    ledger: { t: "阴账", d: "一九八六至二〇二六，每一笔新娘交易" },
    proxy:  { t: "委托书", d: "婚书背面的沈宅产权委托" },
    video:  { t: "玉兰的录像", d: "二〇二二年十二月三日，她的忏悔" },
    hunsu:  { t: "婚书", d: "红纸黑字，女方写着沈知遥" },
    netid:  { t: "夜航船的微信号", d: "yhc_1987 · 只加问路的人" }
  };

  const PLACE_DEFS = {
    forum:      { label: "七闻论坛", page: "forum" },
    museum:     { label: "冥婚民俗馆", page: "museum" },
    pano:       { label: "民俗馆 · 全景", page: "pano" },
    innerhall:  { label: "未上线的内室", page: "innerhall" },
    paper:      { label: "阴宅纸扎", page: "paper" },
    paperOrder: { label: "纸扎店 · 订单", page: "paperOrder" },
    gazetteer:  { label: "《落雁镇志》", page: "gazetteer" },
    news1987:   { label: "一九八七 · 剪报", page: "news1987" },
    tMuseum:    { label: "02 号帖 · 民俗馆", page: "tMuseum" },
    shrine:     { label: "赵氏宗祠", page: "shrine" },
    boat:       { label: "渡口船屋", page: "boat" },
    storage:    { label: "赵家库房", page: "storage" },
    cctv:       { label: "民宿监控", page: "cctv" },
    cloud:      { label: "赵家云盘", page: "cloud" },
    albumLock:  { label: "知遥的云相册", page: "albumLock" }
  };

  function chapterFor(s) {
    if (s <= 2) return "第一夜 · 抵达";
    if (s <= 6) return "第一夜 · 打听";
    if (s <= 8) return "凌晨 03:33";
    if (s === 9) return "次日 · 三条线";
    if (s === 10) return "次日 · 监控";
    if (s === 11) return "深夜 · 云盘";
    return "子时 · 祠堂";
  }

  function addClue(id) {
    if (!S.clues) S.clues = [];
    if (S.clues.indexOf(id) >= 0) return;
    S.clues.push(id);
    const c = CLUE_DEFS[id];
    if (c) toast("记入线索：" + c.t);
    save();
  }

  function addPlace(id) {
    if (!PLACE_DEFS[id]) return;
    if (!S.places) S.places = [];
    if (S.places.indexOf(id) >= 0) return;
    S.places.push(id);
    save();
  }

  function goalFor() {
    const s = S.step;
    if (s <= 0) return { t: "连上民宿 Wi-Fi", d: "密码印在房卡背面。房卡就在你手边——点下面看卡。", action: { act: "show-card", label: "看房卡" } };
    if (s === 1) return { t: "完成新人祈福登记", d: "小程序 → 新人祈福登记。知遥的生日她刚发过；不会换算就点「万年历」。", action: { page: "form", label: "去登记" } };
    if (s === 2) return { t: "搜一搜「落雁镇」", d: "知遥说这地方不对劲。用浏览器地址栏搜镇名。", action: { page: "forum", label: "打开论坛" } };
    if (s === 3) {
      if (S.known.doorOpen) return { t: "西墙那块门板", d: "三件展品都看过了。转到西墙，那块门板比别处薄。", action: { page: "pano", label: "回全景" } };
      if (S.known.museum) return { t: "把三件展品看一遍", d: "全景里，展柜上有三处亮点：婚书、嫁衣、镇魂钉。点开看细节。", action: { page: "pano", label: "进全景" } };
      if (S.known.tmuseum) return { t: "去民俗馆官网", d: "帖子底部的「民俗馆官网」，进去以后找「数字馆藏」。", action: { page: "museum", label: "去官网" } };
      return { t: "先看 02 号帖", d: "论坛里那个「冥婚民俗馆，有人去过吗」，楼主进过馆，帖子底部有官网链接。", action: { page: "tMuseum", label: "看帖子" } };
    }
    if (s === 4) return { t: "查纸扎店的订单", d: "赵家订了两个纸人，备注里有一串数字。", action: { page: "paper", label: "看订单" } };
    if (s === 5) return { t: "翻《落雁镇志》", d: "民俗馆的数字馆藏里有卷七，一九八六到一九九三。", action: { page: "gazetteer", label: "翻镇志" } };
    if (s === 6) return { t: "翻完镇志，回房睡觉", d: "《落雁镇志》卷七。看完点这张卡就寝。", action: { act: "sleep", label: "就寝" } };
    if (s === 7) return { t: "门外的东西还在", d: "先听完它，再做决定。", action: null };
    if (s === 8) {
      if (!isFriend("zhao")) return { t: "门口有人找你", d: "民宿门口站着一个人，像是等了很久。", action: null };
      if (!S.known.zhaoDone) return { t: "赵鹤年在等你的答复", d: "微信里，他发来了写着你名字的婚书。", action: { chat: "zhao", label: "看微信" } };
      const need = [];
      if (!S.ev.name) need.push("祠堂讲解的频谱");
      if (!S.known.boat) need.push("船屋的收音机");
      if (!S.ev.bones) need.push("库房的密码锁");
      return {
        t: "查清 1987 年的三件事",
        d: need.length ? "周叔在微信里发了两个位置。还差：" + need.join("、") + "。" : "三件事都齐了。",
        action: need.length ? { app: "notes", label: "看手记" } : null
      };
    }
    if (s === 9) return { t: "看看昨晚的监控", d: "设置里有个「路由器管理」，进去看设备列表。", action: { app: "settings", label: "打开设置" } };
    if (s === 10) return { t: "打开夜航船发来的云盘", d: "他扒到了赵家的共享链接，问题答案在镇志里。", action: { page: "cloud", label: "打开云盘" } };
    if (s === 11) return { t: "解锁云相册", d: "密码是奶奶的忌日。知遥说过是哪一天。", action: { page: "albumLock", label: "去解锁" } };
    return { t: "子时已到，去祠堂", d: "带上你能带的所有证据。", action: { page: "live", label: "去祠堂" } };
  }

  function doGoalAction() {
    const a = goalFor().action;
    if (!a) return;
    if (a.act && ACTS[a.act]) return ACTS[a.act]();
    if (a.app) return openApp(a.app);
    if (a.page) return openPage(a.page);
    if (a.chat) return renderChat(a.chat);
  }

  /* ---------------- 导航 ---------------- */
  const CUSTOM = {};
  function isPage(id) { return !!(PAGES[id] || CUSTOM[id]); }

  function goHome() {
    S.page = "home"; S.stack = [];
    renderHome();
  }

  function pageBack() {
    const prev = S.stack.pop();
    if (prev && isPage(prev)) { S.page = null; openPage(prev, { push: false }); }
    else goHome();
  }

  function openPage(id, opts) {
    opts = opts || {};
    if (id === "home") return goHome();
    if (!isPage(id)) { toast("这个页面打不开。"); return; }

    const gate = GATES[id];
    if (gate && S.step < gate) {
      toast(GATE_MSG[id] || "现在还不是时候。");
      shake();
      return;
    }
    if (opts.push !== false && S.page && isPage(S.page)) S.stack.push(S.page);
    S.page = id;
    addPlace(id);
    scene(SCENE_BY_PAGE[id] || "room");
    setRain(false);
    setLightTop(false);
    if (CUSTOM[id]) { CUSTOM[id](); }
    else {
      const p = PAGES[id];
      if (p.scene) {
        screenEl.innerHTML = `<div class="view">
          <div class="vhead"><span class="back" data-act="page-back">‹</span><h2>${p.title}</h2></div>
          <div class="vbody" style="background:#0b0908">${p.html}</div>
        </div>`;
      } else {
        screenEl.innerHTML = pageShell(p.url, p.html);
      }
      afterPage(id);
      onPageOpen(id);
    }
    syncStatus();
    save();
  }

  const GATES = {
    shrine: 8, boat: 8, storage: 8, storageIn: 8,
    router: 9, routerHome: 9, cctv: 9,
    cloud: 10, cloudFiles: 10,
    albumLock: 11, album: 11, videoYulan: 11,
    ledgerDoc: 10, proxyDoc: 10, deathDoc: 10, crowdfund: 10,
    live: 12
  };
  const GATE_MSG = {
    shrine: "祠堂的语音导览在小程序里，白天才开。",
    boat: "船屋在渡口。等周叔主动叫你。",
    storage: "库房是六位密码——纸扎店的订单详情里有一串数字。",
    storageIn: "先开库房的门。",
    router: "从「设置 → 路由器管理」进。",
    routerHome: "先登录路由器。",
    cctv: "监控要从路由器后台进，默认密码贴在设备上。",
    cloud: "云盘地址是夜航船发给你的那条链接。",
    cloudFiles: "先进云盘。",
    albumLock: "相册密码是奶奶的忌日：十二月三日，四年前。",
    album: "先解锁相册。",
    videoYulan: "先解锁相册。",
    live: "子时还没到。先把证据凑齐。"
  };

  const SCENE_BY_PAGE = {
    cctv: "cctv", shrine: "hall", live: "hall",
    storage: "water", storageIn: "water", boat: "water",
    pano: "room", innerhall: "room", museum: "room",
    albumLock: "jail", album: "jail", videoYulan: "jail"
  };

  function pageShell(url, body, cls) {
    return `<div class="view">
      <div class="browser-top">
        <div class="urlbar">
          <span class="go" data-act="page-back">‹</span>
          <span class="lock">${url.indexOf("https") === 0 ? "🔒" : "●"}</span>
          <input id="addr" value="${esc(url)}" spellcheck="false" autocomplete="off">
          <span class="go" data-act="addr-go">前往</span>
        </div>
      </div>
      <div class="browser-body ${cls || ""}" id="bbody">${body}</div>
    </div>`;
  }

  function afterPage(id) {
    if (id === "pano") initPano();
    if (id === "boat") initBoat();
    if (id === "shrine") initShrine();
    if (id === "cctv") initCCTV();
  }

  /* ---------------- 进度 ---------------- */
  function setStep(n) {
    if (n <= S.step) return;
    for (let i = S.step + 1; i <= n; i++) onStep(i);
    S.step = n;
    save();
    if (S.page === "home") renderHome();
  }

  function onStep(i) {
    if (i === 1) {
      S.time = "21:52"; S.battery = 84;
      push("zhiyao", "them", "连上了？老板娘一直叫我「新娘子」，叫得我心里发毛。", "21:52");
      push("he", "them", "网络好啦？对了，小程序里有个新人登记，赵伯让每个新媳妇都填。", "21:55");
      push("zhiyao", "them", "登记要填我的生辰。1997 年 4 月 12 号，早上八点半，你记一下。", "21:56");
      addFriend("zhou", true);
      push("zhou", "sys", "你已添加 周叔（渡口船夫）为好友。", "21:57");
      push("zhou", "them", "船钱不急。夜里别在河边走。", "21:58");
    }
    if (i === 2) {
      S.time = "22:05";
      push("zhiyao", "them", "你搜搜「落雁镇」。我总觉得这地方不对劲。", "22:05");
    }
    if (i === 3) {
      S.time = "22:20";
      addClue("netid");
    }
    if (i === 4) {
      S.time = "22:40";
      push("zhiyao", "them", "那张照片上被剪掉脸的人……你为什么一直看。", "22:41");
    }
    if (i === 5) {
      push("net", "them", "纸扎店那个后台没退出，订单里全是赵家的东西。", "22:52");
    }
    if (i === 6) {
      S.time = "23:40"; S.battery = 71;
      push("zhiyao", "them", "我先睡了。你也早点睡。", "23:38");
    }
    if (i === 8) {
      S.time = "09:10"; S.battery = 66; S.signal = 2;
      push("zhiyao", "them", "早。老板娘说今天带我去祠堂试嫁衣，说是民俗体验。", "09:02");
      push("zhou", "them", "娃，你想知道一九八七年的事，就来渡口船屋。别让赵家的人看见。", "09:08");
      pushLoc("zhou", "渡口 · 船屋", "boat", "09:08");
      pushLoc("zhou", "赵家老宅 · 后进", "storage", "09:09");
      push("zhou", "them", "老宅后进那间库房，锁是六位的。赵家人记性差，密码从来不换。", "09:09");
      if (isFriend("net")) push("net", "them", "祠堂的讲解被剪过，你导出频谱看看。老宅后进有个库房，锁是纸扎店订单号后六位。", "09:09");
    }
    if (i === 9) {
      S.time = "15:20";
      push("he", "them", "路由器在电视柜后面。你们别乱动啊。", "15:18");
    }
    if (i === 10) {
      S.time = "18:20"; S.signal = 1; S.battery = 41;
      push("zhiyao", "them", "赵伯让我去试嫁衣，很快回来。", "18:19");
      if (isFriend("net")) push("net", "them", "赵家网盘我扒到了：pan.zhaoshi-zu.cn/s/7f3a　问题自己找答案。", "18:21");
      addPlace("cloud");
    }
    if (i === 11) {
      S.time = "23:50"; S.signal = 1; S.battery = 12;
      push("zhiyao", "them", "今天是十二月三号。奶奶的忌日。她走了四年了。", "23:47");
    }
    if (i === 12) { S.time = "00:10"; S.battery = 9; }
  }

  function onPageOpen(id) {
    if (id === "tMuseum") S.known.tmuseum = true;
    if (id === "museum") S.known.museum = true;
    if (id === "pano") S.known.museum = true;
    if (id === "cache203") setStep(3);
    if (id === "innerhall") setStep(4);
    if (id === "paperOrder") { setStep(5); addClue("order"); }
    if (id === "gazetteer") { setStep(6); addClue("jiri"); }
    if (id === "ledgerDoc") { S.ev.ledger = true; S.known.ledger = true; addClue("ledger"); }
    if (id === "proxyDoc") { S.ev.forged = true; addClue("proxy"); }
    if (id === "videoYulan") { S.ev.video = true; S.known.video = true; addClue("video"); setStep(Math.max(S.step, 12)); }
    save();
    if (id === "ledgerDoc" || id === "proxyDoc") maybeTrade();
  }

  /* ---------------- 桌面 ---------------- */
  function renderHome() {
    scene("rain"); setRain(true); setLightTop(false);
    const unread = unreadTotal();
    const g = goalFor();
    const action = g.action
      ? `<div class="gc-go" data-act="goal-go">${g.action.label || "去办"} →</div>`
      : "";
    screenEl.innerHTML = `
      <div class="view" id="home">
        <div class="wallwater">囍</div>
        <div class="clockwrap">
          <div class="bigclock">${S.time}</div>
          <div class="bigdate">${chapterFor(S.step)} · 落雁镇</div>
        </div>
        <div class="goalcard" data-act="open-notes">
          <div class="gc-top"><span>当前目标</span><span class="gc-more">手记 ›</span></div>
          <div class="gc-t">${g.t}</div>
          <div class="gc-d">${g.d}</div>
          ${action}
        </div>
        <div class="icon-grid">
          <div class="ic" data-app="chat"><div class="sq sq-wx${unread ? " badge" : ""}">微</div><span>微信</span></div>
          <div class="ic" data-app="notes"><div class="sq sq-note">记</div><span>手记</span></div>
          <div class="ic" data-app="browser"><div class="sq sq-br">浏</div><span>浏览器</span></div>
          <div class="ic" data-app="album"><div class="sq sq-ph">相</div><span>相册</span></div>
          <div class="ic" data-app="rec"><div class="sq sq-rec">录</div><span>录音</span></div>
          <div class="ic" data-app="sms"><div class="sq sq-msg">信</div><span>短信</span></div>
          <div class="ic" data-app="calendar"><div class="sq sq-cal">历</div><span>日历</span></div>
          <div class="ic" data-app="settings"><div class="sq sq-set">设</div><span>设置</span></div>
        </div>
        <div style="flex:1"></div>
        <p class="tiny" style="text-align:center;color:#4a443c;padding-bottom:12px">落雁镇 · 别在夜里应名字</p>
      </div>`;
    syncStatus();
  }

  /* ---------------- 手记 ---------------- */
  function renderNotebook() {
    S.page = "app"; setLightTop(false);
    const g = goalFor();
    const clues = (S.clues || []).map(id => CLUE_DEFS[id]).filter(Boolean);
    const places = (S.places || []).map(id => PLACE_DEFS[id]).filter(Boolean);
    const action = g.action ? `<button class="btn red" style="margin-top:12px" data-act="goal-go">${g.action.label || "去办"}</button>` : "";
    screenEl.innerHTML = `
      <div class="view">
        <div class="vhead"><span class="back" data-act="home">‹</span><h2>手记</h2></div>
        <div class="vbody" style="padding:16px 14px 30px;background:#111114">
          <div class="nb-ch">${chapterFor(S.step)}</div>
          <div class="nb-goal">
            <div class="nb-gt">${g.t}</div>
            <div class="nb-gd">${g.d}</div>
            ${action}
          </div>
          <div class="nb-sec">线索 <span>${clues.length}</span></div>
          ${clues.length ? clues.map(c => `<div class="nb-clue"><b>${c.t}</b><span>${c.d}</span></div>`).join("") : `<p class="tiny" style="color:#5f5a52">还没有记下什么。</p>`}
          <div class="nb-sec">地点 <span>${places.length}</span></div>
          <div class="nb-places">
            ${places.length ? places.map(p => `<span class="nb-place" data-go="${p.page}">${p.label}</span>`).join("") : `<p class="tiny" style="color:#5f5a52">还没有发现可去的地方。</p>`}
          </div>
          <p class="tiny" style="color:#4f4a44;margin-top:20px">手记会自动记录你看过的东西。找不到路的时候，先翻这里。</p>
        </div>
      </div>`;
  }

  /* ---------------- App ---------------- */
  function openApp(name) {
    S.page = "app";
    if (name === "browser") return renderBrowserHome();
    if (name === "chat") return renderChatList();
    if (name === "album") return openAlbumApp();
    if (name === "rec") return openRecordApp();
    if (name === "sms") return openSMS();
    if (name === "calendar") return openCalendar();
    if (name === "settings") return openSettings();
    if (name === "notes") return renderNotebook();
  }

  function renderBrowserHome() {
    screenEl.innerHTML = `<div class="view">
      <div class="vhead"><span class="back" data-act="home">‹</span><h2>浏览器</h2></div>
      <div class="browser-top" style="background:#0d0d11;border-bottom:1px solid #1e1e24">
        <div class="urlbar">
          <span class="lock">●</span>
          <input id="addr" placeholder="搜索：落雁镇 / 库房 / 船屋 / 云盘" spellcheck="false" autocomplete="off">
          <span class="go" data-act="addr-go">前往</span>
        </div>
      </div>
      <div class="browser-body" style="padding:20px;background:#0d0d10;color:#cfc9bd">
        <div style="background:#15151b;border:1px solid #2c2c34;border-radius:10px;padding:12px">
          <div class="tiny" style="color:#6f6a60">常用</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
            <span class="btn ghost" data-go="forum" style="font-size:11px;padding:6px 10px">七闻论坛</span>
            <span class="btn ghost" data-go="mini" style="font-size:11px;padding:6px 10px">落雁镇旅游</span>
            <span class="btn ghost" data-go="museum" style="font-size:11px;padding:6px 10px">冥婚民俗馆</span>
            <span class="btn ghost" data-go="paper" style="font-size:11px;padding:6px 10px">阴宅纸扎</span>
          </div>
        </div>
        <p class="tiny" style="color:#5f5a52;margin-top:16px">这里搜不到外面的世界。只能搜到落雁镇。</p>
      </div>
    </div>`;
  }

  /* ---------------- 微信 ---------------- */
  let wxTab = "chats";

  const WX_ROLE = { zhiyao: "妻子", he: "枕河居老板娘", zhao: "赵氏宗族", zhou: "渡口船夫", net: "网友" };
  const WX_ORDER = ["zhiyao", "he", "zhao", "zhou", "net"];
  const AVATAR_IMG = {
    zhiyao: "assets/av_zhiyao.jpg",
    he: "assets/av_he.jpg",
    zhao: "assets/av_zhao.jpg",
    zhou: "assets/av_zhou.jpg",
    net: "assets/av_net.jpg"
  };

  function wxAvatar(id) {
    const c = CHAT_DEFS[id];
    if (AVATAR_IMG[id]) return `<div class="wx-av img" style="background-image:url('${AVATAR_IMG[id]}')"></div>`;
    return `<div class="wx-av" style="background:linear-gradient(135deg,${c.color},#17171b)">${c.avatar}</div>`;
  }
  function tmin(t) { const p = String(t || "0:00").split(":"); return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0); }

  function renderChatList() { wxTab = "chats"; renderWeChat(); }

  function renderWeChat() {
    S.page = "app";
    setLightTop(true);
    if (wxTab === "moments") return renderMoments();
    const total = unreadTotal();
    let body = "";
    if (wxTab === "chats") body = wxChatsHTML();
    else if (wxTab === "contacts") body = wxContactsHTML();
    else if (wxTab === "discover") body = wxDiscoverHTML();
    else body = wxMeHTML();

    screenEl.innerHTML = `<div class="view"><div class="wx">
      <div class="wx-top">
        <span class="back" data-act="home">‹</span>
        <span class="t">微信${total ? "(" + total + ")" : ""}</span>
        <span class="plus" data-act="wx-add">＋</span>
      </div>
      ${wxTab === "chats" ? `<div class="wx-search"><div class="wx-searchbox">⌕ 搜索</div></div>` : ""}
      <div class="wx-list">${body}</div>
      ${wxTabsHTML()}
    </div></div>`;
  }

  function wxTabsHTML() {
    const tabs = [["chats", "微信", "ti-chat"], ["contacts", "通讯录", "ti-contacts"], ["discover", "发现", "ti-disc"], ["me", "我", "ti-me"]];
    return `<div class="wx-tabs">${tabs.map(t =>
      `<div class="wx-tab ${wxTab === t[0] ? "on" : ""}" data-act="wx-tab" data-tab="${t[0]}"><span class="ti ${t[2]}"></span><span>${t[1]}</span></div>`).join("")}</div>`;
  }

  function wxChatsHTML() {
    const ids = WX_ORDER.filter(isKnownContact);
    if (!ids.length) return `<div style="padding:70px;text-align:center;color:#b2b2b2;font-size:13px">暂无聊天</div>`;
    return ids.map(id => {
      const c = CHAT_DEFS[id], msgs = S.chats[id], last = msgs[msgs.length - 1], u = S.unread[id] || 0;
      return `<div class="wx-row" data-chat="${id}">
        ${wxAvatar(id)}
        <div class="wx-main">
          <div class="wx-name">${c.name}</div>
          <div class="wx-prev">${esc(last.text)}</div>
        </div>
        <div class="wx-meta"><div class="wx-time">${last.time}</div>${u ? `<div class="wx-badge">${u}</div>` : ""}</div>
      </div>`;
    }).join("");
  }

  function wxContactsHTML() {
    const ids = WX_ORDER.filter(isKnownContact);
    return `<div class="wx-sec">
        <div class="wx-row" data-act="wx-add">
          <div class="wx-av" style="background:#e9e9e9;color:#07c160;font-size:26px">＋</div>
          <div class="wx-main"><div class="wx-name">添加朋友</div></div>
        </div>
      </div>
      <div class="wx-group">联系人</div>` + ids.map(id => {
      const c = CHAT_DEFS[id];
      return `<div class="wx-row" data-chat="${id}">
        ${wxAvatar(id)}
        <div class="wx-main"><div class="wx-name">${c.name}</div><div class="wx-prev">${WX_ROLE[id] || ""}</div></div>
      </div>`;
    }).join("");
  }

  function renderAddFriend() {
    S.page = "app"; setLightTop(true);
    screenEl.innerHTML = `<div class="view"><div class="wx">
      <div class="wx-top">
        <span class="back" data-act="wx-contacts">‹</span>
        <span class="t">添加朋友</span>
      </div>
      <div class="wx-list" style="padding:14px">
        <div style="display:flex;align-items:center;background:#fff;border:1px solid #e2e2e2;border-radius:6px;padding:0 12px;height:40px">
          <span style="color:#b2b2b2">⌕</span>
          <input id="wx-id" placeholder="微信号 / 手机号" autocomplete="off"
            style="border:0;outline:0;flex:1;font-size:14px;margin-left:8px;background:transparent;color:#191919">
        </div>
        <button class="btn" data-act="wx-search" style="width:100%;margin-top:12px;background:#07c160;border:0;color:#fff">搜索</button>
        <div id="wx-result" style="margin-top:16px"></div>
        <p class="tiny" style="color:#b2b2b2;margin-top:20px">微信号在论坛帖子的签名里。</p>
      </div>
    </div></div>`;
  }

  function wxSearch() {
    const v = (($("#wx-id") || {}).value || "").trim().toLowerCase();
    const box = $("#wx-result");
    if (!box) return;
    if (v === "yhc_1987") {
      if (isFriend("net")) { box.innerHTML = `<div class="wx-sys">你们已经是好友了</div>`; return; }
      box.innerHTML = `<div class="wx-row" style="border:1px solid #eee;border-radius:8px">
          <div class="wx-av img" style="background-image:url('assets/av_net.jpg')"></div>
          <div class="wx-main"><div class="wx-name">夜航船</div><div class="wx-prev">微信号：yhc_1987 · 来源：七闻论坛</div></div>
        </div>
        <button class="btn" data-act="wx-add-net" style="width:100%;margin-top:12px;background:#07c160;border:0;color:#fff">添加到通讯录</button>`;
    } else {
      box.innerHTML = `<div class="wx-sys">该用户不存在</div>`;
    }
  }

  function addNetFriend() {
    if (isFriend("net")) { toast("你们已经是好友了。"); return; }
    addFriend("net", true);
    S.page = "chat:net";
    push("net", "them", "你加我了。", "22:26");
    push("net", "them", "别在微信里说太多，论坛那帮人能看到。", "22:27");
    push("net", "them", "你也住 203？", "22:28");
    addClue("netid");
    renderChat("net");
    toast("已添加 夜航船");
  }

  function wxDiscoverHTML() {
    return `<div class="wx-sec">
      <div class="wx-row" data-act="wx-moments"><div class="wx-main"><div class="wx-name">朋友圈</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
      <div class="wx-row" data-act="wx-none"><div class="wx-main"><div class="wx-name">扫一扫</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
      <div class="wx-row" data-act="wx-none"><div class="wx-main"><div class="wx-name">小程序</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
    </div>`;
  }

  function wxMeHTML() {
    return `<div class="wx-me-head">
      <div class="wx-av img" style="background-image:url('assets/av_me.jpg')"></div>
      <div><div class="wx-me-name">我</div><div class="wx-me-id">微信号：wxid_luoyan203</div></div>
    </div>
    <div class="wx-sec">
      <div class="wx-row" data-act="wx-moments"><div class="wx-main"><div class="wx-name">朋友圈</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
      <div class="wx-row" data-act="wx-none"><div class="wx-main"><div class="wx-name">收藏</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
      <div class="wx-row" data-act="wx-none"><div class="wx-main"><div class="wx-name">卡包</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
    </div>
    <div class="wx-sec">
      <div class="wx-row" data-act="wx-settings"><div class="wx-main"><div class="wx-name">设置</div></div><span style="color:#c8c8c8;font-size:16px">›</span></div>
    </div>`;
  }

  function renderMoments() {
    S.page = "app";
    setLightTop(true);
    screenEl.innerHTML = `<div class="view"><div class="wx-moments">
      <div class="wx-moments-head"><span class="back" data-act="wx-discover">‹</span></div>
      <div class="wx-post">
        <div class="ph">${wxAvatar("zhiyao")}<div><div class="pn">知遥</div><div class="pd">2022年12月3日</div></div></div>
        <div class="pt">奶奶走了。以后每年今天，我都不知道该给谁打电话。</div>
        <div class="pimgs"><div class="pimg">病房的窗</div><div class="pimg">旧木匣</div><div class="pimg">雪</div></div>
      </div>
      <div class="wx-post">
        <div class="ph">${wxAvatar("zhiyao")}<div><div class="pn">知遥</div><div class="pd">2026年10月17日</div></div></div>
        <div class="pt">到落雁镇了。老板娘一直叫我新娘子，怪怪的。</div>
      </div>
    </div></div>`;
  }

  function renderChat(id) {
    const c = CHAT_DEFS[id], msgs = S.chats[id] || [];
    S.page = "chat:" + id; S.unread[id] = 0;
    setLightTop(true);
    let prev = null;
    const body = msgs.map(x => {
      if (x.from === "sys") return `<div class="wx-sys">${esc(x.text)}</div>`;
      if (x.loc) {
        return `<div class="wx-msg them">${wxAvatar(id)}
          <div class="wx-loc" data-act="goto" data-place="${x.loc.place}">
            <div class="wl-ic">◎</div>
            <div class="wl-main"><b>${esc(x.loc.label)}</b><span>位置 · 点击前往</span></div>
          </div></div>`;
      }
      const sep = (!prev || tmin(x.time) - tmin(prev) >= 5) ? `<div class="wx-sep">${x.time}</div>` : "";
      prev = x.time;
      const av = x.from === "me"
        ? `<div class="wx-av img" style="background-image:url('assets/av_me.jpg')"></div>`
        : wxAvatar(id);
      return sep + `<div class="wx-msg ${x.from === "me" ? "me" : "them"}">${av}<div class="wx-bubble">${esc(x.text)}</div></div>`;
    }).join("");

    const opts = replyOptions(id);
    const chips = opts.length
      ? `<div class="wx-replies">${opts.map((o, i) => `<div class="wx-chip" data-act="reply" data-i="${i}">${esc(o.t)}</div>`).join("")}</div>`
      : "";

    screenEl.innerHTML = `<div class="view"><div class="wx-chat">
      <div class="wx-top">
        <span class="back" data-act="chatlist">‹</span>
        <span class="t">${c.name}</span>
        <span class="more">⋯</span>
      </div>
      <div class="wx-chat-body" id="wxbody">${body || `<div class="wx-sep">暂无消息</div>`}</div>
      ${chips}
      <div class="wx-inputbar">
        <span class="wx-icon">◉</span>
        <div class="wx-ib">${opts.length ? "点上面的选项回复" : "对方暂时没有回应"}</div>
        <span class="wx-icon">☺</span>
        <span class="wx-icon">＋</span>
      </div>
    </div></div>`;
    const b = $("#wxbody");
    if (b) b.scrollTop = b.scrollHeight;
    save();
  }

  /* ---------------- 玩家回复 ---------------- */
  function replyOptions(id) {
    const s = S.step;
    let list = [];
    if (id === "zhiyao") {
      if (s >= 11) list = [
        { t: "知遥？", sys: "消息已发出，但对方没有回应。" },
        { t: "等我。", sys: "消息已发出，但对方没有回应。" }
      ];
      else if (s >= 10) list = [
        { t: "别去。", sys: "消息已发出，但对方没有回应。" },
        { t: "我马上过来。", sys: "消息已发出，但对方没有回应。" }
      ];
      else if (s >= 8) list = [
        { t: "别去试那件衣服。", r: "可是老板娘已经在门口等我了。" },
        { t: "等我一起。", r: "那你快点。" }
      ];
      else if (s >= 2) list = [
        { t: "我搜到了，这镇子不对劲。", r: "对吧。我总觉得有人在看我。" },
        { t: "你先别出门。", r: "嗯，我把门锁了。" }
      ];
      else list = [
        { t: "连上了。", r: "好。外面雨好大。" },
        { t: "还在弄。", r: "慢慢来。" }
      ];
    } else if (id === "he") {
      list = [
        { t: "房卡密码是多少？", r: "背面印着呢，六位数。", clue: "card" },
        { t: "登记表一定要填吗？", r: "赵伯的规矩，每个新媳妇都填。" }
      ];
    } else if (id === "zhao") {
      list = S.known.zhaoDone ? [
        { t: "我不会签的。", r: "签不签，由不得你。" },
        { t: "你敢动她试试。", r: "我在帮你。你不懂。" }
      ] : [
        { t: "你想干什么？", r: "来了就知道。" }
      ];
    } else if (id === "zhou") {
      list = [
        { t: "我这就来。", r: "后门进，别走正街。" },
        { t: "1987 年到底发生了什么？", r: "……你来了再说。带瓶酒。" }
      ];
    } else if (id === "net") {
      list = [
        { t: "你是谁？", r: "一个也掉进过这个坑的人。" },
        { t: "你还查到什么？", r: "赵家的网盘。答案在镇志里。" }
      ];
    }
    const sent = (S.sent && S.sent[id]) || [];
    return list.filter(o => sent.indexOf(o.t) < 0).slice(0, 3);
  }

  function sendReply(i) {
    const m = /^chat:(\w+)$/.exec(S.page || "");
    if (!m) return;
    const id = m[1];
    const o = replyOptions(id)[Number(i)];
    if (!o) return;
    push(id, "me", o.t);
    if (!S.sent) S.sent = {};
    if (!S.sent[id]) S.sent[id] = [];
    S.sent[id].push(o.t);
    renderChat(id);
    const later = () => {
      if (o.r) push(id, "them", o.r);
      if (o.sys) push(id, "sys", o.sys);
      if (o.clue) addClue(o.clue);
      if (S.page === "chat:" + id) renderChat(id);
    };
    setTimeout(later, 900);
  }

  /* ---------------- 相册 / 短信 / 日历 / 设置 ---------------- */
  function openAlbumApp() {
    screenEl.innerHTML = `
      <div class="view">
        <div class="vhead"><span class="back" data-act="home">‹</span><h2>相册</h2></div>
        <div class="vbody" style="background:#0b0b0e">
          <div class="album">
            <div class="grid">
              <div class="cell"><div class="veil">房卡<br><b style="color:#d8c8b0;font-size:12px">203 / 660203</b></div></div>
              <div class="cell"><div class="veil">渡口<br>10.17</div></div>
              <div class="cell"><img src="assets/scene_203.jpg" alt="203 房"></div>
              <div class="cell"><div class="veil">知遥<br>窗边</div></div>
              <div class="cell"><div class="veil">晚餐<br>河鲜</div></div>
              <div class="cell"><div class="veil">客栈<br>门牌</div></div>
            </div>
            <p class="tiny" style="padding:0 14px;color:#6f6a60">共 6 张 · 本地相册</p>
            <p class="tiny" style="padding:0 14px;color:#4f4a44">云端相册需要网络与密码。</p>
          </div>
        </div>
      </div>`;
  }

  function openSMS() {
    screenEl.innerHTML = `
      <div class="view">
        <div class="vhead"><span class="back" data-act="home">‹</span><h2>短信</h2></div>
        <div class="vbody" style="padding:14px">
          <div class="hintbox" style="background:#15151b;border-color:#2c2c34;color:#9a948a">
            <b style="color:#cfc9bd">106 号段</b><br>【落雁镇旅游】您已登记「新人祈福」，请于三日内到赵氏宗祠完成仪式。回复 TD 退订。
          </div>
          <div class="hintbox" style="background:#15151b;border-color:#2c2c34;color:#9a948a">
            <b style="color:#cfc9bd">未知号码</b><br>别让她穿那件衣服。
          </div>
        </div>
      </div>`;
  }

  function openCalendar() {
    screenEl.innerHTML = `
      <div class="view">
        <div class="vhead"><span class="back" data-act="home">‹</span><h2>日历</h2></div>
        <div class="vbody" style="padding:18px">
          <div class="center" style="font-family:var(--serif)">
            <div style="font-size:13px;color:#8a857a">二〇二六年 十月</div>
            <div style="font-size:44px;margin:8px 0">十七</div>
            <div style="font-size:12px;color:#8a857a">星期六 · 宜嫁娶 · 忌远行</div>
          </div>
          <div class="hintbox" style="margin-top:24px">农历九月初七。诸事不宜。</div>
          <p class="tiny" style="color:#5f5a52;text-align:center">备忘：十二月三日 · 奶奶忌日</p>
        </div>
      </div>`;
  }

  function openSettings() {
    screenEl.innerHTML = `
      <div class="view">
        <div class="vhead"><span class="back" data-act="home">‹</span><h2>设置</h2></div>
        <div class="vbody" style="padding:14px">
          <div class="kv"><span>Wi-Fi</span><span>枕河居-203 <span class="good">已连接</span></span></div>
          <div class="kv"><span>IP 地址</span><span>192.168.1.23</span></div>
          <div class="kv"><span>信号</span><span>${S.signal} 格</span></div>
          <div class="kv"><span>电量</span><span>${S.battery}%</span></div>
          <div class="setcard" data-go="router">
            <div class="sc-ic">⌁</div>
            <div class="sc-main"><b>路由器管理</b><span>192.168.1.1 · 电视柜后面</span></div>
            <div class="sc-arrow">›</div>
          </div>
          <p class="tiny" style="color:#5f5a52;margin-top:10px">路由器背面标签：admin / 123456</p>
          <div class="soundrow">
            <span>声音</span>
            <button class="${soundOn() ? "on" : ""}" data-act="toggle-sound">${soundOn() ? "已开启" : "已静音"}</button>
          </div>
          <div class="spacer"></div>
          <p class="tiny" style="color:#5f5a52">民宿的路由器，从来没有改过默认密码。</p>
          <div class="spacer"></div>
          <button class="btn ghost w100" data-act="reset">重新开始</button>
        </div>
      </div>`;
  }

  /* ---------------- Wi-Fi / 登记 ---------------- */
  function showCard() {
    overlay(`<div class="sheet" style="text-align:center">
      <div class="bigcard">
        <div class="bc-top">枕河居 · 住客卡</div>
        <div class="bc-room">203</div>
        <div class="bc-pass">660203</div>
        <div class="bc-foot">落雁镇 · 请勿遗失</div>
      </div>
      <p style="font-size:12px;color:#8a857a;margin-top:14px">背面印着六位数字。连 Wi-Fi 时要填房号和它。</p>
      <div class="opts"><div class="opt" data-act="wifi-card">去连 Wi-Fi</div></div>
    </div>`, true);
    addClue("card");
  }

  function wifiLogin() {
    const room = (($("#w-room") || {}).value || "").trim();
    const pass = (($("#w-pass") || {}).value || "").trim();
    if (room !== CFG.room) { toast("房号不对。"); shake(); return; }
    if (pass !== CFG.wifiPass) { toast("密码不对。看看房卡背面。"); shake(); return; }
    sfx("click");
    toast("已连接 · 枕河居");
    addClue("card");
    setStep(Math.max(S.step, 1));
    openPage("mini");
  }

  function renderForm() {
    const years = ["丙子", "丁丑", "戊寅", "己卯", "庚辰"];
    const months = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
    const dayLabels = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];
    const hours = ["子时", "丑时", "寅时", "卯时", "辰时", "巳时", "午时", "未时", "申时", "酉时", "戌时", "亥时"];
    const opt = arr => arr.map(x => `<option>${x}</option>`).join("");
    screenEl.innerHTML = pageShell("app://落雁镇智慧旅游/祈福登记", `
      <div class="form">
        <h3>新人祈福登记</h3>
        <div class="sub">免费 · 凭房号登记 · 由赵氏宗祠为二位新人祈福</div>
        <p style="font-size:12px;color:#5a5346;line-height:1.8">请填写新娘的农历生辰。宗祠将据此书写庚帖，于仪式当日焚烧，以告先祖。</p>
        <label>出生年（干支）</label>
        <select id="bz-year">${opt(years)}</select>
        <div class="row">
          <div><label>农历月</label><select id="bz-month">${opt(months)}</select></div>
          <div><label>农历日</label><select id="bz-day">${opt(dayLabels)}</select></div>
        </div>
        <label>出生时辰</label>
        <select id="bz-hour">${opt(hours)}</select>
        <button data-act="bazi-submit">提交登记</button>
        <div class="agree">
          <input type="checkbox" id="bz-agree" checked>
          <span>本人已阅读并同意<a data-go="cal" style="color:#8a5a3a">《落雁镇民俗祈福仪式参与须知》</a>，同意在仪式过程中进行影像记录，并授权宗祠使用所填生辰信息。</span>
        </div>
        <p class="tiny" style="color:#9a9384;margin-top:10px">不会换算？<a data-go="cal" style="color:#8a5a3a">点此查看万年历</a></p>
      </div>`);
  }

  function baziSubmit() {
    const y = ($("#bz-year") || {}).value;
    const mo = ($("#bz-month") || {}).value;
    const d = ($("#bz-day") || {}).value;
    const h = ($("#bz-hour") || {}).value;
    if (y === CFG.bazi.year && mo === CFG.bazi.month && d === CFG.bazi.day && h === CFG.bazi.hour) {
      sfx("click");
      goHome();
      setStep(Math.max(S.step, 2));
      addClue("bazi");
      overlay(`<div class="sheet">
        <h3>登记成功</h3>
        <p>宗祠已收到沈知遥的生辰。赵伯说，明天来给你们讲讲镇上的规矩。</p>
        <p class="tiny" style="color:#7a756c">表单底部那一行小字，你并没有读完。</p>
        <div class="opts"><div class="opt" data-act="close">好</div></div>
      </div>`);
    } else {
      toast("生辰对不上。查一下万年历。");
      shake();
    }
  }

  /* ---------------- 全景 ---------------- */
  let panoUpdater = null;

  function renderPano() {
    const allSeen = !!(S.known.insp_hunshu && S.known.insp_jiayi && S.known.insp_ding);
    screenEl.innerHTML = pageShell("www.luoyan-museum.cn/pano", `
      <div class="pano-wrap">
        <div class="pano" id="pano">
          <div class="pano-strip" id="pano-strip"></div>
          <div class="pano-spot" id="spot-hunshu" data-act="inspect" data-item="hunshu"><i></i><span>婚书</span></div>
          <div class="pano-spot" id="spot-jiayi" data-act="inspect" data-item="jiayi"><i></i><span>嫁衣</span></div>
          <div class="pano-spot" id="spot-ding" data-act="inspect" data-item="ding"><i></i><span>镇魂钉</span></div>
          <div class="pano-hot" id="pano-hot" data-go="innerhall"></div>
          <div class="pano-badge">1 号展厅 · 360° 环绕</div>
          <div class="pano-hint2">${allSeen ? "西墙那块门板，比别处薄" : "左右拖动 · 展柜上有三处可以看"}</div>
        </div>
        <input class="pano-slider" id="pano-range" type="range" min="0" max="100" value="0">
      </div>`);
    initPano();
  }

  function initPano() {
    const stage = $("#pano"), strip = $("#pano-strip"), hot = $("#pano-hot"), range = $("#pano-range");
    if (!stage || !strip) return;

    const SPOTS = [
      { id: "spot-hunshu", f: 0.12, top: 44 },
      { id: "spot-jiayi", f: 0.55, top: 36 },
      { id: "spot-ding", f: 0.86, top: 62 }
    ];

    let prog = 0, py = 32;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const mod = v => ((v % 1) + 1) % 1;
    const imgW = () => (stage.clientHeight || 640) * 2.6;
    const width = () => (stage.clientWidth || 380);
    const height = () => (stage.clientHeight || 640);
    const allSeen = () => !!(S.known.insp_hunshu && S.known.insp_jiayi && S.known.insp_ding);

    const place = (el, f, top) => {
      if (!el) return;
      const x = mod(f - prog) * imgW();
      el.style.left = x + "px";
      el.style.top = top + "%";
      el.classList.toggle("on", x > 12 && x < width() - 24);
    };

    const upd = () => {
      strip.style.backgroundPosition = `${-prog * imgW()}px ${py}%`;
      SPOTS.forEach(s => place($("#" + s.id), s.f, s.top));
      if (hot) {
        const x = mod(0.72 - prog) * imgW();
        hot.style.left = x + "px";
        hot.style.top = "50%";
        hot.classList.toggle("on", allSeen() && x > 10 && x < width() - 18);
      }
    };
    panoUpdater = upd;

    if (range) range.addEventListener("input", () => { prog = Number(range.value) / 100; upd(); });

    let dragging = false, moved = false, dragEnd = 0, handled = 0, sx = 0, sy = 0, p0 = 0, y0 = 32;
    stage.addEventListener("pointerdown", e => {
      dragging = true; moved = false; dragEnd = 0;
      sx = e.clientX; sy = e.clientY; p0 = prog; y0 = py;
    });
    stage.addEventListener("pointermove", e => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
      prog = mod(p0 - dx / imgW());
      py = clamp(y0 + dy / height() * 70, 0, 100);
      if (range) range.value = Math.round(prog * 100);
      upd();
    });
    const end = () => {
      dragging = false;
      if (moved) dragEnd = Date.now();
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    stage.addEventListener("pointerleave", end);
    stage.addEventListener("pointerup", e => {
      if (moved) return;
      const el = document.elementFromPoint ? document.elementFromPoint(e.clientX, e.clientY) : null;
      const hit = el && el.closest ? el.closest("[data-act],[data-go]") : null;
      if (!hit) return;
      const act = hit.dataset.act, go = hit.dataset.go;
      if (act && ACTS[act]) { ACTS[act](hit); handled = Date.now(); }
      else if (go) { openPage(go); handled = Date.now(); }
    });
    stage.addEventListener("click", e => {
      if (Date.now() - handled < 400) { e.stopPropagation(); e.preventDefault(); return; }
      // 热点自己处理点击，不做拖拽误触拦截
      if (e.target && e.target.closest && e.target.closest("[data-act],[data-go]")) return;
      if (moved && Date.now() - dragEnd < 250) {
        e.stopPropagation(); e.preventDefault(); moved = false;
      }
    }, true);

    let hideTimer = null;
    const revealSlider = () => {
      if (!range) return;
      range.style.opacity = "1";
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { range.style.opacity = "0"; }, 2600);
    };
    stage.addEventListener("pointerup", revealSlider);
    revealSlider();

    setTimeout(() => {
      if (!S.known.doorOpen && !allSeen()) toast("展柜上有三处亮点，点开看看。");
    }, 9000);

    upd();
  }

  const EXHIBITS = {
    hunshu: {
      img: "assets/museum_hunshu.jpg", t: "龙凤婚书",
      d: "民国三十六年。双方生辰用朱笔填的。背面有一行更小的字，被火漆盖住了一半：「合婚之后，两家田宅互通。」"
    },
    jiayi: {
      img: "assets/museum_jiayi.jpg", t: "冥婚嫁衣",
      d: "清末。据说只穿过一次。凑近看，展柜内侧有一道很深的划痕，五道并排，像是有人从里面抓过。"
    },
    ding: {
      img: "assets/museum_ding.jpg", t: "镇魂钉",
      d: "三枚，出土于落雁滩第三湾。钉身缠着褪色红线。说明牌只有四个字：「钉在，魂不出。」"
    }
  };

  function inspect(item) {
    const e = EXHIBITS[item];
    if (!e) return;
    S.known["insp_" + item] = true;
    save();
    overlay(`<div class="sheet">
      <img src="${e.img}" alt="" style="width:100%;display:block;border-radius:6px;margin-bottom:12px">
      <h3>${e.t}</h3>
      <p>${e.d}</p>
      <div class="opts"><div class="opt" data-act="inspect-close">看完，放回去</div></div>
    </div>`);
  }

  function inspectClose() {
    closeOverlay();
    const all = ["hunshu", "jiayi", "ding"].every(k => S.known["insp_" + k]);
    if (all && !S.known.doorOpen) {
      S.known.doorOpen = true;
      save();
      toast("三件都看过了。西墙那块门板……好像比别处薄。");
    }
    if (panoUpdater) panoUpdater();
  }

  /* ---------------- 频谱 ---------------- */
  function initShrine() {
    const c = $("#spec");
    if (c) drawNoise(c, false);
  }

  function drawNoise(canvas, reveal) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#080605"; ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) {
      const bh = (0.25 + Math.random() * 0.75) * h * 0.32;
      ctx.fillStyle = `rgba(190,150,90,${0.10 + Math.random() * 0.18})`;
      ctx.fillRect(x, h / 2 - bh / 2, 1.4, bh);
    }
    if (reveal) {
      ctx.save();
      ctx.font = "bold 54px 'Songti SC','SimSun',serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f0d6a6";
      ctx.shadowColor = "#ffb35c"; ctx.shadowBlur = 18;
      ctx.fillText("陈 阿 棠", w / 2, h / 2 + 18);
      ctx.restore();
    }
  }

  function shrineSpectrum() {
    const spec = $("#spec");
    if (!spec) return;
    spec.style.display = "block";
    drawNoise(spec, true);
    const cap = $("#spec-cap");
    if (cap) cap.style.display = "block";
    S.ev.name = true; S.known.name = true;
    addClue("name");
    sfx("whisper");
    toast("频谱图里藏着三个字。");
    checkThree();
    save();
  }

  /* ---------------- 船屋 ---------------- */
  function initBoat() {
    const r = $("#am");
    if (!r) return;
    const upd = () => {
      const v = Number(r.value);
      $("#am-val").textContent = v + " kHz";
      const out = $("#am-out");
      if (Math.abs(v - 1314) <= 1) {
        out.innerHTML = `<span style="color:#d8c8b0">……滋……一梳梳到尾，二梳白发齐眉……</span><br><span style="color:#8a9aa4">（一个很年轻的女声，唱到一半忽然停了。）</span><br><span style="color:#c9a86a">男声（很远）：别唱了。快走。船在第三湾。</span><br><span style="color:#8a9aa4">（磁带断了。只剩水声。）</span>`;
        if (!S.known.boat) {
          S.known.boat = true;
          toast("你找到了那段磁带。");
          checkThree();
        }
      } else {
        out.innerHTML = `<span style="color:#5f6f7a">……滋滋……（白噪音）</span>`;
      }
    };
    r.addEventListener("input", upd);
    upd();
  }

  /* ---------------- 库房 ---------------- */
  function storageOpen() {
    const pass = (($("#st-pass") || {}).value || "").trim();
    if (pass === CFG.storagePass) { sfx("click"); openPage("storageIn"); }
    else { toast("锁没动。"); shake(); }
  }

  function evidenceBones() {
    if (!S.ev.bones) { S.ev.bones = true; toast("证据已保存：尸骨位置。"); addClue("bones"); }
    checkThree();
    save();
  }

  function checkThree() {
    if (S.ev.name && S.ev.bones && S.known.boat) setStep(Math.max(S.step, 9));
  }

  /* ---------------- 路由器 / 监控 ---------------- */
  function routerLogin() {
    const u = (($("#r-user") || {}).value || "").trim();
    const p = (($("#r-pass") || {}).value || "").trim();
    if (u === CFG.routerUser && p === CFG.routerPass) openPage("routerHome");
    else { toast("用户名或密码错误。设备标签上写着。"); shake(); }
  }

  function renderRouterHome() {
    screenEl.innerHTML = pageShell("http://192.168.1.1/status", `
      <div class="site" style="background:#0f1418;color:#cfe0ea;min-height:100%;padding:18px;font-family:var(--mono);font-size:12px">
        <div style="color:#5f8a72">● 已登录 · admin</div>
        <h3 style="font-family:var(--sans);color:#dbe7ee">已连接设备</h3>
        <div class="kv"><span>ZHENHEJU-203</span><span>192.168.1.23</span></div>
        <div class="kv"><span>HESHEN-PHONE</span><span>192.168.1.31</span></div>
        <div class="kv"><span>ZHAO-OLD-PC</span><span>192.168.1.8</span></div>
        <div class="kv"><span>IPCAM-01 监控主机</span><span>192.168.1.64 <span style="color:#6fb3a0;text-decoration:underline;cursor:pointer" data-go="cctv">进入 ›</span></span></div>
        <p class="tiny" style="color:#5f7a8a;margin-top:16px">IPCAM 默认密码：admin / 123456</p>
      </div>`);
  }

  function renderCCTV() {
    screenEl.innerHTML = pageShell("http://192.168.1.64/live", `
      <div class="cctv">
        <div class="screen">
          <div class="ts" id="cctv-ts">00:00:00</div>
          <div class="rec">REC</div>
          <div class="grain"></div>
          <div class="scene" id="cctv-scene">拖动时间轴查看。</div>
        </div>
        <div class="ctrl">走廊 · 203 门口 · 时间轴</div>
        <input type="range" id="cctv-range" min="0" max="240" value="0">
        <div class="camrow"><span class="on">走廊</span><span>前台</span><span>后院</span><span>祠堂</span></div>
        <div class="spacer"></div>
        <button class="btn ghost w100" data-act="cctv-end" style="font-size:11px">跳到最后一帧</button>
        <p class="tiny" style="color:#4f7a5e;margin-top:10px">录像保留 7 天。</p>
      </div>`);
    initCCTV();
  }

  function initCCTV() {
    const r = $("#cctv-range");
    if (!r) return;
    const scene = $("#cctv-scene"), ts = $("#cctv-ts");
    const upd = () => {
      const v = Number(r.value);
      ts.textContent = pad(Math.floor(v / 60)) + ":" + pad(v % 60) + ":00";
      if (v >= 235) {
        scene.innerHTML = `<div style="color:#d8b0b0">走廊尽头站着一个人。<br>穿红嫁衣，脸是对着镜头的。<br><br><span style="color:#9fe8b6">她抬起了头。</span></div>`;
        if (!S.known.ghostFrame) {
          S.known.ghostFrame = true;
          flash(); sfx("glitch");
          toast("这一帧里，没有何婶。");
          setTimeout(afterCCTV, 2200);
        }
      } else if (Math.abs(v - CFG.cctvTime) <= 2) {
        scene.innerHTML = `<div>一个穿深色外套的女人蹲在 203 门口，<br>手里捏着一把点燃的香。<br>她把一条红布从门缝塞了进去。</div>`;
      } else {
        scene.innerHTML = `<div style="color:#4f7a5e">走廊空着。声控灯亮着。</div>`;
      }
    };
    r.addEventListener("input", upd);
    upd();
  }

  function afterCCTV() {
    setStep(Math.max(S.step, 10));
    overlay(`<div class="sheet">
      <h3>18:19 · 知遥</h3>
      <p>「赵伯让我去试嫁衣，很快回来。」</p>
      <p class="tiny" style="color:#7a756c">之后她的消息再没有回音。电话打过去，是关机。</p>
      <div class="opts"><div class="opt" data-act="close">去找她</div></div>
    </div>`);
  }

  /* ---------------- 云盘 ---------------- */
  function cloudOpen() {
    const a = (($("#cloud-a") || {}).value || "").trim();
    if (a === CFG.cloudAnswer) openPage("cloudFiles");
    else { toast("问题回答错误。"); shake(); }
  }

  function maybeTrade() {
    if (S.known.trade) return;
    if (!(S.ev.ledger && S.ev.forged)) return;
    S.known.trade = true;
    setTimeout(() => {
      overlay(`<div class="sheet">
        <h3>赵鹤年</h3>
        <p>「阴账你看到了。把原件给我，我放知遥。」</p>
        <p class="tiny" style="color:#8a857a">他的语气很平静，像在谈一笔早就谈好的买卖。</p>
        <div class="opts">
          <div class="opt" data-act="trade-yes">交出阴账<small>换知遥回来</small></div>
          <div class="opt" data-act="trade-no">不交<small>他拿不到原件，也不会放人</small></div>
        </div>
      </div>`);
    }, 800);
  }

  function trade(n) {
    closeOverlay();
    if (n) {
      S.flags.ledger_traded = 1;
      push("zhao", "them", "算你识相。人明天还你。", "19:40");
    } else {
      push("zhao", "them", "那你就在柴房里想清楚。", "19:41");
    }
    jail();
  }

  function jail() {
    setStep(Math.max(S.step, 11));
    S.signal = 0; syncStatus();
    overlay(`<div class="sheet">
      <h3>柴房</h3>
      <p>门从外面锁了。窗户钉着木条。</p>
      <p>知遥的发卡在你口袋里。你掰开它，里面藏着一张 SIM 卡——她把卡取出来，塞进了发卡。</p>
      <p class="tiny" style="color:#8a857a">你换上卡。信号只有一格。云相册需要密码——你想起知遥说过，奶奶是四年前的十二月三日走的。</p>
      <div class="opts"><div class="opt" data-act="open-album-lock">打开云相册</div></div>
    </div>`);
  }

  function openAlbumLock() {
    closeOverlay();
    S.signal = 1; syncStatus();
    openPage("albumLock");
  }

  function albumOpen() {
    const p = (($("#album-pass") || {}).value || "").trim();
    if (p === CFG.albumPass) openPage("album");
    else { toast("密码不对。"); shake(); }
  }

  /* ---------------- 祠堂 / 结局 ---------------- */
  function renderLive() {
    const ev = S.ev;
    const count = [ev.name, ev.bones, ev.ledger, ev.video, ev.forged].filter(Boolean).length;
    screenEl.innerHTML = pageShell("app://直播/落雁镇祠堂", `
      <div class="site" style="background:#0a0707;color:#d8cbb8;min-height:100%;padding:18px">
        <img src="assets/scene_shrine.jpg" alt="祠堂" style="width:100%;display:block;border-radius:6px;margin-bottom:12px;filter:brightness(.82) contrast(1.05)">
        <div style="border:1px solid #3a1a1a;padding:12px;background:#120a0a">
          <div style="font-size:10px;color:#c96a5a;letter-spacing:2px">● 直播中 · 信号 1 格</div>
          <p style="font-family:var(--serif);font-size:13px;line-height:2;color:#c9b8a0;margin-top:8px">
            祠堂里点着红烛。知遥穿着嫁衣，站在供桌旁。赵鹤年在念婚书。二十几个镇民围在门口。
          </p>
        </div>
        <div style="margin-top:14px">
          ${evItem("阿棠的名字", ev.name)}
          ${evItem("尸骨的位置", ev.bones)}
          ${evItem("阴账", ev.ledger)}
          ${evItem("玉兰的录像", ev.video)}
          ${evItem("伪造的婚书", ev.forged)}
        </div>
        <p class="tiny" style="color:#8a7a66;margin-top:10px">证据 ${count} / 5 · 仪式已经开始</p>
        <div class="mt">
          <button class="btn red w100" data-act="end-bad">掀翻供桌，烧掉婚书</button>
          <div class="spacer"></div>
          <button class="btn w100" data-act="end-eerie">站着不动，让仪式走完</button>
          <div class="spacer"></div>
          <button class="btn w100" data-act="end-true" style="background:#3a2a1e">把手机架上供桌，开直播</button>
        </div>
      </div>`);
  }

  function evItem(name, ok) {
    return `<div class="kv" style="border-color:#2a1a1a"><span>${name}</span><span style="color:${ok ? "#7fbf9a" : "#8a3a3a"}">${ok ? "已掌握" : "缺失"}</span></div>`;
  }

  function tryTrue() {
    const ev = S.ev;
    const count = [ev.name, ev.bones, ev.ledger, ev.video, ev.forged].filter(Boolean).length;
    if (!ev.name) {
      overlay(`<div class="sheet"><h3>你喊不出她的名字</h3><p>你手里有证据，但你不知道她叫什么。祠堂里没有人会告诉你。</p><div class="opts"><div class="opt" data-act="close">再想想</div></div></div>`);
      return;
    }
    if (count < 4) {
      overlay(`<div class="sheet"><h3>证据不够</h3><p>你念出来的东西，镇民可以当作疯话。至少还需要 ${4 - count} 件能当场对质的东西。</p><div class="opts"><div class="opt" data-act="close">再想想</div></div></div>`);
      return;
    }
    showEnding("true");
  }

  let endingCtx = null;

  function showEnding(key) {
    const e = ENDINGS[key];
    S.ended = true; save();
    setRain(false);
    document.body.classList.add("ending-on");
    scene("hall");
    sfx("bell");

    const paras = String(e.body).split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    const el = document.createElement("div");
    el.id = "ending";
    el.innerHTML = `
      <div class="et">${e.title}</div>
      <div class="ec">${e.code}</div>
      <div class="eb" id="ebody"></div>
      <div class="el" id="enote">${esc(e.note)}</div>
      <div class="again" id="eagain"><button data-act="restart">从头再来</button></div>
      <button class="skip" data-act="skip-ending">跳过</button>`;
    $("#phone").appendChild(el);

    endingCtx = { el: el, paras: paras, cues: (e.cues || []).map(c => ({ at: c.at, s: c.s, done: false })), i: 0, skipped: false };
    runEnding(endingCtx);
  }

  function runEnding(ctx) {
    const total = ctx.paras.length;
    const body = ctx.el.querySelector("#ebody");
    const next = () => {
      if (ctx.skipped) return;
      if (ctx.i >= total) { finishEnding(ctx); return; }
      const i = ctx.i++;
      const p = document.createElement("p");
      p.className = "eline";
      p.textContent = ctx.paras[i];
      if (body) body.appendChild(p);
      setTimeout(() => { try { p.classList.add("show"); } catch (e) {} }, 30);
      try { ctx.el.scrollTop = ctx.el.scrollHeight; } catch (e) {}

      const frac = total <= 1 ? 1 : i / (total - 1);
      ctx.cues.forEach(c => { if (!c.done && frac >= c.at) { c.done = true; sfx(c.s); } });

      const len = ctx.paras[i].length;
      setTimeout(next, Math.min(3000, 850 + Math.min(1700, len * 34)));
    };
    next();
  }

  function finishEnding(ctx) {
    const note = ctx.el.querySelector("#enote");
    const again = ctx.el.querySelector("#eagain");
    if (note) note.classList.add("show");
    if (again) again.classList.add("show");
    try { ctx.el.scrollTop = ctx.el.scrollHeight; } catch (e) {}
  }

  /* ---------------- 弹层 ---------------- */
  function overlay(html, center) {
    overlayEl.innerHTML = html;
    overlayEl.classList.remove("hidden");
    overlayEl.classList.toggle("center", !!center);
  }
  function closeOverlay() { overlayEl.classList.add("hidden"); overlayEl.innerHTML = ""; }

  /* ---------------- 交互 ---------------- */
  function openDoor() {
    S.taboo++;
    flash(); shake(); sfx("creak"); sfx("glitch");
    overlay(`<div class="sheet">
      <h3>门外</h3>
      <p>走廊里没有人。</p>
      <p>只有一个纸人，靠墙站着，脸朝着你的门。纸人的眼睛是两颗黑色的纽扣，在动。</p>
      <p class="tiny" style="color:#8a857a">你关上门，反锁。手在抖。红盖头还在你脚边。</p>
      <div class="opts"><div class="opt" data-act="after-door">回到床上</div></div>
    </div>`);
  }

  function stayDoor() {
    overlay(`<div class="sheet">
      <h3>门外</h3>
      <p>你没有动。</p>
      <p>唱嫁歌的声音在门口停了一会儿，然后慢慢走远了。脚步声很轻，像没穿鞋。</p>
      <div class="opts"><div class="opt" data-act="after-door">回到床上</div></div>
    </div>`);
  }

  function afterDoor() {
    closeOverlay();
    S.nightDone = true;
    S.ev.forged = true;
    setStep(Math.max(S.step, 8));
    goHome();
    setTimeout(() => toast("再醒来时，天已经亮了。昨夜的雨停了。"), 500);
    setTimeout(meetZhao, 1400);
  }

  function meetZhao() {
    if (isFriend("zhao")) return;
    overlay(`<div class="sheet">
      <h3>早上 · 民宿门口</h3>
      <p>赵鹤年站在雨棚下，穿着中山装，手里拎一把黑伞。他像是等了很久。</p>
      <p>「加个微信吧。」他说，「镇上的事，方便说。」</p>
      <div class="opts"><div class="opt" data-act="meet-zhao-go">掏出手机，通过</div></div>
    </div>`, true);
  }

  function meetZhaoGo() {
    closeOverlay();
    addFriend("zhao", true);
    S.page = "chat:zhao";
    push("zhao", "sys", "你已添加 赵鹤年 为好友。", "09:10");
    push("zhao", "them", "沈知遥的家属？我是赵鹤年。", "09:11");
    push("zhao", "them", "沈家 1987 年欠赵家一个新娘。玉兰跑了，债没跑。", "09:12");
    push("zhao", "them", "今夜子时之前，把玉兰留下的匣子送到祠堂。不然，阿棠自己来取。", "09:13");
    renderChat("zhao");
    setTimeout(zhaoTrade, 3200);
  }

  function zhaoTrade() {
    overlay(`<div class="sheet">
      <h3>赵鹤年</h3>
      <p>「匣子给我。我把这件事了了。你们明天就能走。」</p>
      <p class="tiny" style="color:#8a857a">他发来一张照片：红纸婚书，女方的名字已经写好——沈知遥。</p>
      <div class="opts">
        <div class="opt" data-act="give-box">交出木匣<small>换一个平安离开的承诺</small></div>
        <div class="opt" data-act="keep-box">不交<small>事情不对，不能给他</small></div>
      </div>
    </div>`);
  }

  function giveBox() {
    S.flags.box_given = 1;
    S.known.zhaoDone = true;
    addClue("hunsu");
    push("zhao", "them", "识相。今晚子时，来祠堂。", "09:20");
    goHome();
    overlay(`<div class="sheet">
      <h3>木匣</h3>
      <p>你把匣子给了他。他没有打开，只是掂了掂，像在称一件旧东西的分量。</p>
      <p class="tiny" style="color:#8a857a">匣子里的银锁和庚帖，你没有来得及看。</p>
      <div class="opts"><div class="opt" data-act="close">回去</div></div>
    </div>`);
  }

  function keepBox() {
    S.known.zhaoDone = true;
    addClue("hunsu");
    push("zhao", "them", "那就等阿棠来。", "09:20");
    goHome();
    overlay(`<div class="sheet">
      <h3>木匣</h3>
      <p>你把匣子塞进背包最底层。</p>
      <p class="tiny" style="color:#8a857a">匣子里有一把银锁，锁面上刻着一个「棠」字。还有一张庚帖，生辰不是知遥的，是玉兰的。</p>
      <div class="opts"><div class="opt" data-act="close">回去</div></div>
    </div>`);
  }

  /* ---------------- 录音 ---------------- */
  function openRecordApp() {
    screenEl.innerHTML = `
      <div class="view">
        <div class="vhead"><span class="back" data-act="home">‹</span><h2>录音机</h2></div>
        <div class="vbody" style="padding:18px">
          <div class="center" style="margin-top:10px">
            <div style="font-size:40px;font-weight:200;letter-spacing:2px;color:#d8d2c6">00:12</div>
            <div class="tiny" style="color:#8a857a">录音 001 · 10月17日 03:33</div>
          </div>
          <canvas id="wave" width="640" height="180" style="width:100%;margin-top:16px;background:#0e0e12;border:1px solid #22222a;border-radius:6px"></canvas>
          <div id="wave-text" class="center tiny" style="color:#8a857a;margin-top:12px">波形很乱，像是被什么东西压过。</div>
          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn w100" data-act="play-wave">播放</button>
            <button class="btn red w100" data-act="reverse-wave">倒放</button>
          </div>
          <div class="hintbox" style="margin-top:18px">录音是在我们睡着以后自动开始的。我不记得按过录音键。</div>
        </div>
      </div>`;
    drawWave(false);
  }

  function drawWave(reversed) {
    const c = $("#wave");
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    ctx.fillStyle = "#0e0e12"; ctx.fillRect(0, 0, w, h);
    const bars = 120;
    for (let i = 0; i < bars; i++) {
      const t = reversed ? (bars - i) : i;
      const s = Math.sin(t * 12.9898) * 43758.5453;
      const r = s - Math.floor(s);
      const bh = (0.12 + r * (reversed ? 0.7 : 0.42)) * h * 0.8;
      ctx.fillStyle = reversed ? "rgba(214,59,47,.75)" : "rgba(180,170,150,.5)";
      ctx.fillRect(i * (w / bars), h / 2 - bh / 2, (w / bars) - 1.5, bh);
    }
  }

  function playWave() { sfx("tape"); toast("（沙沙声，听不清）"); }

  function reverseWave() {
    if (S.step < 6) { toast("录音是空的。外面还没有动静。"); return; }
    drawWave(true);
    const t = $("#wave-text");
    if (t) t.innerHTML = `<span style="color:#d68a7a;font-size:15px;letter-spacing:6px">把 我 的 匣 子 给 我</span><br><span style="color:#7a756c">倒放之后，是一句很轻的女声。她说的是「匣子」，不是「名字」。</span>`;
    if (!S.known.reverse) {
      S.known.reverse = true;
      setStep(Math.max(S.step, 7));
      setTimeout(() => { if (!S.nightDone) nightChoice(); }, 1400);
    }
  }

  function sleepSequence() {
    if (S.nightDone) return;
    sfx("knock");
    overlay(`<div class="sheet">
      <h3>03:33</h3>
      <p>咚。咚。咚。</p>
      <p>门外有人在唱嫁歌。一句，停一句。</p>
      <p class="tiny" style="color:#8a857a">「一梳梳到尾，二梳白发齐眉，三梳……」</p>
      <div class="opts"><div class="opt" data-act="night-2">继续听</div></div>
    </div>`);
  }

  function nightChoice() {
    if (S.nightDone) return;
    overlay(`<div class="sheet">
      <h3>03:41</h3>
      <p>门缝底下塞进来一条红盖头。门外很安静，安静得能听见布料摩擦地面的声音。</p>
      <div class="opts">
        <div class="opt" data-act="open-door">开门<small>看看外面到底是谁</small></div>
        <div class="opt" data-act="stay-door">不开<small>把被子蒙过头顶</small></div>
      </div>
    </div>`);
  }

  /* ---------------- 搜索 ---------------- */
  function doSearch() {
    const input = $("#addr");
    const q = input ? input.value.trim() : "";
    if (!q) return;
    if (/zhaoshi/i.test(q)) return openPage("cloud");
    if (/7wen|bbs/i.test(q)) return openPage("forum");
    if (/luoyan-museum/i.test(q)) return openPage("museum");
    if (/^(https?|app):\/\//i.test(q)) { toast("这个地址被本镇屏蔽了。换个关键词搜。"); return; }
    const map = [
      [/落雁镇|论坛|203|七闻/, "forum"],
      [/阴婚|冥婚|民俗|祠堂|导览|赵氏/, "museum"],
      [/纸扎|纸人|订单/, "paper"],
      [/镇志|地方志|县志/, "gazetteer"],
      [/剪报|女尸|一九八七|1987/, "news1987"],
      [/云盘|网盘|zhaoshi/, "cloud"],
      [/路由器|监控|ipcam|192\.168/, "router"],
      [/相册|album/, "albumLock"],
      [/众筹|何舟/, "crowdfund"],
      [/民宿|枕河居/, "mini"]
    ];
    for (const [re, page] of map) if (re.test(q)) { openPage(page); return; }
    openPage("errorPage");
  }

  /* ---------------- 事件 ---------------- */
  const ACTS = {
    "home": goHome,
    "chatlist": renderChatList,
    "page-back": pageBack,
    "close": closeOverlay,
    "wifi-card": () => { closeOverlay(); openApp("browser"); openPage("portal"); },
    "show-card": showCard,
    "wifi-login": wifiLogin,
    "bazi-submit": baziSubmit,
    "shrine-spectrum": shrineSpectrum,
    "storage-open": storageOpen,
    "evidence-bones": evidenceBones,
    "router-login": routerLogin,
    "cloud-open": cloudOpen,
    "album-open": albumOpen,
    "open-album-lock": openAlbumLock,
    "open-cloud": () => openPage("cloud"),
    "play-wave": playWave,
    "reverse-wave": reverseWave,
    "sleep": sleepSequence,
    "night-2": nightChoice,
    "open-door": openDoor,
    "stay-door": stayDoor,
    "after-door": afterDoor,
    "meet-zhao-go": meetZhaoGo,
    "give-box": giveBox,
    "keep-box": keepBox,
    "trade-yes": () => trade(true),
    "trade-no": () => trade(false),
    "donate": donate,
    "end-bad": () => showEnding("bad"),
    "end-eerie": () => showEnding("eerie"),
    "end-true": tryTrue,
    "go-live": () => openPage("live"),
    "goal-go": doGoalAction,
    "open-notes": renderNotebook,
    "inspect": (el) => inspect(el && el.dataset ? el.dataset.item : ""),
    "inspect-close": inspectClose,
    "goto": (el) => { if (el && el.dataset && el.dataset.place) openPage(el.dataset.place); },
    "reply": (el) => sendReply(el && el.dataset ? Number(el.dataset.i) : 0),
    "addr-go": doSearch,
    "wx-tab": (el) => { wxTab = (el && el.dataset && el.dataset.tab) || "chats"; renderWeChat(); },
    "wx-add": renderAddFriend,
    "wx-contacts": () => { wxTab = "contacts"; renderWeChat(); },
    "wx-search": wxSearch,
    "wx-add-net": addNetFriend,
    "wx-moments": () => { wxTab = "moments"; renderMoments(); },
    "wx-discover": () => { wxTab = "discover"; renderWeChat(); },
    "wx-settings": () => openSettings(),
    "wx-none": () => toast("该功能不在这个故事里。"),
    "forum-search": () => {
      const q = (($("#f-q") || {}).value || "").trim();
      if (!q) { toast("输入关键词。"); return; }
      if (/203|新娘|落雁/.test(q)) openPage("post203");
      else if (/阴婚|冥婚|民俗/.test(q)) openPage("museum");
      else if (/纸扎|纸人/.test(q)) openPage("paper");
      else toast("没有找到相关帖子。");
    },
    "reset": () => { wipe(); location.reload(); },
    "restart": () => { wipe(); location.reload(); },
    "toggle-sound": () => {
      if (window.Sound) window.Sound.toggleMute();
      toast(soundOn() ? "声音已开启" : "已静音");
      openSettings();
    },
    "skip-ending": () => {
      if (!endingCtx) return;
      endingCtx.skipped = true;
      const body = endingCtx.el.querySelector("#ebody");
      if (body) body.innerHTML = endingCtx.paras.map(t => `<p class="eline show">${esc(t)}</p>`).join("");
      finishEnding(endingCtx);
    },
    "intro-go": closeOverlay,
    "cctv-end": () => {
      const r = $("#cctv-range");
      if (r) { r.value = 240; r.dispatchEvent(new Event("input")); }
    }
  };

  document.addEventListener("click", function (e) {
    const t = e.target;
    const appEl = t.closest("[data-app]");
    const chatEl = t.closest("[data-chat]");
    const goEl = t.closest("[data-go]");
    const actEl = t.closest("[data-act]");

    if (appEl) { openApp(appEl.dataset.app); return; }
    if (chatEl) {
      if (chatEl.id === "notif") dismissNotif();
      closeOverlay();
      renderChat(chatEl.dataset.chat);
      return;
    }
    if (goEl) { openPage(goEl.dataset.go); return; }
    if (!actEl) return;

    const act = actEl.dataset.act;
    if (ACTS[act]) { ACTS[act](actEl); return; }

    if (act === "text-layer") {
      const line = $("#gaz-redact-line");
      if (line) line.innerHTML = `原文此处有墨污，似为后人涂改。<br><span class="sel" style="font-size:15px;letter-spacing:2px">陈阿棠</span>`;
      toast("文本层还原：陈阿棠。");
      S.ev.name = true; S.known.name = true;
      addClue("name");
      checkThree(); save();
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "pano-range") {
      /* handled in initPano */
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target && e.target.id === "addr") { e.preventDefault(); doSearch(); }
  });

  function donate() {
    if (S.flags.helped_hezhou) { toast("你已经捐过了。"); return; }
    S.flags.helped_hezhou = 1;
    toast("你捐了 200 元。");
    const el = $("#cf-note");
    if (el) el.textContent = "已捐款 200 元 · 匿名";
    save();
  }

  /* ---------------- 启动 ---------------- */
  const notifEl = document.getElementById("notif");
  if (notifEl) {
    notifEl.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = notifEl.dataset.chat;
      if (!id) return;
      dismissNotif();
      closeOverlay();
      renderChat(id);
    });
  }

  document.getElementById("boot-btn").addEventListener("click", function () {
    if (window.Sound) { window.Sound.init(); window.Sound.resume(); window.Sound.scene("rain"); }
    setRain(true);
    const restored = load();
    document.getElementById("boot").classList.add("gone");
    if (restored && S.step > 0 && !S.ended) {
      goHome(); toast("已恢复进度。"); return;
    }
    S = freshState();
    seedChats();
    goHome();
    setTimeout(() => {
      overlay(`<div class="sheet">
        <h3>10 月 17 日 · 雨</h3>
        <p>我们结婚的第七天，到了落雁镇。</p>
        <p>知遥说，这是她奶奶的故乡。</p>
        <p>她说，她从来没来过这里。</p>
        <div class="opts"><div class="opt" data-act="intro-go">走进民宿</div></div>
      </div>`, true);
    }, 400);
  });

  CUSTOM.form = renderForm;
  CUSTOM.pano = renderPano;
  CUSTOM.live = renderLive;
  CUSTOM.cctv = renderCCTV;
  CUSTOM.routerHome = renderRouterHome;

  seedChats();
  goHome();
  syncStatus();

  /* 调试接口（供自动化冒烟测试） */
  window.__LYZ = {
    get state() { return S; },
    openPage: openPage,
    openApp: openApp,
    openChat: renderChat,
    goHome: goHome,
    setStep: setStep,
    showEnding: showEnding,
    goal: goalFor,
    notebook: renderNotebook,
    act: function (n, el) { if (ACTS[n]) return ACTS[n](el); return null; }
  };

  /* 开发/验收用：地址栏加 #dev 跳过开场，#dev&page=forum 直达某页 */
  if (location.hash.indexOf("#dev") === 0) {
    document.getElementById("boot").classList.add("gone");
    S.step = 12; S.signal = 1; S.battery = 55;
    S.ev = { name: true, bones: true, ledger: true, video: true, forged: true };
    const mm = location.hash.match(/page=([\w]+)/);
    if (mm) openPage(mm[1]); else goHome();
  }
})();
