/* checkin.js — 2026-08-07 从 checkin.html 的内联 <script> 原样搬出，逻辑零改动。
   仍是同步 classic script、仍挂在 </body> 前，所以解析到它时 markup 已就位，
   顶层那些 $("chConfirmDel") 之类的取元素照常拿得到（别改成 defer/module）。 */
/* =========================================================================
   打卡引擎——从 frontend/js/views/lccheckin.js 的 Practice 实例移植（该视图
   2026-08-05 起从 Life OS 下架，这里是唯一入口）。两处刻意的简化：
   - 题目目录直接读 window.LC_ANIM_DATA（sidebar.js 在本页顶部已同步执行，
     不再需要 Life OS 里 fetch 源码 + 假 window 跑一遍的 hack）；
   - 打卡仍写 source='practice'，跟历史记录和 Class 页的展示区分保持连续。
   SM-2 逻辑、常量、配色与 lccheckin.js / notes.js 保持一致，改一处要同步。
   ========================================================================= */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);

  /* ---------- 常量：分数配色 / 打卡格式（评分标准文案看题目页的 Rubric 卡） ---------- */
  const SCORE_BG = {
    0: "rgba(224,110,140,0.28)", 1: "rgba(199,130,190,0.28)", 2: "rgba(150,140,220,0.28)",
    3: "rgba(120,160,225,0.28)", 3.5: "rgba(106,181,195,0.30)", 4: "rgba(93,202,165,0.32)", 5: "rgba(29,158,117,0.38)"
  };
  const MODES = [
    { k: "paper", label: "Paper", icon: "📝", group: "written" },
    { k: "computer", label: "Computer", icon: "💻", group: "written" },
    { k: "script", label: "Speak with Myself", icon: "🗣️", group: "spoken" },
    { k: "mock_gpt", label: "Mock w/ GPT", icon: "🤖", group: "spoken" }
  ];
  const MODE_BY_KEY = Object.fromEntries(MODES.map(m => [m.k, m]));
  /* 列表里格式/来源只显示 icon（label 收进 title 悬停提示）：[Speak with
     Myself] 这种长文字会把到期徽章挤到重叠。表单里的选择按钮仍是全文字。 */
  const modeChip = k => String(k || "").split(",").map(x => {
    const m = MODE_BY_KEY[x];
    return m ? '<span class="lch-mode-chip" title="' + m.label + '">' + m.icon + "</span>" : "";
  }).join("");
  /* 来源（For）跟 Format 一样只是打卡的一个参数：表单里一组选择按钮，
     落库还是同一张 lc_checkins 表的 source 列，列表里显示 [Practice]/[Class] */
  const SOURCES = [
    { k: "practice", label: "Practice", icon: "🎯" },
    { k: "class", label: "Class", icon: "📚" }
  ];
  const SOURCE_META = Object.fromEntries(SOURCES.map(s => [s.k, s]));
  const sourceChip = k => {
    const s = SOURCE_META[k];
    return s ? '<span class="lch-src-chip">[' + s.label + "]</span>" : "";
  };

  /* ---------- 小工具 ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
      "-" + String(d.getDate()).padStart(2, "0");
  }
  const todayStr = () => isoDate(new Date());
  function parseISODate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
  function addDaysISO(iso, n) { const d = parseISODate(iso); d.setDate(d.getDate() + n); return isoDate(d); }
  function diffDays(a, b) { return Math.round((parseISODate(b) - parseISODate(a)) / 864e5); }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function md(s) { return s ? MONTHS[Number(s.slice(5, 7)) - 1] + " " + Number(s.slice(8, 10)) : "—"; }
  function api(method, path, body) {
    return fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    }).then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.status === 204 ? null : r.json();
    });
  }

  /* SM-2：从头重放全部打卡历史推导 ef / reps / interval / nextReview。
     分数 ≥3 通过（间隔 1 → 6 → ×EF），≤2 重置 reps、明天再来；EF 下限 1.3。 */
  function replay(item) {
    let ef = 2.5, reps = 0, interval = 0, next = null;
    const hist = [...(item.history || [])].sort((a, b) => (a.ts < b.ts ? -1 : 1));
    for (const h of hist) {
      const q = h.score;
      if (q >= 3) {
        if (reps === 0) interval = 1;
        else if (reps === 1) interval = 6;
        else interval = Math.round(interval * ef);
        reps += 1;
        ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
      } else {
        reps = 0;
        interval = 1;
      }
      next = addDaysISO(h.ts.slice(0, 10), interval);
    }
    item.ef = Math.round(ef * 100) / 100;
    item.reps = reps;
    item.interval = interval;
    item.nextReview = next;
    return item;
  }

  /* ---------- 题目目录：sidebar.js 已赋好的 LC_ANIM_DATA ---------- */
  const CH_INDEX = { byLabel: {}, byNum: {} };
  // label → 动画/笔记页文件名（LC_ANIM_DATA 的 p.file，sidebar.js 派生：有
  // 动画用真动画页，没有就是 placeholder.html?num=…，两种都是跟 checkin.html
  // 同一目录下的相对路径，不用像 notes.js 那样再拼 BASE/origin）。
  const CH_FILE = {};
  (function buildCatalog() {
    const d = window.LC_ANIM_DATA;
    if (!d) return;
    const add = (problems, chapterTitle) => problems.forEach(p => {
      const label = p.num ? p.num + ". " + p.name : p.name;
      if (!(label in CH_INDEX.byLabel)) CH_INDEX.byLabel[label] = chapterTitle;
      if (p.num != null && !(p.num in CH_INDEX.byNum)) CH_INDEX.byNum[p.num] = { chapter: chapterTitle, label };
      if (!(label in CH_FILE) && p.file) CH_FILE[label] = p.file;
    });
    d.chapters.forEach(ch => ch.sections.forEach(sec => add(sec.problems, ch.title)));
    d.others.sections.forEach(sec => add(sec.problems, d.others.title));
  })();

  function shortChapter(t) { const i = t.indexOf("·"); return i > -1 ? t.slice(0, i).trim() : t; }
  function resolveChapter(name) {
    if (CH_INDEX.byLabel[name] != null) return CH_INDEX.byLabel[name];
    const m = String(name).match(/^(\d+)/);
    if (m && CH_INDEX.byNum[Number(m[1])]) return CH_INDEX.byNum[Number(m[1])].chapter;
    return null;
  }
  function noteLink(name) {
    if (CH_FILE[name] != null) return CH_FILE[name];
    const m = String(name).match(/^(\d+)/);
    if (m && CH_INDEX.byNum[Number(m[1])]) return CH_FILE[CH_INDEX.byNum[Number(m[1])].label] || null;
    return null;
  }
  const chapterTag = name => {
    const ch = resolveChapter(name);
    const m = ch && shortChapter(ch).match(/Chapter\s+(\d+)/i);
    return m ? '<span class="lch-chapter">Ch ' + esc(m[1]) + "</span>" : '<span class="lch-chapter">—</span>';
  };

  /* ---------- 数据：后端行 → 按题目分组的 items ---------- */
  let rows = [];
  let items = {};
  let itemOrder = [];

  function buildItems() {
    const grouped = {};
    rows.forEach(r => {
      const it = grouped[r.name] || (grouped[r.name] = { name: r.name, history: [] });
      it.history.push({ ts: r.ts, score: r.score, mode: r.mode, source: r.source, note: r.note });
    });
    Object.values(grouped).forEach(replay);
    items = grouped;
  }

  const scoreChip = s =>
    '<span class="lch-score-chip" style="background:' + SCORE_BG[s] + '">' + s + "</span>";

  function nextBadge(next, t) {
    if (!next) return '<span class="lch-badge soon">—</span>';
    const d = diffDays(t, next);
    if (d < 0) return '<span class="lch-badge overdue">Overdue ' + (-d) + "d</span>";
    if (d === 0) return '<span class="lch-badge today">Due today</span>';
    return '<span class="lch-badge soon">' + md(next) + " · in " + d + "d</span>";
  }

  let toastTimer = null;
  function toast(msg) {
    const box = $("chToast");
    box.textContent = msg;
    box.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove("show"), 2600);
  }

  /* ---------- 删除确认（安全动作 Keep 在右，Delete 左侧降级红描边） ---------- */
  let confirmResolve = null;
  function chConfirm(message) {
    $("chConfirmMsg").textContent = message;
    $("chConfirmOv").style.display = "flex";
    setTimeout(() => $("chConfirmKeep").focus(), 30);
    return new Promise(resolve => { confirmResolve = resolve; });
  }
  function settleConfirm(val) {
    $("chConfirmOv").style.display = "none";
    if (confirmResolve) { confirmResolve(val); confirmResolve = null; }
  }
  $("chConfirmDel").addEventListener("click", () => settleConfirm(true));
  $("chConfirmKeep").addEventListener("click", () => settleConfirm(false));
  $("chConfirmOv").addEventListener("click", e => { if (e.target.id === "chConfirmOv") settleConfirm(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && $("chConfirmOv").style.display !== "none") settleConfirm(false);
  });

  /* Due for Review / All Items 共用同一个删除流程：整条 item（连同它全部
     打卡历史）一起删，不是只删某一次打卡。 */
  async function deleteItemByName(name) {
    if (!(await chConfirm('Delete "' + name + '" and all its check-in history?'))) return;
    try {
      await api("DELETE", "/api/leetcode/items/" + encodeURIComponent(name));
      rows = rows.filter(r => r.name !== name);
      buildItems();
      renderAll();
      toast("Item deleted");
    } catch (err) { toast(err.message); }
  }

  /* ---------- 渲染 ---------- */
  function dueRow(n, it, t, dim) {
    const last = it.history[it.history.length - 1];
    const link = noteLink(n);
    const nameHtml = link
      ? '<a class="lch-due-name" href="' + esc(link) + '">' + esc(n) + "</a>"
      : '<span class="lch-due-name">' + esc(n) + "</span>";
    return '<div class="lch-due-row' + (dim ? " dim" : "") + '">' +
      chapterTag(n) + nameHtml +
      '<span class="lch-row-score">' + (last ? scoreChip(last.score) : "") + "</span>" +
      '<span class="lch-row-details">' + (last ? modeChip(last.mode) + sourceChip(last.source) : "") + "</span>" +
      nextBadge(it.nextReview, t) +
      '<button class="lcn-btn-sub lcn-danger-sub" data-act="del" data-name="' + esc(n) + '">Delete</button>' +
    "</div>";
  }
  function renderDue() {
    const t = todayStr();
    const names = Object.keys(items);
    const byNext = (a, b) => (items[a].nextReview < items[b].nextReview ? -1 : 1);
    const due = names.filter(n => { const nr = items[n].nextReview; return nr && nr <= t; }).sort(byNext);
    const up = names.filter(n => { const nr = items[n].nextReview; return nr && nr > t && diffDays(t, nr) <= 7; }).sort(byNext);
    $("chDue").innerHTML = due.length
      ? due.map(n => dueRow(n, items[n], t, false)).join("")
      : '<div class="lcn-empty">Nothing due today 🎉</div>';
    $("chUpWrap").style.display = up.length ? "" : "none";
    $("chUpcoming").innerHTML = up.map(n => dueRow(n, items[n], t, true)).join("");
  }

  /* ---------- Check-in Calendar：Monthly（Bars）卡 + Biweekly（Agenda）卡 ----------
     选型定稿见 mockups/lc-notes/checkin-weekly-mockup.html（W2）和
     checkin-calendar-mockup.html（Option D）。2026-09-02 起两个视图拆成两张
     卡同时显示（Monthly 在上、Biweekly 在下，各自一对 ‹ ›），原来的卡头
     Biweekly/Monthly 切换撤下。Agenda 视图从 7 天一屏改成两周
     （CAL_WEEKLY_DAYS=14 天），两周上下摞、各 7 天竖排。旧的 26 周热力图已撤下。 */
  const mondayOf = d => addDaysISO(d, -((parseISODate(d).getDay() + 6) % 7));
  /* Biweekly 两周固定是"上一周 / 本周"（上下摞，本周在下）——正在进行的
     这一周永远是第二块，所以窗口起点要从本周一再往前退 7 天（renderCalWeekly
     里第二块就是 weekCol(calWeekStart + 7)）。 */
  const currentBiweekStart = () => addDaysISO(mondayOf(todayStr()), -7);
  let calWeekStart = currentBiweekStart();
  let calMonth = todayStr().slice(0, 7) + "-01"; // Monthly 视图当前显示的月（ISO 1 号）
  function shiftMonth(n) {
    const [y, m] = calMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    calMonth = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01";
  }
  const CAL_DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const CAL_WEEKLY_DAYS = 14; // biweekly agenda：两周 = 14 天一屏

  function dayCounts() {
    const counts = {};
    rows.forEach(r => { const d = r.ts.slice(0, 10); counts[d] = (counts[d] || 0) + 1; });
    return counts;
  }
  /* 题名行：有 "112. " 前缀就拆成 题号 + 题名 两列，没有就只有题名 */
  function agParts(name) {
    const m = String(name).match(/^(\d+)\.\s*(.*)$/);
    return m ? { num: m[1] + ".", name: m[2] } : { num: "", name: String(name) };
  }

  /* 三个统计块（day streak / check-ins / active days）两个视图共用同一套 UI；
     streak 口径跟头部统计一致：今天没打卡就从昨天起算 */
  function calStreak(counts) {
    let streak = 0, day = todayStr();
    if (!counts[day]) day = addDaysISO(day, -1);
    while (counts[day]) { streak++; day = addDaysISO(day, -1); }
    return streak;
  }
  function calStatsHtml(counts, total, label, active) {
    return '<div class="lch-bar-stats">' +
      '<span class="lch-bar-stat"><b>' + calStreak(counts) + "</b>day streak</span>" +
      '<span class="lch-bar-stat"><b>' + total + "</b>check-ins · " + label + "</span>" +
      '<span class="lch-bar-stat"><b>' + active + "</b>active days</span>" +
    "</div>";
  }

  function renderCalWeekly() {
    const t = todayStr();
    const end = addDaysISO(calWeekStart, CAL_WEEKLY_DAYS - 1);
    $("chWeekLab").textContent = md(calWeekStart) + " – " + md(end);
    const byDay = {};
    rows.forEach(r => {
      const d = r.ts.slice(0, 10);
      if (d >= calWeekStart && d <= end) (byDay[d] = byDay[d] || []).push(r);
    });
    let total = 0, active = 0;
    // 两周各一个 .lch-ag-col（周标签 + 7 天竖排），上下摞（CSS 里 column 排）：
    // 上一周在上、本周在下
    function weekCol(weekStart) {
      const days = CAL_DOW.map((dow, i) => {
        const d = addDaysISO(weekStart, i);
        const list = (byDay[d] || []).sort((a, b) => (a.ts < b.ts ? -1 : 1));
        if (list.length) { total += list.length; active++; }
        const lines = list.length
          ? list.map(r => {
              const p = agParts(r.name);
              // 行首放章节小黑标，跟 Due for Review 行同款（chapterTag 固定 42px 宽，跨行对齐）
              return '<div class="lch-ag-line">' +
                chapterTag(r.name) +
                '<i class="lch-ag-sc" style="background:' + (SCORE_BG[r.score] || "#f0f0f0") + '">' + r.score + "</i>" +
                '<span class="lch-ag-num">' + p.num + "</span>" +
                '<span class="lch-ag-name">' + esc(p.name) + "</span>" +
                modeChip(r.mode) +
              "</div>";
            }).join("")
          : '<div class="lch-ag-none">—</div>';
        return '<div class="lch-ag-day' + (d === t ? " today" : "") + '">' +
          '<div class="lch-ag-head"><span class="lch-ag-dow">' + dow + '</span><span class="lch-ag-date">' + Number(d.slice(8, 10)) + "</span>" +
            (list.length ? '<span class="lch-ag-n">· ' + list.length + "×</span>" : "") + "</div>" +
          lines +
        "</div>";
      }).join("");
      const wend = addDaysISO(weekStart, 6);
      return '<div class="lch-ag-col"><div class="lch-ag-col-lab">' + md(weekStart) + " – " + md(wend) + "</div>" + days + "</div>";
    }
    const html = '<div class="lch-ag-cols">' + weekCol(calWeekStart) + weekCol(addDaysISO(calWeekStart, 7)) + "</div>";
    $("chCalBody").innerHTML = html + calStatsHtml(dayCounts(), total, "these 2 weeks", active);
  }

  /* Monthly：整个自然月的柱状图，‹ › 按月翻（标签 "Aug 2026"）。
     柱高按当月最大值归一；统计块 = 当前 streak（全局口径）+ 当月总量/活跃天。 */
  function renderCalMonthly() {
    const t = todayStr();
    const counts = dayCounts();
    const [y, m] = calMonth.split("-").map(Number);
    const days = new Date(y, m, 0).getDate();
    $("chMonthLab").textContent = MONTHS[m - 1] + " " + y;
    const seq = Array.from({ length: days }, (_, i) => {
      const d = calMonth.slice(0, 8) + String(i + 1).padStart(2, "0");
      return { d, c: counts[d] || 0 };
    });
    const max = Math.max(1, ...seq.map(x => x.c));
    let total = 0, active = 0;
    seq.forEach(x => { if (x.c) { total += x.c; active++; } });
    $("chMonthBody").innerHTML =
      '<div class="lch-bar-wrap">' + seq.map(x =>
        '<span class="lch-bar' + (x.c ? "" : " zero") + (x.d === t ? " today" : "") +
        '" style="height:' + (x.c ? Math.round(x.c / max * 100) : 4) + '%" title="' + x.d + " · " + x.c + '×"></span>'
      ).join("") + "</div>" +
      '<div class="lch-bar-axis"><span>' + md(seq[0].d) + "</span><span>" + md(seq[14].d) + "</span><span>" + md(seq[days - 1].d) + "</span></div>" +
      calStatsHtml(counts, total, MONTHS[m - 1], active);
  }

  // 两张卡一起画（Monthly 在上、Biweekly 在下）
  function renderCalendar() {
    renderCalMonthly();
    renderCalWeekly();
  }

  function histHtml(it) {
    return [...it.history].reverse().map(h =>
      '<div class="lch-hist"><span class="lch-hist-ts">' + h.ts.replace("T", " ").slice(0, 16) + "</span>" +
      scoreChip(h.score) + modeChip(h.mode) + sourceChip(h.source) +
      '<span class="lch-hist-note">' + (h.note ? esc(h.note) : "<i>no note</i>") + "</span></div>"
    ).join("");
  }
  function renderItems() {
    const box = $("chItems");
    const names = Object.keys(items);
    if (!names.length) {
      box.innerHTML = '<div class="lcn-empty">No items yet — check in from a question page first.</div>';
      itemOrder = [];
      return;
    }
    const t = todayStr();
    itemOrder = names.sort((a, b) => {
      const na = items[a].nextReview || "9999", nb = items[b].nextReview || "9999";
      return na < nb ? -1 : na > nb ? 1 : (a < b ? -1 : 1);
    });
    box.innerHTML = itemOrder.map((n, i) => {
      const it = items[n];
      const last = it.history[it.history.length - 1];
      // 只显示最近一次的分数/格式（保持 score 竖线对齐；完整轨迹点开行内历史看）
      return '<div class="lch-item-row" data-act="toggle" data-idx="' + i + '">' +
        chapterTag(n) + '<span class="lch-item-name">' + esc(n) + "</span>" +
        '<span class="lch-item-meta">' +
          '<span class="lch-item-last">' + it.history.length + "× · " + (last ? last.ts.slice(5, 10) : "—") + "</span>" +
          '<span class="lch-item-score">' + (last ? scoreChip(last.score) : "") + "</span>" +
          '<span class="lch-item-fmt">' + (last ? modeChip(last.mode) : "") + "</span>" +
          nextBadge(it.nextReview, t) +
        "</span>" +
        '<span class="lch-item-actions">' +
          '<button class="lcn-btn-sub lcn-danger-sub" data-act="del" data-name="' + esc(n) + '">Delete</button>' +
        "</span>" +
      "</div>" +
      '<div class="lch-item-hist" id="chHist' + i + '" style="display:none">' + histHtml(it) + "</div>";
    }).join("");
  }

  function renderAll() {
    renderDue();
    renderCalendar();
    renderItems();
  }

  /* ---------- 事件 ---------- */
  // 两张卡各自的 ‹ ›：Monthly 按整月翻，Biweekly 按 14 天翻，互不影响
  $("chMonthPrev").addEventListener("click", () => { shiftMonth(-1); renderCalMonthly(); });
  $("chMonthNext").addEventListener("click", () => { shiftMonth(1); renderCalMonthly(); });
  $("chWeekPrev").addEventListener("click", () => { calWeekStart = addDaysISO(calWeekStart, -CAL_WEEKLY_DAYS); renderCalWeekly(); });
  $("chWeekNext").addEventListener("click", () => { calWeekStart = addDaysISO(calWeekStart, CAL_WEEKLY_DAYS); renderCalWeekly(); });
  $("chDueCard").addEventListener("click", async e => {
    const delBtn = e.target.closest('[data-act="del"]');
    if (delBtn) { await deleteItemByName(delBtn.dataset.name); return; }
  });
  $("chItems").addEventListener("click", async e => {
    const actEl = e.target.closest("[data-act]");
    if (!actEl) return;
    const act = actEl.dataset.act;
    if (act === "del") { e.stopPropagation(); await deleteItemByName(actEl.dataset.name); return; }
    if (act === "toggle") {
      const d = $("chHist" + actEl.dataset.idx);
      if (d) d.style.display = d.style.display === "none" ? "block" : "none";
    }
  });
  /* ---------- 启动：后端不通就整页降级成提示卡 ---------- */
  api("GET", "/api/leetcode/checkins").then(checkinRows => {
    rows = checkinRows;
    buildItems();
    renderAll();
  }).catch(() => {
    $("chWideBlocks").style.display = "none";
    $("chOffline").hidden = false;
  });
})();
