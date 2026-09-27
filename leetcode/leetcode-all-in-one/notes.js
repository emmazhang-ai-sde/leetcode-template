/* =========================================================================
   notes.js — LC Notes：长在动画站里的笔记系统（Life OS 集成）。
   由 sidebar.js 在每个页面动态加载（空壳页 /leetcode-notes/{num} 直接引入，
   有 __lcnLoaded 防双载）。五种页面形态自动识别：
     · 题目动画页 → 顶部 Animation/Notes 双区开关，Notes 区 = 打卡 + 历史 +
       可编辑 Solution（行链黄条）+ 笔记卡（Notion 式编辑）
     · 图文页（catalog 的 page: 条目，OA 题解等，无题号）→ 同动画页，但开关
       写 Problem/Notes；打卡 key = 页面标题（= catalog 的 pageName）
     · index.html → 顶部插 All LeetCode 级 Overview + Expression Bank
     · chapter-notes.html?ch=… → 章级 Methodology / Mock Expressions / 分类笔记
     · section-notes.html?ch=…&sec=… → 分类页：题目列表 + Lyon 模板 +
       自建 block（lc_custom_blocks，标题自己起，"+ New block" 随便加）
     · bfs-tree.html / bfs-grid.html / … → 算法分类页：算法卡 + 自建 note 卡
     · 空壳页（body[data-lc-num]）→ 没有 Animation 区的题目页
   数据全部走 Life OS 后端 /api/leetcode/*（同源）；后端不在（file:// 打开、
   独立部署）时第一个 fetch 失败就整体不注入，页面保持原样。
   富文本用原生 execCommand（够用；将来不够再换自研），内容 HTML 原样落库
   ——单人本地应用，不做消毒。
   ========================================================================= */
(function () {
  if (window.__lcnLoaded) return;
  window.__lcnLoaded = 1;

  var BASE = (function () {
    try { return new URL(".", document.currentScript.src).href; }
    catch (e) { return "/leetcode-all-in-one/"; }
  })();

  // 样式先挂上（同目录静态文件，不依赖后端 API）
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = BASE + "notes.css";
  document.head.appendChild(link);

  /* ---------- 小工具 ---------- */
  function el(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2)); }
  function todayStr() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function api(method, path, body) {
    return fetch(path, {
      method: method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function debounce(fn, ms) {
    var t = null;
    var wrapped = function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { t = null; fn.apply(self, args); }, ms);
    };
    wrapped.flush = function () { if (t) { clearTimeout(t); t = null; fn(); } };
    return wrapped;
  }

  // 2026-08-04 加 3.5 半档后不能再用数组按下标取色，换成按分数取值的对象
  var SCORE_BG = {
    0: "rgba(224,110,140,0.28)", 1: "rgba(199,130,190,0.28)", 2: "rgba(150,140,220,0.28)",
    3: "rgba(120,160,225,0.28)", 3.5: "rgba(106,181,195,0.30)", 4: "rgba(93,202,165,0.32)", 5: "rgba(29,158,117,0.38)"
  };
  var MODES = [
    { k: "paper", label: "Paper", icon: "📝", group: "Written" },
    { k: "computer", label: "Computer", icon: "💻", group: "Written" },
    { k: "script", label: "Speak with Myself", icon: "🗣️", group: "Spoken" },
    { k: "mock_gpt", label: "Mock w/ GPT", icon: "🤖", group: "Spoken" }
  ];
  var MODE_LABEL = {}, MODE_ICON = {};
  MODES.forEach(function (m) { MODE_LABEL[m.k] = m.label; MODE_ICON[m.k] = m.icon; });
  var MOCK_SCRIPT_TITLE = "Mock Script";
  var MOCK_SCRIPT_SECTIONS = [
    { k: "clarify", title: "1. Clarify" },
    { k: "high-level-idea", title: "2. High-level idea (method + reason)" },
    { k: "write", title: "3. 写：写的同时说每一行的思路，不用去念代码，要说的是每一行的思路" },
    { k: "complexity", title: "4. Time complexity 和 space complexity" },
    { k: "test-cases", title: "5. Test cases" }
  ];
  function mockScriptCardId(name) { return "mock-script:" + name; }
  function mockScriptSectionId(name, key) { return mockScriptCardId(name) + ":" + key; }
  /* 打分标准（跟 Practice 页 LCK_RUBRIC 同一套文案，含 3.5 半档）：
     选中分数后，在 Check in 表单里显示对应说明 */
  var RUBRIC = [
    { s: 5, t: "💯 Fully fluent", d: "Mock flows smoothly and can field any follow-up question — the dream state" },
    { s: 4, t: "👍 Mock drafted", d: "Talked through a rough, stumbling mock and got the code written either way, however clumsy. English may come out halting, but you get all the words out — still needs more drilling afterward to sound like fluent English" },
    { s: 3.5, t: "🧠 Clear idea + 💻 code passed (fine with Claude's help)", d: "Can talk through the approach out loud AND the code is written and passing on LeetCode — just haven't done a spoken mock yet" },
    { s: 3, t: "🧠 Can explain (or just a bit), 💻 haven't or failed to write", d: "Can talk through the approach out loud (Chinese is fine) and knows what to watch out for in the code, but haven't written it or done a mock yet. Also counts: tried to code it but couldn't get it out, then reached real understanding by asking AI, learning and reflecting" },
    { s: 2, t: "🧠 Have an initial idea", d: "Know which method to use and can write the skeleton, but key details (state definition, transitions, boundaries / dedup) needed the editorial or hints" },
    { s: 1, t: "🤯 Still fuzzy", d: "Logic is vague, or can only read the editorial / code and retell it — can't write it from scratch yet (or haven't tried)" },
    { s: 0, t: "🤯 No clue", d: "No idea where to start or which algorithm to use; need hints or the editorial to build any idea" }
  ];

  /* 题目 → 章节/分类（label 前导题号反查 LC_ANIM_DATA） */
  function catalogLookup(num) {
    var d = window.LC_ANIM_DATA;
    if (!d || !num) return null;
    var hit = null;
    function scan(chTitle, sections) {
      sections.forEach(function (sec) {
        (sec.problems || []).forEach(function (p) {
          if (!hit && String(p.num) === String(num)) {
            hit = { label: p.num + ". " + p.name, chapter: chTitle, section: sec.title, file: p.file, solAuthor: p.solAuthor };
          }
        });
      });
    }
    d.chapters.forEach(function (ch) { scan(ch.title, ch.sections); });
    scan(d.others.title, d.others.sections);
    return hit;
  }

  /* 2026-08-04 页头左右箭头用：当前题在所属章节里（跨 section，按 sidebar
     目录顺序摊平）的上一题/下一题，免得每道题都要拉开 sidebar 找下一题。
     定位优先按当前文件名对（同一题号可能有两个动画页，如 496），壳页
     /leetcode-notes/{num} 没有对得上的文件名，退回按题号对（同 catalogLookup
     的第一命中规则）。翻到章节两端就停，不跨章。 */
  function chapterNeighbors(num) {
    var d = window.LC_ANIM_DATA;
    if (!d) return null;
    var file = location.pathname.split("/").pop() || "";
    var href = file + location.search;
    var groups = d.chapters.concat(d.others ? [d.others] : []);
    var byFile = null, byNum = null;
    groups.forEach(function (g) {
      var flat = [];
      (g.sections || []).forEach(function (sec) {
        (sec.problems || []).forEach(function (p) { flat.push(p); });
      });
      flat.forEach(function (p, i) {
        if (!byFile && (p.file === href || p.file === file)) byFile = { flat: flat, i: i };
        if (!byNum && num && String(p.num) === String(num)) byNum = { flat: flat, i: i };
      });
    });
    var hit = byFile || byNum;
    if (!hit) return null;
    return { prev: hit.flat[hit.i - 1] || null, next: hit.flat[hit.i + 1] || null };
  }

  /* ---------- 题目标记（2026-08-04 星标；2026-08-27 加"难题"旗）：题目页标题旁
     点一下开关，侧栏跟着亮。每种标记全量 label 列表只拉一次（promise 缓存），
     题目页和侧栏共用同一份。 ---------- */
  var LCN_FLAGS = {
    star:     { api: "/api/leetcode/stars",     on: "★", off: "☆", cls: "lcn-star",     side: "lcn-side-star",     title: "Key problem — click to toggle" },
    struggle: { api: "/api/leetcode/struggles", on: "⚑", off: "⚐", cls: "lcn-struggle", side: "lcn-side-struggle", title: "Struggled this round — click to toggle" }
  };
  var lcnFlags = { star: {}, struggle: {} }, lcnFlagsP = {};
  function lcnFlagsLoad(kind) {
    if (!lcnFlagsP[kind]) lcnFlagsP[kind] = api("GET", LCN_FLAGS[kind].api).then(function (names) {
      lcnFlags[kind] = {};
      names.forEach(function (n) { lcnFlags[kind][n] = true; });
      return lcnFlags[kind];
    });
    return lcnFlagsP[kind];
  }
  /* 按当前 lcnFlags[kind] 把侧栏点亮/熄灭（label = "num. name"，跟 sidebar 渲染拼法一致） */
  function lcnSideFlagSync(kind) {
    var def = LCN_FLAGS[kind];
    document.querySelectorAll(".sidebar-item").forEach(function (a) {
      var numEl = a.querySelector(".sidebar-num"), nameEl = a.querySelector(".sidebar-name");
      if (!nameEl) return;
      var lb = (numEl ? numEl.textContent + " " : "") + nameEl.textContent;
      var mark = a.querySelector("." + def.side);
      if (lcnFlags[kind][lb] && !mark) {
        // 固定顺序：名字 ★ ⚑（旗插在星后面，星永远紧贴名字）
        var anchor = (kind === "star" ? null : a.querySelector(".lcn-side-star")) || nameEl;
        anchor.insertAdjacentHTML("afterend", '<span class="' + def.side + '">' + def.on + "</span>");
      } else if (!lcnFlags[kind][lb] && mark) mark.remove();
    });
  }

  /* ---------- Notion 式编辑器（toolbar + contenteditable + 截图粘贴） ---------- */
  /* 字色盘：黑 / 红 / 橙 / 绿 / 蓝 / 紫 / 粉；选中文字点色上色，同色再点一次 = 还原黑色。
     2026-08-06 绿由 #1D9E75 换成 #5E9652（偏暗、跟正文黑更协调）。改这里只影响
     之后新写的字——历史笔记里已经落库的 <font color="#1D9E75"> 保持旧绿，
     在旧绿字上再点一次绿按钮不会还原黑色（同色比对认不出），会变成新绿。
     cards/cards.js 的 CARD_NT_COLORS 是刻意对齐的另一份，改这里记得同步。 */
  var NT_COLORS = ["#111111", "#C4501E", "#B07800", "#5E9652", "#3A6FD4", "#9333C0", "#B35488"];
  /* 荧光底色盘（2026-08-06）：跟 NT_COLORS 按下标一一成对的淡底。两套是不同
     维度、可以叠加——字色说"这几个字是什么性质"，荧光说"这一段回头要看"。
     底色特意压得很淡：正文是黑字，底色一深就读不动了。
     2026-08-23 用户要求整体再淡一档：每色向白色压了一半（存量笔记/打卡/
     Solution 里已落库的旧色值当天也批量换成了新值，同色再点取消的比对
     才认得出）。 */
  var NT_HILITES = ["#FBEAE2", "#FAF1DC", "#E7F3E4", "#E7F0FB", "#F1E9F9", "#FAE9F1"];
  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return "rgb(" + (n >> 16) + ", " + ((n >> 8) & 255) + ", " + (n & 255) + ")";
  }
  function sameColor(a, b) {
    return String(a).replace(/\s+/g, "").toLowerCase() === String(b).replace(/\s+/g, "").toLowerCase();
  }
  /* 上色（带同色再点还原黑色）：notes 和 solution 共用 */
  function lcnApplyColor(color) {
    var cur = String(document.queryCommandValue("foreColor"));
    document.execCommand("foreColor", false, sameColor(cur, hexToRgb(color)) ? "#111111" : color);
  }
  /* 荧光底：同色再点一次 = 去掉底色。
     execCommand 的底色命令各家不统一——Chrome/Safari 认 hiliteColor，
     Firefox 的 backColor 是"整块底色"不是"选中文字底色"，所以一律 hiliteColor
     优先、失败才退回 backColor；查当前值同理，谁给出有效值用谁。 */
  function hiliteValue() {
    var v = "";
    try { v = String(document.queryCommandValue("hiliteColor") || ""); } catch (e) {}
    // 没底色时各家返回 "transparent" / "rgba(0, 0, 0, 0)" / ""，都当作"没有"
    if (!v || v === "transparent" || /rgba\(0,\s*0,\s*0,\s*0\)/.test(v)) {
      try { v = String(document.queryCommandValue("backColor") || ""); } catch (e2) {}
    }
    return v;
  }
  function lcnApplyHilite(color) {
    var v = sameColor(hiliteValue(), hexToRgb(color)) ? "transparent" : color;
    if (!document.execCommand("hiliteColor", false, v)) document.execCommand("backColor", false, v);
  }
  var lcnFormatBrush = null;
  function noFillColor(v) {
    return !v || v === "transparent" || /^rgba\(0,\s*0,\s*0,\s*0\)$/i.test(v);
  }
  function formatBrushButtons(on) {
    document.querySelectorAll('.lcn-tb[data-cmd="brush"]').forEach(function (b) {
      b.classList.toggle("on", !!on);
    });
  }
  function elementFromSelection(range) {
    var node = range && range.startContainer;
    return node && (node.nodeType === 1 ? node : node.parentElement);
  }
  function closestPreForRange(body, range) {
    if (!range) return null;
    var startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    var endEl = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
    var startPre = startEl && startEl.closest && startEl.closest("pre");
    var endPre = endEl && endEl.closest && endEl.closest("pre");
    return startPre && startPre === endPre && body.contains(startPre) ? startPre : null;
  }
  function backgroundFromNode(node, body) {
    while (node && node !== body && node.nodeType === 1) {
      var bg = getComputedStyle(node).backgroundColor;
      if (!noFillColor(bg)) return bg;
      node = node.parentElement;
    }
    return "";
  }
  function selectionRangeInBody(body) {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    var range = sel.getRangeAt(0);
    var root = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    return root && body.contains(root) ? range : null;
  }
  function styleTextFromFormat(fmt) {
    var parts = [];
    if (fmt.color) parts.push("color:" + fmt.color);
    if (fmt.fontFamily) parts.push("font-family:" + fmt.fontFamily);
    if (fmt.fontSize) parts.push("font-size:" + fmt.fontSize);
    if (fmt.fontWeight) parts.push("font-weight:" + fmt.fontWeight);
    if (fmt.fontStyle && fmt.fontStyle !== "normal") parts.push("font-style:" + fmt.fontStyle);
    if (fmt.textDecoration && fmt.textDecoration !== "none") parts.push("text-decoration:" + fmt.textDecoration);
    if (fmt.letterSpacing && fmt.letterSpacing !== "normal") parts.push("letter-spacing:" + fmt.letterSpacing);
    if (fmt.hilite) parts.push("background-color:" + fmt.hilite);
    return parts.join(";");
  }
  function plainHtmlPreserveLines(text) {
    return esc(text).replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
  }
  function selectedPlainHtml(range) {
    return plainHtmlPreserveLines(range.toString());
  }
  function selectedPreHtml(range) {
    return esc(range.toString());
  }
  function clearFormatSelection(body) {
    var range = selectionRangeInBody(body);
    if (!range) return false;
    if (range.collapsed) {
      document.execCommand("removeFormat");
      if (!document.execCommand("hiliteColor", false, "transparent")) {
        document.execCommand("backColor", false, "transparent");
      }
      document.execCommand("foreColor", false, "#111111");
      return true;
    }
    document.execCommand("insertHTML", false, plainHtmlPreserveLines(range.toString()));
    return true;
  }
  function captureFormatBrush(body) {
    var range = selectionRangeInBody(body);
    if (!range) return null;
    var node = elementFromSelection(range);
    var computed = node ? getComputedStyle(node) : null;
    var codeBlock = !!closestPreForRange(body, range);
    var grayBlock = node && node.closest && node.closest(".lcn-gray-block");
    var inlineCode = node && node.closest("code") && body.contains(node.closest("code")) && !codeBlock;
    var fg = "";
    try { fg = String(document.queryCommandValue("foreColor") || ""); } catch (e) {}
    var bg = hiliteValue() || backgroundFromNode(node, body);
    return {
      inlineCode: !!inlineCode,
      codeBlock: codeBlock,
      grayBlock: !!(grayBlock && body.contains(grayBlock)),
      bold: !!document.queryCommandState("bold"),
      color: fg || (computed ? computed.color : "#111111"),
      hilite: noFillColor(bg) ? "" : bg,
      fontFamily: computed ? computed.fontFamily : "",
      fontSize: computed ? computed.fontSize : "",
      fontWeight: computed ? computed.fontWeight : "",
      fontStyle: computed ? computed.fontStyle : "",
      textDecoration: computed ? computed.textDecorationLine : "",
      letterSpacing: computed ? computed.letterSpacing : ""
    };
  }
  function unwrapGrayBlock(block) {
    var plain = document.createElement("div");
    plain.innerHTML = block.innerHTML || "<br>";
    block.parentNode.replaceChild(plain, block);
    return plain;
  }
  function clearTargetBackground(body, range) {
    if (!range) return false;
    var startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    var endEl = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
    var startGray = startEl && startEl.closest && startEl.closest(".lcn-gray-block");
    var endGray = endEl && endEl.closest && endEl.closest(".lcn-gray-block");
    if (startGray && startGray === endGray && body.contains(startGray)) {
      unwrapGrayBlock(startGray);
      return true;
    }
    if (closestPreForRange(body, range) && togglePreSelection(body)) return true;
    var bgShell = startEl;
    while (bgShell && bgShell !== body) {
      if (bgShell.nodeType === 1 && bgShell.style) {
        var bg = bgShell.style.backgroundColor || bgShell.style.background;
        if (bg && !noFillColor(bg)) {
          bgShell.style.backgroundColor = "";
          bgShell.style.background = "";
          if (!bgShell.getAttribute("style")) {
            var parent = bgShell.parentNode;
            while (bgShell.firstChild) parent.insertBefore(bgShell.firstChild, bgShell);
            parent.removeChild(bgShell);
          }
          return true;
        }
      }
      bgShell = bgShell.parentElement;
    }
    return false;
  }
  function applyFormatBrush(body, fmt) {
    if (!fmt) return;
    var range = selectionRangeInBody(body);
    if (range && !fmt.codeBlock && !fmt.grayBlock && !fmt.hilite && clearTargetBackground(body, range)) return;
    if (range && !range.collapsed && fmt.codeBlock) {
      if (closestPreForRange(body, range)) {
        document.execCommand("insertText", false, range.toString());
      } else {
        document.execCommand("insertHTML", false, "<pre>" + selectedPreHtml(range) + "</pre><br>");
      }
      return;
    }
    if (range && !range.collapsed && fmt.grayBlock) {
      document.execCommand("insertHTML", false, '<div class="lcn-gray-block">' + selectedPlainHtml(range) + '</div><div><br></div>');
      return;
    }
    if (range && !range.collapsed && fmt.inlineCode) {
      document.execCommand("insertHTML", false, "<code>" + selectedPlainHtml(range) + "</code>");
      return;
    }
    if (range && !range.collapsed) {
      document.execCommand("insertHTML", false, '<span style="' + esc(styleTextFromFormat(fmt)) + '">' + selectedPlainHtml(range) + "</span>");
      return;
    }
    if (fmt.color) document.execCommand("foreColor", false, fmt.color);
    if (fmt.hilite) {
      if (!document.execCommand("hiliteColor", false, fmt.hilite)) document.execCommand("backColor", false, fmt.hilite);
    } else if (!document.execCommand("hiliteColor", false, "transparent")) {
      document.execCommand("backColor", false, "transparent");
    }
    if (!!document.queryCommandState("bold") !== !!fmt.bold) document.execCommand("bold");
  }
  function lcnRunFormatBrush(body, btn) {
    var saved = lcnFormatBrush;
    if (!saved) {
      lcnFormatBrush = captureFormatBrush(body);
      formatBrushButtons(lcnFormatBrush);
      return false;
    }
    applyFormatBrush(body, saved);
    lcnFormatBrush = null;
    formatBrushButtons(false);
    return true;
  }
  function togglePreSelection(body) {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return false;
    var range = sel.getRangeAt(0);
    var startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    var endEl = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
    var startPre = startEl && startEl.closest && startEl.closest("pre");
    var endPre = endEl && endEl.closest && endEl.closest("pre");
    var pre = startPre && startPre === endPre ? startPre : null;
    if (!pre || !body.contains(pre)) return false;

    function offsetOf(container, offset) {
      var r = document.createRange();
      r.setStart(pre, 0);
      r.setEnd(container, offset);
      return r.toString().length;
    }
    var text = pre.textContent || "";
    var s0 = offsetOf(range.startContainer, range.startOffset);
    var e0 = offsetOf(range.endContainer, range.endOffset);
    if (e0 < s0) { var tmp = s0; s0 = e0; e0 = tmp; }

    var lines = [], at = 0;
    while (at <= text.length) {
      var nl = text.indexOf("\n", at);
      if (nl === -1) nl = text.length;
      lines.push({ start: at, end: nl, next: nl < text.length ? nl + 1 : nl });
      if (nl >= text.length) break;
      at = nl + 1;
    }
    var picked = lines.filter(function (line) {
      return range.collapsed ? (line.start <= s0 && s0 <= line.end) : (line.start < e0 && line.next > s0);
    });
    if (!picked.length) return false;

    var first = picked[0], last = picked[picked.length - 1];
    var before = text.slice(0, first.start).replace(/\n$/, "");
    var after = text.slice(last.next).replace(/^\n/, "");
    var frag = document.createDocumentFragment();
    function addPre(src) {
      if (!src) return;
      var p = document.createElement("pre");
      p.textContent = src;
      frag.appendChild(p);
    }
    function addPlain(src) {
      var div = document.createElement("div");
      if (src) div.textContent = src;
      else div.appendChild(document.createElement("br"));
      frag.appendChild(div);
      return div;
    }
    addPre(before);
    var focusNode = null;
    picked.forEach(function (line) {
      var div = addPlain(text.slice(line.start, line.end));
      if (!focusNode) focusNode = div;
    });
    addPre(after);
    pre.parentNode.replaceChild(frag, pre);
    if (focusNode) {
      var r2 = document.createRange();
      r2.selectNodeContents(focusNode);
      sel.removeAllRanges();
      sel.addRange(r2);
    }
    return true;
  }
  function toggleGrayBlockSelection(body) {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return false;
    var range = sel.getRangeAt(0);
    var startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    var endEl = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
    var startBlock = startEl && startEl.closest && startEl.closest(".lcn-gray-block");
    var endBlock = endEl && endEl.closest && endEl.closest(".lcn-gray-block");
    var block = startBlock && startBlock === endBlock ? startBlock : null;
    if (block && body.contains(block)) {
      var plain = unwrapGrayBlock(block);
      var r = document.createRange();
      r.selectNodeContents(plain);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
      return true;
    }
    var html = range.collapsed ? "note here" : selectedPlainHtml(range);
    document.execCommand("insertHTML", false, '<div class="lcn-gray-block">' + html + '</div><div><br></div>');
    return true;
  }
  function unwrapScriptBlock(block) {
    var plain = document.createElement("div");
    plain.innerHTML = block.innerHTML || "<br>";
    block.parentNode.replaceChild(plain, block);
    return plain;
  }
  function toggleScriptBlockSelection(body) {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return false;
    var range = sel.getRangeAt(0);
    var startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    var endEl = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
    var startNote = startEl && startEl.closest && startEl.closest(".lcn-inline-script-note");
    var endNote = endEl && endEl.closest && endEl.closest(".lcn-inline-script-note");
    var note = startNote && startNote === endNote ? startNote : null;
    if (note && body.contains(note)) {
      var row = note.closest(".lcn-inline-script-row");
      var plain = unwrapScriptBlock(row || note);
      var r = document.createRange();
      r.selectNodeContents(plain);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
      return true;
    }
    var html = range.collapsed ? "script here" : selectedPlainHtml(range);
    document.execCommand("insertHTML", false,
      '<div class="lcn-inline-script-row"><div class="lcn-inline-script-note">' + html + '</div></div>');
    return true;
  }
  function removeEmptyFormatShell(body) {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return false;
    var n = sel.anchorNode;
    var elNode = n && (n.nodeType === 1 ? n : n.parentElement);
    if (!elNode || !body.contains(elNode)) return false;
    function emptyText(node) {
      return !String(node.textContent || "").replace(/[\u200b\u00a0]/g, "").trim();
    }
    var pre = elNode.closest("pre");
    var code = elNode.closest("code");
    var inline = elNode.closest("code,font,span,b,strong,i,u");
    var shell = null;
    if (pre && body.contains(pre) && emptyText(pre)) shell = pre;
    else if (code && body.contains(code) && emptyText(code)) shell = code;
    else if (inline && body.contains(inline) && emptyText(inline)) shell = inline;
    if (!shell) return false;

    var parent = shell.parentNode;
    if (!parent) return false;
    var idx = Array.prototype.indexOf.call(parent.childNodes, shell);
    var focus = parent;
    shell.remove();
    if (parent !== body && !parent.textContent.trim() && !parent.querySelector("br,img,table")) {
      parent.appendChild(document.createElement("br"));
    }
    if (shell.tagName === "PRE") {
      focus = document.createElement("div");
      focus.appendChild(document.createElement("br"));
      if (idx >= parent.childNodes.length) parent.appendChild(focus);
      else parent.insertBefore(focus, parent.childNodes[idx]);
      parent = focus;
      idx = 0;
    }
    var r = document.createRange();
    r.setStart(focus, Math.min(idx, focus.childNodes.length));
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    return true;
  }

  /* 分块撤销：每个编辑区自己的 undo/redo 栈（Cmd+Z / Cmd+Shift+Z 只回退
     当前这个块，不跟页面上其它块混在一起——浏览器原生 undo 是全文档共享
     的，所以这里拦下来自己管）。快照按打字停顿 400ms 合并。 */
  function attachUndo(body) {
    var stack = [body.innerHTML], idx = 0, t = null;
    function snap() {
      t = null;
      if (body.innerHTML === stack[idx]) return;
      stack = stack.slice(0, idx + 1);
      stack.push(body.innerHTML);
      if (stack.length > 100) stack.shift();
      idx = stack.length - 1;
    }
    body.addEventListener("input", function (e) {
      if (e.lcnUndo) return;
      clearTimeout(t);
      t = setTimeout(snap, 400);
    });
    body.addEventListener("keydown", function (e) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      e.stopPropagation();
      if (t) { clearTimeout(t); snap(); }
      if (e.shiftKey) { if (idx < stack.length - 1) idx++; }
      else if (idx > 0) idx--;
      body.innerHTML = stack[idx];
      var r = document.createRange();
      r.selectNodeContents(body);
      r.collapse(false);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      var ev = new Event("input", { bubbles: true });
      ev.lcnUndo = true;
      body.dispatchEvent(ev);
    });
  }

  /* contenteditable 代码区 → 按行序列化（保留 <font> 字色和 <span> 荧光底色、
     转义其余字符），行结构必须干净，行号和"笔记链接到第几行"才对得上。
     跨行的标记在每行末尾按栈倒序闭合、下一行开头照原样重开——不然选中好几行
     一起上色，存完只有第一行带色。2026-08-06 从"只认 <font>"扩成通用标签栈，
     字色和荧光可以叠加。 */
  /* <font color="…"> 的 color 属性是 HTML 老式颜色解析：只认 #hex / 颜色名，
     "rgb(0, 128, 0)" 这种 CSS 写法会被逐字符当 hex 硬啃，算出一个完全不相干
     的颜色（贴进来的绿注释存完再显示变成红的，2026-09-02）。粘贴来的代码
     颜色都是 style.color，浏览器给的一律是 rgb()，所以存盘前先转成 hex；
     转不了的（hsl / 颜色名之类）退回 style="color:…" 写法，浏览器按 CSS 解析。 */
  function cssColorToHex(c) {
    c = String(c || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(c)) return ("#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]).toLowerCase();
    var m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
    if (!m) return null;
    return "#" + [m[1], m[2], m[3]].map(function (v) {
      return ("0" + Math.min(255, +v).toString(16)).slice(-2);
    }).join("");
  }
  function fontOpenTag(col) {
    var hex = cssColorToHex(col);
    return hex ? '<font color="' + hex + '">' : '<font style="color:' + esc(col) + '">';
  }
  /* 修已经落库的坏副本：之前 ceToLines 把 rgb() 原样写进了 color 属性，
     读回来（显示 / 进编辑器）时先换成 hex，下次存盘就自然干净了。 */
  function fixFontRgb(html) {
    return String(html || "").replace(/<font color="(rgba?\([^"]*\))">/gi, function (all, c) {
      return fontOpenTag(c);
    });
  }
  function ceToLines(root) {
    var lines = [], cur = "", open = [];  // open = 当前还没闭合的标记栈
    function closeAll() { for (var i = open.length - 1; i >= 0; i--) cur += open[i].close; }
    function nl() {
      closeAll();
      lines.push(cur);
      cur = "";
      open.forEach(function (t) { cur += t.open; });
    }
    function walk(n) {
      if (n.nodeType === 3) {
        n.nodeValue.split("\n").forEach(function (t2, i) { if (i) nl(); cur += esc(t2); });
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.tagName === "BR") { nl(); return; }
      var block = /^(DIV|P)$/.test(n.tagName);
      if (block && n.previousSibling) nl();
      var tags = [];
      var col = null;
      if (n.tagName === "FONT" && n.getAttribute("color")) col = n.getAttribute("color");
      else if (n.style && n.style.color) col = n.style.color;
      if (col) tags.push({ open: fontOpenTag(col), close: "</font>" });
      // 荧光底：hiliteColor 产出的是 <span style="background-color:…">；
      // 取消底色写的是 transparent / rgba(0,0,0,0)，那种不算标记，别存
      var bg = n.style && (n.style.backgroundColor || n.style.background);
      if (bg && bg !== "transparent" && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(bg)) {
        tags.push({ open: '<span style="background-color:' + bg + '">', close: "</span>" });
      }
      // 粗体：execCommand("bold") 各浏览器出的标签不一样（<b> / <strong> /
      // font-weight 内联样式都见过），三种都认，统一存成 <b>
      var isBold = n.tagName === "B" || n.tagName === "STRONG" ||
        (n.style && /^(bold|bolder|[6-9]00)$/i.test(n.style.fontWeight || ""));
      if (isBold) tags.push({ open: "<b>", close: "</b>" });
      tags.forEach(function (t) { open.push(t); cur += t.open; });
      var kids = Array.prototype.slice.call(n.childNodes);
      if (!(block && kids.length === 1 && kids[0].nodeType === 1 && kids[0].tagName === "BR")) kids.forEach(walk);
      for (var j = tags.length - 1; j >= 0; j--) { cur += tags[j].close; open.pop(); }
    }
    Array.prototype.slice.call(root.childNodes).forEach(walk);
    closeAll();
    lines.push(cur);
    return lines.join("\n");
  }
  /* "用户在这份代码上加过标记" = 有字色 <font>、荧光 <span> 或粗体 <b>。
     存盘判重和读回判 HTML 都用它，两处别再各写各的正则。 */
  var SOL_MARKUP_RE = /<(font|span|b)[\s>]/i;

  /* Solution 只读视图的注释染绿（2026-08-06）：逐行算"这行算不算注释"。
     两类——① # 开头；② """ 或 ''' 开头的 docstring，从起头那行一直绿到
     收尾那行（含）。docstring 必须带状态扫，因为中间几行（:type root: …）
     自己并不以引号开头，只染首尾会花掉。同一行开又闭的（"""一句话"""）
     当场结束，不进入多行状态。
     lines 传的可能是用户副本（每行是 HTML），所以先取 textContent 再判。
     只影响显示：染色靠 .lcn-cmt 这个 class，不写进内容，也就不会被
     ceToLines 存进用户副本里。 */
  function commentFlags(lines, isHtml) {
    var probe = document.createElement("div");
    var flags = [], inDoc = null;  // inDoc = 当前 docstring 用的引号
    lines.forEach(function (ln) {
      var t = ln;
      if (isHtml) { probe.innerHTML = ln; t = probe.textContent; }
      t = t.trim();
      if (inDoc) {
        flags.push(true);
        if (t.indexOf(inDoc) !== -1) inDoc = null;  // 收尾行也算注释
        return;
      }
      if (t.charAt(0) === "#") { flags.push(true); return; }
      var q = t.slice(0, 3);
      if (q === '"""' || q === "'''") {
        flags.push(true);
        if (t.slice(3).indexOf(q) === -1) inDoc = q;  // 本行没闭合 → 进多行 docstring
        return;
      }
      flags.push(false);
    });
    return flags;
  }
  function solEditHtml(src, isHtml) {
    var lines = String(src || "").split("\n");
    if (!lines.length) lines = [""];
    return lines.map(function (ln) {
      return '<div class="lcn-code-edit-line">' + (ln ? (isHtml ? ln : esc(ln)) : "<br>") + "</div>";
    }).join("");
  }
  function syncSolEditComments(ce) {
    if (!ce) return;
    var rows = Array.prototype.slice.call(ce.children).filter(function (n) {
      return n.tagName === "DIV" && !n.classList.contains("lcn-toolbar");
    });
    if (!rows.length) return;
    rows.forEach(function (row) { row.classList.add("lcn-code-edit-line"); });
    var flags = commentFlags(rows.map(function (row) { return row.textContent; }), false);
    rows.forEach(function (row, i) { row.classList.toggle("lcn-cmt", !!flags[i]); });
  }
  function solEditLineBreak(body, cursor, indent) {
    var line = cursor.startContainer;
    while (line && line !== body && !(line.nodeType === 1 && line.classList.contains("lcn-code-edit-line"))) {
      line = line.parentNode;
    }
    if (!line || line === body) return false;

    var before = cursor.cloneRange();
    before.selectNodeContents(line);
    before.setEnd(cursor.startContainer, cursor.startOffset);
    var atLineStart = before.toString() === "";

    var tail = cursor.cloneRange();
    tail.setEnd(line, line.childNodes.length);
    var rest = tail.extractContents();
    if (!line.textContent && !line.querySelector("br")) line.innerHTML = "<br>";

    var next = document.createElement("div");
    next.className = "lcn-code-edit-line";
    var anchor = next;
    var offset = 0;
    if (indent) {
      var ind = document.createTextNode(indent);
      next.appendChild(ind);
      anchor = ind;
      offset = indent.length;
    }
    next.appendChild(rest);
    if (!next.textContent && !next.querySelector("br")) next.innerHTML = "<br>";
    line.parentNode.insertBefore(next, line.nextSibling);

    var sel = window.getSelection();
    var r = document.createRange();
    if (atLineStart && next.textContent) {
      r.setStart(line, 0);
    } else {
      r.setStart(anchor, offset);
    }
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    return true;
  }
  function htmlLinesToPlain(s) {
    var d = document.createElement("div");
    return s.split("\n").map(function (l) { d.innerHTML = l; return d.textContent; }).join("\n");
  }
  /* 写剪贴板：优先 navigator.clipboard，拿不到（非安全上下文 / 旧浏览器）
     退回 textarea + execCommand("copy")。resolve 一个"成没成功"的布尔值，
     调用方据此闪一下按钮文案。 */
  function lcnCopyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    return Promise.resolve(ok);
  }
  /* ---------- 编辑块地基（工具栏 + 命令派发的唯一权威，2026-08-06） ----------
     站里有 5 个可编辑块：笔记卡 / scope 笔记卡 / 题目页可编辑 Solution /
     打卡表单的 Solution 和 Note。它们之间的差别其实只有两点——工具栏放哪几个
     按钮、要不要"正文增强"（粘贴图片表格 / 图片点击放大 / 列表 Tab 缩进）。
     以前每个块各抄了一份 toolbar HTML + 一份 mousedown 派发，加一个按钮要改
     五处、还容易漏。现在收成两个函数：

       lcnToolbarHtml(cmds, opt)   拼工具栏；cmds 里写 "colors" 展开成六色按钮
       lcnEditor(bar, body, opt)   绑分块撤销 + 工具栏派发（opt.rich 开正文增强，
                                   opt.code 开 Enter 换行沿用上一行缩进）

     加按钮 → 只改 TB_DEF 一处；加新的编辑块 → 只调这两个函数。 */
  var TB_DEF = {
    bold: {
      title: "Bold", label: "<b>B</b>",
      run: function () { document.execCommand("bold"); }
    },
    head: {
      title: "Heading · click again to reset", label: "<b>H</b>",
      run: function () {
        // 当前行 ↔ 标题行切换。用 h4 不用 h3：h3 会吃到 .lcn-card h3 的
        // 等宽大写卡片标题样式（lcn-body 是卡片的后代，选择器躲不开）
        var hn = window.getSelection().anchorNode;
        var hEl = hn && (hn.nodeType === 1 ? hn : hn.parentElement);
        document.execCommand("formatBlock", false, hEl && hEl.closest("h4") ? "<div>" : "<h4>");
      }
    },
    list: {
      title: "Bulleted list", label: "•",
      run: function () { document.execCommand("insertUnorderedList"); }
    },
    color: {
      title: "Color · click again to reset", label: "A",
      run: function (body, btn) { lcnApplyColor(btn.dataset.color); }
    },
    hilite: {
      title: "Highlight · click again to remove", label: "A",
      run: function (body, btn) { lcnApplyHilite(btn.dataset.hilite); }
    },
    brush: {
      title: "Format painter · select source text, click, select target text, click again",
      label: '<img class="lcn-tb-img" src="' + BASE + 'format-brush.png" alt="">',
      run: function (body, btn) { return lcnRunFormatBrush(body, btn); }
    },
    clearformat: {
      title: "Clear formatting · keeps line breaks",
      label: '<span class="lcn-clearfmt-icon">Tx</span>',
      run: function (body) { clearFormatSelection(body); }
    },
    hr: {
      title: "Divider", label: "─",
      run: function () { document.execCommand("insertHorizontalRule"); }
    },
    code: {
      title: "Inline code", label: "&lt;/&gt;",
      run: function () {
        var sel = String(window.getSelection());
        document.execCommand("insertHTML", false, "<code>" + esc(sel || "code") + "</code>&nbsp;");
      }
    },
    pre: {
      title: "Code block", label: "{ }",
      run: function (body) {
        if (togglePreSelection(body)) return;
        var sel = String(window.getSelection());
        document.execCommand("insertHTML", false, "<pre>" + esc(sel || "code here") + "</pre><br>");
      }
    },
    grayblock: {
      title: "Gray note block · select text, click again inside block to reset",
      label: '<span class="lcn-gray-swatch"></span>',
      run: function (body) { toggleGrayBlockSelection(body); }
    },
    scriptblock: {
      title: "Script block · select text, click again inside block to reset",
      label: '<span class="lcn-script-swatch">S</span>',
      run: function (body) { toggleScriptBlockSelection(body); }
    }
  };
  /* 正文笔记块的全套按钮（笔记卡 / scope 卡）。图片仍支持直接粘贴（剪贴板
     image/* → uploadImage），只是不给按钮入口——日常只贴文字，按钮多余。
     "colors" / "hilites" 是两组色板的占位，"sep" 是一条竖分隔线。 */
  var TB_FULL = ["bold", "head", "list", "colors", "sep", "hilites", "brush", "clearformat", "hr", "grayblock", "scriptblock", "code", "pre"];
  /* 两组色板都要的块（两个代码块 + 打卡 Note 在这基础上加自己的按钮） */
  var TB_PALETTE = ["colors", "sep", "hilites"];

  /* opt.cls  给 .lcn-toolbar 追加类名（打卡表单靠它定位自己那条）
     opt.after 在按钮后面追加自由 HTML（题目页 Solution 的 "select code → color"） */
  function lcnToolbarHtml(cmds, opt) {
    opt = opt || {};
    var btn = function (cmd, attr, label) {
      return '<button class="lcn-tb" data-cmd="' + cmd + '"' + (attr || "") +
        ' title="' + TB_DEF[cmd].title + '">' + (label || TB_DEF[cmd].label) + "</button>";
    };
    var html = cmds.map(function (c) {
      if (c === "sep") return '<span class="lcn-tb-sep"></span>';
      if (c === "colors") {
        // 字色：带色的字
        return NT_COLORS.map(function (col) {
          return btn("color", ' data-color="' + col + '"', '<span style="color:' + col + '">A</span>');
        }).join("");
      }
      if (c === "hilites") {
        // 荧光：带色的底（黑字），跟字色一眼分得开
        return NT_HILITES.map(function (col) {
          return btn("hilite", ' data-hilite="' + col + '"',
            '<span class="lcn-a-hl" style="background:' + col + '">A</span>');
        }).join("");
      }
      return btn(c);
    }).join("");
    return '<div class="lcn-toolbar' + (opt.cls ? " " + opt.cls : "") + '">' + html + (opt.after || "") + "</div>";
  }
  /* 粘贴表格：两条通道。① 网页/Claude 里整表复制 → 剪贴板 text/html 带
     <table>，清掉外站的 class/style 只留结构再插入；② Claude 的 Copy 按钮
     给的是 Markdown 管道表（text/plain），识别后转成 <table>。注意：在网页
     里只框选表格的一部分复制时，剪贴板里本来就没有表结构，救不回来——
     要么整表复制，要么用 Copy 按钮拿 Markdown。 */
  /* ChatGPT 的代码块复制过来是 <pre> 套一大摞空 <div> 再套一层 <pre><code>：
     外层 pre 画一层框、里层 pre 又画一层，落地就是双层框。把每个最外层
     pre 里真正的代码（最里面的 code）拎出来直接当这个 pre 的内容，中间
     的 div 壳全部丢掉；没有 code 但有别的壳时退回纯文本，保住换行就行。
     两条粘贴通道（cleanPastedHtml / normalizePastedStyle）都要过这一步。 */
  function flattenPastedPre(d) {
    d.querySelectorAll("pre").forEach(function (p) {
      if (p.parentElement && p.parentElement.closest("pre")) return; // 里层的跟着外层一起处理
      var code = p.querySelector("code");
      if (code) {
        var frag = document.createDocumentFragment();
        while (code.firstChild) frag.appendChild(code.firstChild);
        p.textContent = "";
        p.appendChild(frag);
      } else if (p.querySelector("pre,div")) {
        p.textContent = p.textContent;
      }
    });
  }
  function cleanPastedHtml(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    d.querySelectorAll("style,script,meta,link,title,colgroup").forEach(function (n) { n.remove(); });
    var KEEP = { A: ["href"], FONT: ["color"], TD: ["colspan", "rowspan"], TH: ["colspan", "rowspan"], IMG: ["src"] };
    d.querySelectorAll("*").forEach(function (n) {
      var keep = KEEP[n.tagName] || [];
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        if (keep.indexOf(a.name) === -1) n.removeAttribute(a.name);
      });
    });
    flattenPastedPre(d);
    return d.innerHTML;
  }
  /* 粘贴进来的内联 style 只留字色 / 粗体 / 斜体 / 下划线四样（白名单），
     其余一律清掉（2026-08-22 从"只清字体/字号/背景色"改成白名单）：
     Claude.ai 对话页复制过来的回复，每个 div 都背着一整套
     display:flex / align-items:flex-end / margin-inline-start:auto / padding /
     border-radius / max-width…——用户自己的提问就是靠这些"隐性格式"居右
     显示成气泡的，贴进笔记后那一段也跟着往右缩。用户明确要求贴进来就
     不要这些（2026-08-22）。字体/字号/背景色在白名单之外自然也清掉，跟
     2026-08-12 的决定一致（粘贴带的底色跟笔记站自己的荧光标记像，分不清
     哪个是自己标的）；字/底色清掉后自动继承外层容器（.lcn-code-ce 或
     笔记正文）自己的样子。FONT 标签的 size 属性单独删（HTML4 遗留写法，
     不走 style），bgcolor 属性同理（老式 <td bgcolor="...">写法）。
     颜色/加粗/链接等 format 照旧保留——那些还是用户特意留的标记。
     <svg> 整个删掉、带 svg 的 <button> 整个删掉（Claude.ai 的 "Thought for
     24s" 折叠条就是一个 button + 箭头 svg，纯 UI 部件）；纯文字 button 只
     拆壳留字（LeetCode 题面里带 tooltip 的词是 button，字是正文）。
     id 属性也删——贴进来的 id 会跟页面自己的 id 撞车。

     LeetCode 自带的 Monaco 编辑器（VS Code 同款）"保留语法高亮复制"不是每个
     token 写 style="color:…"，而是引用 class（如 "mtk5"）+ 一段 <style> 块定义
     class → 颜色。这段 <style> 要是原样插进 contenteditable：① 我们这里只认
     内联 style.color，class 引用的颜色读不出来——ceToLines 存盘时这段颜色就
     丢了，丢了颜色的节点会去继承光标当时所在位置的颜色（比如恰好粘在自己
     之前标过红的一段注释旁边），看起来就是"贴的明明是彩色，落地却变成了
     旁边那段的颜色"；② 就算读到了，<style> 是全局生效的，多次粘贴 class
     编号很容易撞车，后一次粘贴把前一次的颜色映射覆盖掉。所以两步都要做：
     先把 <style> 里 class → color 的映射解析出来，直接写成每个节点自己的
     内联 color；再把 class 属性和 <style>/<link> 标签整个清掉，不留只引用
     不生效的空 class，也不让样式泄漏成全局规则。 */
  /* 粘贴进来的列表经常被网页/聊天软件拆成"一段 <ul> 一个 bullet（或几个），
     中间插一条空 <div><br></div>"这种结构（Claude.ai 对话页复制过来的回复
     尤其明显）——落地后每个 <ul> 自己带 margin: 4px 0，中间还多一整行空
     行的高度，跟自己在这连着敲的列表比，空得明显更多。这里把只隔着一条
     空块的相邻同类型列表（ul/ol）拼成一个，去掉那条空块，间距交回 li 自己
     的 margin 管，不再重复叠加（2026-08-12）。 */
  function isBlankSeparator(n) {
    return n.nodeType === 1 && /^(DIV|P)$/.test(n.tagName) && !n.querySelector("img") && !n.textContent.trim();
  }
  function mergeAdjacentLists(root) {
    var kids = Array.prototype.slice.call(root.children);
    var i = 0;
    while (i < kids.length) {
      var n = kids[i];
      if (n && /^(UL|OL)$/.test(n.tagName)) {
        var j = i + 1;
        while (j + 1 < kids.length && isBlankSeparator(kids[j]) && kids[j + 1].tagName === n.tagName) {
          var blank = kids[j], next = kids[j + 1];
          while (next.firstChild) n.appendChild(next.firstChild);
          blank.remove();
          next.remove();
          kids.splice(j, 2);
        }
      }
      i++;
    }
  }
  /* 内联 style 白名单：字色 / 粗体 / 斜体 / 下划线（text-decoration 简写
     在 CSSStyleDeclaration 里枚举出来的是 -line/-style/-color 几个子属性，
     认 -line 就够——下划线是 line:underline）。没剩下任何属性就把 style
     整个摘掉，不留空 style=""。 */
  var PASTE_STYLE_KEEP = { "color": 1, "font-weight": 1, "font-style": 1, "text-decoration": 1, "text-decoration-line": 1 };
  function keepOnlyTextStyle(n) {
    if (!n.style || !n.style.length) { if (n.hasAttribute && n.hasAttribute("style")) n.removeAttribute("style"); return; }
    var kept = [];
    for (var k = 0; k < n.style.length; k++) {
      var p = n.style[k];
      if (PASTE_STYLE_KEEP[p]) kept.push(p + ":" + n.style.getPropertyValue(p));
    }
    if (kept.length) n.style.cssText = kept.join(";");
    else n.removeAttribute("style");
  }
  function normalizePastedStyle(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    var classColor = {};
    var styleTags = d.querySelectorAll("style");
    if (styleTags.length) {
      // <style> 的 .sheet 只有真的挂在文档里才解析得出来，detached 的 div 拿不到
      d.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
      document.body.appendChild(d);
      styleTags.forEach(function (styleTag) {
        var rules = styleTag.sheet ? Array.prototype.slice.call(styleTag.sheet.cssRules) : [];
        rules.forEach(function (rule) {
          if (!rule.selectorText || !rule.style || !rule.style.color) return;
          rule.selectorText.split(",").forEach(function (sel) {
            var m = sel.trim().match(/^\.([\w-]+)$/); // 只认最简单的单 class 选择器（mtk# 这种）
            if (m) classColor[m[1]] = rule.style.color;
          });
        });
      });
      document.body.removeChild(d);
      d.removeAttribute("style");
    }
    // 带图标的 button 整个删（Claude.ai 的 "Thought for 24s" 折叠条 = button +
    // 箭头 svg）；纯文字 button 只拆壳留字——LeetCode 题面里 "permutations"
    // 这种带 tooltip 的词就是一个 button，字是正文
    d.querySelectorAll("button").forEach(function (b) {
      if (b.querySelector("svg")) { b.remove(); return; }
      while (b.firstChild) b.parentNode.insertBefore(b.firstChild, b);
      b.remove();
    });
    d.querySelectorAll("style,link,svg").forEach(function (n) { n.remove(); });
    // Claude.ai 折叠条旁边还藏着一个同文案 "Thought for 24s" 的 span（靠
    // opacity:0 隐身的占位），style 清掉后就露出来了——按文案删
    d.querySelectorAll("span,div,p").forEach(function (n) {
      if (!n.children.length && /^\s*Thought for(\s+\d+\s*[smh]?)+\s*$/i.test(n.textContent)) n.remove();
    });
    d.querySelectorAll("*").forEach(function (n) {
      if (n.tagName === "FONT") n.removeAttribute("size");
      if (n.hasAttribute("bgcolor")) n.removeAttribute("bgcolor");
      if (!n.style.color) {
        for (var i = 0; i < n.classList.length; i++) {
          if (classColor[n.classList[i]]) { n.style.color = classColor[n.classList[i]]; break; }
        }
      }
      n.removeAttribute("class");
      // 网页/聊天软件复制过来常年带一身 id/role/aria-*/data-*/tabindex/dir，
      // 纯给屏幕阅读器和源站自己的脚本用的，贴进笔记里没有任何意义，
      // 只会把存的内容撑得很大、调试的时候也看不清真正的格式在哪。
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        if (/^(id$|role|aria-|data-|tabindex|dir)/i.test(a.name)) n.removeAttribute(a.name);
      });
      keepOnlyTextStyle(n);
    });
    flattenPastedPre(d);
    [d].concat(Array.prototype.slice.call(d.querySelectorAll("*"))).forEach(mergeAdjacentLists);
    return d.innerHTML;
  }
  function mdTableToHtml(text) {
    var lines = text.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length < 2) return null;
    // 第 2 行必须是 |---|---| 分隔线，且每行都带管道，才认定是 Markdown 表
    if (!lines.every(function (l) { return l.indexOf("|") !== -1; })) return null;
    if (!/^[|\s:\-]+$/.test(lines[1]) || lines[1].indexOf("-") === -1) return null;
    var cells = function (l) {
      return l.replace(/^\||\|$/g, "").split("|").map(function (c) {
        return esc(c.trim())
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
      });
    };
    var out = "<table><tr>" + cells(lines[0]).map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr>";
    lines.slice(2).forEach(function (l) {
      out += "<tr>" + cells(l).map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    });
    return out + "</table><br>";
  }
  function uploadImage(file, body) {
    var reader = new FileReader();
    reader.onload = function () {
      var b64 = String(reader.result).split(",")[1];
      api("POST", "/api/leetcode/note-image", { data: b64, type: file.type }).then(function (res) {
        body.focus();
        document.execCommand("insertHTML", false, '<img src="' + res.url + '">');
        body.dispatchEvent(new Event("input", { bubbles: true }));
      }).catch(function () { alert("图片上传失败"); });
    };
    reader.readAsDataURL(file);
  }
  /* ---------- 笔记里的表格：加/删行列 ----------
     表格本身只能靠粘贴（Word/Excel/Markdown 管道表）进来，见 cleanPastedHtml/
     mdTableToHtml；这里补上编辑手段。悬浮小工具条是全站唯一一份（不是每个
     编辑块各自建一条），焦点落进哪个表格的哪个格子，就对着哪个表/哪一行/
     哪一列操作——跟颜色工具栏一个路数：按钮 mousedown 时 preventDefault，
     不抢 contenteditable 的焦点/选区，不然一点按钮当前格子就丢了。 */
  var tblBar = null, tblCell = null, tblBody = null;
  function ensureTblBar() {
    if (tblBar) return tblBar;
    tblBar = el('<div class="lcn-tblbar" style="display:none">' +
      '<button type="button" data-act="row-above">+行↑</button>' +
      '<button type="button" data-act="row-below">+行↓</button>' +
      '<button type="button" data-act="row-del">删行</button>' +
      '<span class="lcn-tblbar-sep"></span>' +
      '<button type="button" data-act="col-left">+列←</button>' +
      '<button type="button" data-act="col-right">+列→</button>' +
      '<button type="button" data-act="col-del">删列</button>' +
    "</div>");
    document.body.appendChild(tblBar);
    tblBar.addEventListener("mousedown", function (e) { e.preventDefault(); });
    tblBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || !tblCell || !tblCell.isConnected) return;
      tableAction(btn.dataset.act, tblCell);
    });
    // 点表格/工具条以外的地方，工具条收起
    document.addEventListener("mousedown", function (e) {
      if (tblBar.contains(e.target)) return;
      if (tblBody && tblBody.contains(e.target) && e.target.closest("td,th")) return;
      hideTblBar();
    });
    return tblBar;
  }
  function showTblBar(cell) {
    var bar = ensureTblBar();
    var r = cell.getBoundingClientRect();
    bar.style.display = "flex";
    bar.style.left = Math.max(4, r.left) + "px";
    bar.style.top = Math.max(4, r.top - 34) + "px";
  }
  function hideTblBar() {
    if (tblBar) tblBar.style.display = "none";
    tblCell = null;
  }
  function cellIndex(cell) {
    return Array.prototype.indexOf.call(cell.parentElement.children, cell);
  }
  function tableAction(act, cell) {
    var row = cell.closest("tr");
    var table = cell.closest("table");
    if (!table || !row) return;
    var rows = Array.prototype.slice.call(table.querySelectorAll("tr"));
    if (act === "row-above" || act === "row-below") {
      var newRow = document.createElement("tr");
      for (var i = 0; i < row.children.length; i++) newRow.appendChild(document.createElement("td"));
      row.parentElement.insertBefore(newRow, act === "row-above" ? row : row.nextSibling);
    } else if (act === "row-del") {
      if (rows.length > 1) { row.remove(); hideTblBar(); }
    } else if (act === "col-left" || act === "col-right") {
      var idx = cellIndex(cell);
      var insertIdx = act === "col-right" ? idx + 1 : idx;
      rows.forEach(function (r) {
        var tag = r.children[0] && r.children[0].tagName === "TH" ? "th" : "td";
        var newCell = document.createElement(tag);
        if (insertIdx >= r.children.length) r.appendChild(newCell);
        else r.insertBefore(newCell, r.children[insertIdx]);
      });
    } else if (act === "col-del") {
      var idx2 = cellIndex(cell);
      if (row.children.length > 1) {
        rows.forEach(function (r) { if (r.children[idx2]) r.children[idx2].remove(); });
      }
      hideTblBar();
    }
    // 加行/加列后格子本身没挪地方，但周围布局变了，工具条重新贴一次位置；
    // 删行/删列已经在各自分支里 hideTblBar 了，这里不用再管
    if (tblCell && tblCell.isConnected) showTblBar(tblCell);
    if (tblBody) tblBody.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function wireTableEditing(body) {
    var check = function () {
      var sel = window.getSelection();
      var n = sel && sel.anchorNode;
      var target = n && (n.nodeType === 1 ? n : n.parentElement);
      var cell = target && target.closest && target.closest("td,th");
      if (cell && body.contains(cell)) {
        tblCell = cell; tblBody = body;
        showTblBar(cell);
      } else if (tblBody === body) {
        hideTblBar();
      }
    };
    body.addEventListener("click", check);
    body.addEventListener("keyup", check);
  }
  /* 一个编辑块 = 一个 contenteditable（body）+ 可选的一条工具栏（bar）。
     bar 传 null 就只挂分块撤销。opt.rich 打开"正文增强"：粘贴图片/表格、
     图片点击放大、列表里 Tab 调缩进——只有正文笔记要，代码块和打卡块不要
     （代码块粘进来的东西要保持原样，Tab 也另有用处）。 */
  function lcnEditor(bar, body, opt) {
    opt = opt || {};
    attachUndo(body);
    // contenteditable 里的 <a> 默认更像可编辑文字，普通点击经常只落光标。
    // 这里把正文里的真实链接恢复成普通网页链接：点文字就打开，点其他地方继续编辑。
    var lastBodyLinkOpen = { href: "", at: 0 };
    function openBodyLink(e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || !body.contains(a)) return;
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      if (lastBodyLinkOpen.href === a.href && now - lastBodyLinkOpen.at < 800) return;
      lastBodyLinkOpen = { href: a.href, at: now };
      location.href = a.href;
    }
    body.addEventListener("pointerdown", openBodyLink, true);
    body.addEventListener("mousedown", openBodyLink, true);
    body.addEventListener("click", openBodyLink, true);
    if (bar) bar.addEventListener("mousedown", function (e) {
      var tb = e.target.closest(".lcn-tb");
      if (!tb) return;
      e.preventDefault(); // 保住选区（click 会先让编辑器失焦、选区丢掉）
      body.focus();
      var def = TB_DEF[tb.dataset.cmd];
      if (!def) return;
      // run 返回 false = 这条命令是异步的，input 事件由它自己在完成时补发
      if (def.run(body, tb) === false) return;
      body.dispatchEvent(new Event("input", { bubbles: true }));
    });
    /* 字号/背景色清理对所有编辑块生效（Check-in 的 Solution/Note 也要），图片粘贴/
       表格粘贴/Tab 缩进这些"正文增强"仍然只给 opt.rich 的正文笔记。 */
    body.addEventListener("paste", function (e) {
      var selPaste = window.getSelection();
      if (selPaste && selPaste.rangeCount && body.contains(selPaste.anchorNode)) {
        var anchorPaste = selPaste.anchorNode.nodeType === 1 ? selPaste.anchorNode : selPaste.anchorNode.parentElement;
        var scriptNote = anchorPaste && anchorPaste.closest(".lcn-inline-script-note");
        var scriptRow = anchorPaste && anchorPaste.closest(".lcn-inline-script-row");
        if (!scriptNote && scriptRow) scriptNote = scriptRow.querySelector(".lcn-inline-script-note");
        if (scriptNote && body.contains(scriptNote)) {
          var plainScript = e.clipboardData ? e.clipboardData.getData("text/plain") : "";
          var htmlScript = e.clipboardData ? e.clipboardData.getData("text/html") : "";
          if (!plainScript && htmlScript) {
            var tmpScript = document.createElement("div");
            tmpScript.innerHTML = htmlScript;
            plainScript = tmpScript.textContent || "";
          }
          if (plainScript) {
            e.preventDefault();
            if (!scriptNote.contains(selPaste.anchorNode)) {
              var endScript = document.createRange();
              endScript.selectNodeContents(scriptNote);
              endScript.collapse(false);
              selPaste.removeAllRanges();
              selPaste.addRange(endScript);
            }
            document.execCommand("insertText", false, plainScript);
            body.dispatchEvent(new Event("input", { bubbles: true }));
            return;
          }
        }
      }
      if (opt.rich) {
        var items = (e.clipboardData || {}).items || [];
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image/") === 0) {
            e.preventDefault();
            uploadImage(items[i].getAsFile(), body);
            return;
          }
        }
      }
      // 表格粘贴：HTML 整表 / Markdown 管道表（见 cleanPastedHtml 上方注释）——只在正文笔记里识别
      var html = e.clipboardData ? e.clipboardData.getData("text/html") : "";
      var ins = null;
      if (opt.rich && html && /<table[\s>]/i.test(html)) {
        ins = cleanPastedHtml(html);
      } else if (html) {
        ins = normalizePastedStyle(html);
      } else {
        // 纯文本粘贴（剪贴板没有 text/html）：不带任何格式，原样插入即可自动继承
        // 容器自己的字体/字号——不再包一层写死字号的 <span>（那是遗留 bug，
        // 字号跟正文对不上，等于粘贴内容"字号不固定"的反面案例）。
        var text = e.clipboardData ? e.clipboardData.getData("text/plain") : "";
        if (text) ins = (opt.rich && mdTableToHtml(text)) || esc(text).replace(/\n/g, "<br>");
      }
      if (ins) {
        e.preventDefault();
        document.execCommand("insertHTML", false, ins);
        body.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    body.addEventListener("keydown", function (e) {
      if ((e.key !== "Backspace" && e.key !== "Delete") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!removeEmptyFormatShell(body)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      body.dispatchEvent(new Event("input", { bubbles: true }));
    });
    /* opt.code（Solution 代码区）按 Enter 换行要接上上一行的缩进——plain
       contenteditable 默认换行不知道"代码"这回事，新行永远从行首开始，
       跟已有行（缩进是敲进去的空白字符，本来就在）比顶格显得很突兀。
       用 Selection.modify（Blink/WebKit 支持，站内别处已经在靠 execCommand
       这类非标准但 Chrome 稳定支持的 API，同一路数）量出光标所在这一行、
       从行首到光标的前导空白，换行后原样接上；没有缩进就用默认换行。 */
    if (opt.code) {
      body.addEventListener("keydown", function (e) {
        if (e.key === "Tab" && !e.metaKey && !e.ctrlKey && !e.altKey) {
          var selTab = window.getSelection();
          if (!selTab.rangeCount || !body.contains(selTab.anchorNode)) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          var INDENT = "    ";
          if (!e.shiftKey) {
            document.execCommand("insertText", false, INDENT);
            body.dispatchEvent(new Event("input", { bubbles: true }));
            return;
          }
          if (!selTab.isCollapsed) return;
          var cursorTab = selTab.getRangeAt(0).cloneRange();
          selTab.removeAllRanges();
          selTab.addRange(cursorTab);
          selTab.modify("extend", "backward", "lineboundary");
          var beforeTab = selTab.toString();
          var trim = Math.min(INDENT.length, (beforeTab.match(/ *$/) || [""])[0].length);
          selTab.removeAllRanges();
          selTab.addRange(cursorTab);
          if (!trim) return;
          if (cursorTab.startContainer.nodeType !== 3 || cursorTab.startOffset < trim) return;
          var del = cursorTab.cloneRange();
          del.setStart(cursorTab.startContainer, cursorTab.startOffset - trim);
          del.deleteContents();
          body.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }
        if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey) return;
        var sel = window.getSelection();
        if (!sel.rangeCount || !sel.isCollapsed) return; // 有选区交给默认行为（先删选中内容）
        var cursor = sel.getRangeAt(0).cloneRange();
        sel.removeAllRanges();
        sel.addRange(cursor);
        sel.modify("extend", "backward", "lineboundary");
        var indent = (sel.toString().match(/^[ \t]*/) || [""])[0];
        sel.removeAllRanges();
        sel.addRange(cursor); // 换回光标原位置，insertHTML 别把行首到光标这段选区吃掉
        if (body.querySelector(".lcn-code-edit-line")) {
          e.preventDefault();
          if (solEditLineBreak(body, cursor, indent)) {
            body.dispatchEvent(new Event("input", { bubbles: true }));
          }
          return;
        }
        if (!indent) return; // 没有缩进，默认换行已经够用
        e.preventDefault();
        document.execCommand("insertHTML", false, "<br>" + indent);
        body.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    /* Inline script-code block 里的 Tab / Shift+Tab：选中多行时，整批行
       右移/左移一个缩进层级。这里的"行"是我们自己存的 div，而不是普通
       pre 文本行，所以要改 class，不插入空格。 */
    body.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
      var sel = window.getSelection();
      if (!sel.rangeCount || !body.contains(sel.anchorNode)) return;
      var range = sel.getRangeAt(0);
      var anchorEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      var inlineCode = anchorEl && anchorEl.closest(".lcn-inline-script-code");
      if (!inlineCode || !body.contains(inlineCode)) return;

      var lineSelector = ".lcn-inline-script-row, .lcn-inline-script-code-line";
      var lines = [];
      if (range.collapsed) {
        var current = anchorEl.closest(lineSelector);
        if (current && inlineCode.contains(current)) lines = [current];
      } else {
        Array.prototype.slice.call(inlineCode.querySelectorAll(lineSelector)).forEach(function (line) {
          if (range.intersectsNode(line)) lines.push(line);
        });
      }
      if (!lines.length) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      var maxIndent = 8;
      function getIndent(line) {
        for (var i = maxIndent; i >= 1; i--) {
          if (line.classList.contains("lcn-inline-script-indent-" + i)) return i;
        }
        return 0;
      }
      function setIndent(line, n) {
        for (var i = 1; i <= maxIndent; i++) line.classList.remove("lcn-inline-script-indent-" + i);
        if (n > 0) line.classList.add("lcn-inline-script-indent-" + n);
      }
      lines.forEach(function (line) {
        var next = getIndent(line) + (e.shiftKey ? -1 : 1);
        setIndent(line, Math.max(0, Math.min(maxIndent, next)));
      });
      body.dispatchEvent(new Event("input", { bubbles: true }));
    });
    /* 代码块（<pre>）里的 Tab / Shift+Tab（2026-09-04）：像代码编辑器那样按"行"
       缩进——选区跨到哪几行就只动那几行的行首（+4 空格 / 去掉最多 4 个空格），
       不选中只按 Tab 则在光标处插 4 个空格。以前 Tab 在 pre 里要么跑焦点、要么
       撞上列表的 execCommand("indent") 把整个 code block 包一层 blockquote 往右
       推——那不是"缩进这几行"。这里只改文本节点，不重建 pre 的 innerHTML，
       行里的上色 <span> 都保得住。所有编辑块都挂（Check-in 的 Note 不开 rich
       但也能放 { } 代码块）；不在 pre 里就放行走默认。 */
    body.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
      var sel = window.getSelection();
      if (!sel.rangeCount) return;
      var range = sel.getRangeAt(0);
      var n = range.commonAncestorContainer;
      var pre = (n.nodeType === 1 ? n : n.parentElement).closest("pre");
      if (!pre || !body.contains(pre)) return;
      e.preventDefault();
      e.stopImmediatePropagation(); // 别再让后面列表的 Tab 处理器把整个 pre 往右推
      var INDENT = "    ";
      if (!e.shiftKey && range.collapsed) {
        document.execCommand("insertText", false, INDENT);
        body.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      // 把 pre 里的文字铺平成一串：每个文本节点记起点偏移；<br> 当作一个换行
      var texts = [], flat = "", lineStarts = [0];
      (function walk(node) {
        for (var c = node.firstChild; c; c = c.nextSibling) {
          if (c.nodeType === 3) {
            texts.push({ node: c, at: flat.length });
            for (var i = 0; i < c.data.length; i++) if (c.data[i] === "\n") lineStarts.push(flat.length + i + 1);
            flat += c.data;
          } else if (c.nodeType === 1) {
            if (c.tagName === "BR") { lineStarts.push(flat.length); }
            else walk(c);
          }
        }
      })(pre);
      function offsetOf(container, offset) { // (node, offset) → 平铺串里的偏移
        var r = document.createRange();
        r.setStart(pre, 0); r.setEnd(container, offset);
        return r.toString().length;
      }
      var s0 = offsetOf(range.startContainer, range.startOffset);
      var e0 = offsetOf(range.endContainer, range.endOffset);
      // 选中的行：行首 < 选区尾（选区正好停在下一行行首时不算那一行），且下一行行首 > 选区头
      var lines = lineStarts.filter(function (ls, i) {
        var next = i + 1 < lineStarts.length ? lineStarts[i + 1] : Infinity;
        return range.collapsed ? (ls <= s0 && s0 < next) : (ls < e0 && next > s0);
      });
      if (!lines.length) return;
      function nodeAt(off) { // 平铺偏移 → 文本节点 + 节点内偏移（落在节点边界时取后面那个）
        for (var i = texts.length - 1; i >= 0; i--) if (texts[i].at <= off) return { node: texts[i].node, off: off - texts[i].at };
        return null;
      }
      var s1 = s0, e1 = e0;
      lines.slice().reverse().forEach(function (ls) { // 从后往前改，前面的偏移才不会被后面的编辑挪动
        var t = nodeAt(ls), delta;
        if (e.shiftKey) {
          if (!t) return;
          var m = t.node.data.slice(t.off).match(/^(?: {1,4}|\t)/);
          if (!m) return;
          t.node.deleteData(t.off, m[0].length);
          delta = -m[0].length;
          if (s0 > ls) s1 += Math.max(delta, ls - s0);
          if (e0 > ls) e1 += Math.max(delta, ls - e0);
        } else {
          if (t) t.node.insertData(t.off, INDENT);
          else pre.insertBefore(document.createTextNode(INDENT), pre.firstChild);
          delta = INDENT.length;
          if (s0 > ls) s1 += delta;
          if (e0 > ls) e1 += delta;
        }
      });
      // 重新按偏移把选区放回去（节点数据被改过，得重新铺一次）
      var texts2 = [];
      (function walk2(node) {
        for (var c = node.firstChild; c; c = c.nextSibling) {
          if (c.nodeType === 3) texts2.push(c); else if (c.nodeType === 1 && c.tagName !== "BR") walk2(c);
        }
      })(pre);
      function point(off) {
        var acc = 0;
        for (var i = 0; i < texts2.length; i++) {
          var len = texts2[i].data.length;
          if (off <= acc + len) return { node: texts2[i], off: off - acc };
          acc += len;
        }
        var last = texts2[texts2.length - 1];
        return last ? { node: last, off: last.data.length } : { node: pre, off: 0 };
      }
      var ps = point(s1), pe = point(e1), r2 = document.createRange();
      r2.setStart(ps.node, ps.off); r2.setEnd(pe.node, pe.off);
      sel.removeAllRanges(); sel.addRange(r2);
      body.dispatchEvent(new Event("input", { bubbles: true }));
    });
    if (!opt.rich) return body;

    // 行首输入 "- " / "1. " 转为无序 / 有序列表，段落边界不会误判视觉折行。
    body.addEventListener("keydown", function (e) {
      if (e.key !== " " || e.isComposing || e.keyCode === 229 ||
          e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount || !sel.isCollapsed || !sel.modify) return;
      var cursor = sel.getRangeAt(0).cloneRange();
      var n = cursor.startContainer;
      var parent = n.nodeType === 1 ? n : n.parentElement;
      if (!parent || !body.contains(parent) || parent.closest("pre, code, li")) return;
      sel.modify("extend", "backward", "paragraphboundary");
      var marker = sel.getRangeAt(0).cloneRange();
      var prefix = sel.toString();
      var listCommand = prefix === "-" ? "insertUnorderedList" :
        prefix === "1." ? "insertOrderedList" : null;
      var isMarker = body.contains(marker.startContainer) && listCommand;
      sel.removeAllRanges();
      sel.addRange(cursor);
      if (!isMarker) return;
      e.preventDefault();
      sel.removeAllRanges();
      sel.addRange(marker);
      document.execCommand("delete");
      document.execCommand(listCommand);
      body.dispatchEvent(new Event("input", { bubbles: true }));
    });

    wireTableEditing(body);
    body.addEventListener("click", function (e) {
      if (e.target.tagName === "IMG") e.target.classList.toggle("lcn-zoomed");
    });
    // 列表里 Tab / Shift+Tab 调缩进层级（只在 li 里生效，别的地方 Tab 保持默认）
    body.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var n = window.getSelection().anchorNode;
      var elNode = n && (n.nodeType === 1 ? n : n.parentElement);
      if (elNode && elNode.closest("li")) {
        e.preventDefault();
        document.execCommand(e.shiftKey ? "outdent" : "indent");
        body.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    // 光标在 li 开头（含空 li）按退格：改走 outdent，一步退出这一级列表。
    // 不拦的话浏览器自带的退格经常只把 bullet 去掉、缩进的 padding 却还留着，
    // 得再按一次才真的退到底——跟 Shift+Tab 的效果对不上。
    body.addEventListener("keydown", function (e) {
      if (e.key !== "Backspace") return;
      var sel = window.getSelection();
      if (!sel.isCollapsed) return;
      var n = sel.anchorNode;
      var elNode = n && (n.nodeType === 1 ? n : n.parentElement);
      var li = elNode && elNode.closest("li");
      if (!li) return;
      var r = document.createRange();
      r.selectNodeContents(li);
      r.setEnd(sel.anchorNode, sel.anchorOffset);
      if (r.toString().length) return; // 光标前面还有内容，不在行首，退格保持默认（删字符）
      e.preventDefault();
      document.execCommand("outdent");
      body.dispatchEvent(new Event("input", { bubbles: true }));
    });
    return body;
  }
  /* 笔记卡 / scope 卡的形状固定（卡里就一条 .lcn-toolbar + 一个 .lcn-body），
     省得每处都 querySelector 两次 */
  function wireEditor(card) {
    return lcnEditor(card.querySelector(".lcn-toolbar"), card.querySelector(".lcn-body"), { rich: true });
  }
  /* 跟 lcnCkForm 一样挂到 window：以后别的页面（checkin.html 之类）要放一个
     编辑块，直接 lcnToolbarHtml(...) 出 HTML + lcnEditor(bar, body) 接线即可。
     这几行在后端 ping 的门外——组件本身不依赖后端（只有插图片要）。 */
  window.lcnToolbarHtml = lcnToolbarHtml;
  window.lcnEditor = lcnEditor;

  /* 居中确认弹窗（代替浏览器原生 confirm）：返回 Promise<boolean> */
  function lcnConfirm(msg, actionLabel) {
    return new Promise(function (resolve) {
      var ov = el('<div class="lcn-modal-ov"><div class="lcn-modal">' +
        '<div class="lcn-modal-msg"></div>' +
        '<div class="lcn-modal-btns">' +
          '<button class="lcn-btn-sub lcn-danger-sub" data-a="1">' + esc(actionLabel || "Delete") + "</button>" +
          '<button class="lcn-btn lcn-safe" data-a="0">Cancel</button>' +
        "</div></div></div>");
      ov.querySelector(".lcn-modal-msg").textContent = msg;
      function done(v) { ov.remove(); document.removeEventListener("keydown", onKey); resolve(v); }
      function onKey(e) { if (e.key === "Escape") done(false); }
      ov.addEventListener("click", function (e) {
        if (e.target === ov) { done(false); return; }
        var b = e.target.closest("[data-a]");
        if (b) done(b.dataset.a === "1");
      });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(ov);
    });
  }

  /* 自动保存包装：input → debounce 保存 + “Saved · HH:MM”反馈 */
  function autosave(card, savedEl, saveFn) {
    var save = debounce(function () {
      saveFn().then(function () {
        var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
        if (savedEl) savedEl.textContent = "Saved · " + p(d.getHours()) + ":" + p(d.getMinutes());
      }).catch(function () { if (savedEl) savedEl.textContent = "Save failed"; });
    }, 700);
    card.addEventListener("input", function () { if (savedEl) savedEl.textContent = "Saving…"; save(); });
    return save;
  }

  /* 打卡 Note：升级成富文本后 note 列里新记录是 HTML、旧记录是纯文本，
     渲染和回填前先嗅探（纯文本里几乎不可能出现这些标签） */
  function noteIsHtml(s) { return /<(font|b|i|u|code|pre|div|p|br|span)[\s>\/]/i.test(s || ""); }
  /* 历史里的 note 渲染：统一转成"一行一个 div"，行首是 - 的行加缩进类
     （用户手打的 bullet）。HTML 笔记把 Chrome contenteditable 散在顶层的
     首行 inline 节点包进 div，行块才齐。 */
  function histNoteHtml(note) {
    if (!note) return "<i>no note</i>";
    var box = document.createElement("div");
    if (!noteIsHtml(note)) {
      box.innerHTML = note.split("\n").map(function (l) {
        return "<div>" + (esc(l) || "<br>") + "</div>";
      }).join("");
    } else {
      box.innerHTML = note;
      var lead = document.createElement("div");
      while (box.firstChild && !(box.firstChild.nodeType === 1 && /^(DIV|P)$/.test(box.firstChild.tagName))) {
        lead.appendChild(box.firstChild);
      }
      if (lead.childNodes.length) box.insertBefore(lead, box.firstChild);
    }
    Array.prototype.slice.call(box.children).forEach(function (b) {
      if (/^\s*[-–—•·]/.test(b.textContent)) b.classList.add("lcn-note-ind");
    });
    return box.innerHTML;
  }

  /* ---------- 打卡表单组件 ----------
     Check in 卡和历史 Edit 弹窗共用同一份表单（不写死字段：以后加字段两边
     自动同步）。init 传已有记录（{ts,score,mode,note,code}）就预填；
     read() 校验并取值，reset() 清回新建状态。全部用 class 定位，不用 id，
     同一页可以同时存在多个实例（卡片一个 + 弹窗一个）。 */
  function ckForm(init) {
    init = init || {};
    var node = el('<div class="lcn-ck-form">' +
      '<div class="lcn-ck-row"><span class="lcn-ck-label">Date</span>' +
        '<input type="date" class="lcn-input lcn-ckf-date">' +
        '<button class="lcn-btn-sub lcn-ckf-today">Today</button>' +
        '<span class="lcn-ck-hint lcn-ckf-hint"></span></div>' +
      '<div class="lcn-ck-row"><span class="lcn-ck-label">Score</span><span class="lcn-ckf-scores"></span></div>' +
      '<div class="lcn-ckf-rubric" role="status" aria-live="polite" hidden></div>' +
      '<div class="lcn-ck-row" style="align-items:flex-start"><span class="lcn-ck-label" style="padding-top:5px">Format</span>' +
        '<div class="lcn-fmt-groups lcn-ckf-modes"></div></div>' +
      '<div class="lcn-ck-row" style="align-items:flex-start"><span class="lcn-ck-label" style="padding-top:5px">Solution</span>' +
        '<div class="lcn-ck-sol">' + lcnToolbarHtml(["bold"].concat(TB_PALETTE, ["clearformat"]), { cls: "lcn-ckf-solbar" }) +
          '<div class="lcn-code-ce lcn-ck-code lcn-ckf-sol" contenteditable="true"></div>' +
        "</div></div>" +
      '<div class="lcn-ck-row" style="align-items:flex-start"><span class="lcn-ck-label" style="padding-top:5px">Note</span>' +
        '<div class="lcn-ck-notewrap">' +
          lcnToolbarHtml(["bold", "list"].concat(TB_PALETTE, ["brush", "clearformat", "grayblock", "scriptblock", "code", "pre"]), { cls: "lcn-ckf-notebar" }) +
        '<div class="lcn-ck-note-ce lcn-ckf-note" contenteditable="true" data-ph="Where you got stuck, what to remember…"></div></div></div>' +
      '<div class="lcn-ck-row lcn-ckf-actions" style="justify-content:center;margin-top:14px"></div>' +
      "</div>");
    var q = function (cls) { return node.querySelector("." + cls); };

    var dateEl = q("lcn-ckf-date"), hint = q("lcn-ckf-hint");
    dateEl.value = init.ts ? init.ts.slice(0, 10) : todayStr();
    dateEl.max = todayStr();
    dateEl.addEventListener("change", function () {
      hint.textContent = this.value && this.value !== todayStr() ? "Backdating to " + this.value : "";
    });
    q("lcn-ckf-today").addEventListener("click", function () {
      dateEl.value = todayStr();
      hint.textContent = "";
    });

    // class 名里不能有小数点（CSS 里 .lcn-s3.5 会被拆成两个选择器），3.5 → lcn-s3-5
    var selScore = init.score != null ? init.score : null;
    function renderScoreDescription() {
      var description = q("lcn-ckf-rubric");
      var rubric = RUBRIC.filter(function (r) { return r.s === selScore; })[0];
      description.hidden = !rubric;
      description.style.backgroundColor = rubric ? SCORE_BG[rubric.s] : "";
      description.innerHTML = rubric ? '<div class="lcn-rub-t"><b>' + esc(rubric.t) +
        '</b><div class="lcn-rub-d">' + esc(rubric.d) + '</div></div>' : "";
    }
    renderScoreDescription();
    var scores = q("lcn-ckf-scores");
    scores.innerHTML = [0, 1, 2, 3, 3.5, 4, 5].map(function (s) {
      return '<button class="lcn-score lcn-s' + String(s).replace(".", "-") +
        (s === selScore ? " sel" : "") + '" data-s="' + s + '">' + s + "</button>";
    }).join(" ");
    scores.addEventListener("click", function (e) {
      var b = e.target.closest(".lcn-score");
      if (!b) return;
      selScore = Number(b.dataset.s);
      scores.querySelectorAll(".lcn-score").forEach(function (x) { x.classList.toggle("sel", x === b); });
      renderScoreDescription();
    });

    // Format = Written（paper/computer）+ Spoken（script/mock_gpt）两个维度，
    // 2026-08-06 起都改成可选（不选也能提交）：选了的落库时逗号拼成一个
    // mode 字符串（列是 TEXT，不用改表），一个都没选就存空字符串。
    // For = 这次练习的性质（Class / Practice）：跟 Format 同款选项组，
    // 落的还是原来的 source 列——不再是"独立来源"概念，新建默认 Practice；
    // 这个仍然强制单选，跟 Format 不是一回事。
    var selModes = { Written: null, Spoken: null };
    String(init.mode || "").split(",").forEach(function (k) {
      MODES.forEach(function (m) { if (m.k === k) selModes[m.group] = k; });
    });
    var selSource = init.source || "practice";
    var modes = q("lcn-ckf-modes");
    modes.innerHTML = ["Written", "Spoken"].map(function (g) {
      return '<div class="lcn-fmt-group"><span class="lcn-fmt-gh">' + g + "</span>" +
        MODES.filter(function (m) { return m.group === g; }).map(function (m) {
          return '<button class="lcn-fmt' + (selModes[g] === m.k ? " sel" : "") +
            '" data-k="' + m.k + '" data-g="' + m.group + '">' + m.icon + " " + m.label + "</button>";
        }).join("") + "</div>";
    }).join("") +
      '<div class="lcn-fmt-group"><span class="lcn-fmt-gh">For</span>' +
        [{ k: "practice", label: "🎯 Practice" }, { k: "class", label: "📚 Class" }].map(function (m) {
          return '<button class="lcn-fmt' + (selSource === m.k ? " sel" : "") +
            '" data-k="' + m.k + '" data-g="For">' + m.label + "</button>";
        }).join("") + "</div>";
    modes.addEventListener("click", function (e) {
      var b = e.target.closest(".lcn-fmt");
      if (!b) return;
      if (b.dataset.g === "For") {
        selSource = b.dataset.k;
        modes.querySelectorAll('.lcn-fmt[data-g="For"]').forEach(function (x) { x.classList.toggle("sel", x === b); });
        return;
      }
      // Written/Spoken 2026-08-06 起可选（见下面 read() 里去掉的必选校验）：
      // 再点一下已选中的按钮可以取消，回到"不选"状态。For 不受影响，
      // 每次打卡总得有个来源，还是强制单选。
      var g = b.dataset.g;
      selModes[g] = selModes[g] === b.dataset.k ? null : b.dataset.k;
      modes.querySelectorAll('.lcn-fmt[data-g="' + g + '"]').forEach(function (x) {
        x.classList.toggle("sel", x.dataset.k === selModes[g]);
      });
    });

    // 本次 solution 快照区：只上色不排版（不开 rich——粘进来的代码要保持原样），
    // Cmd+Z 走 lcnEditor 里的分块撤销
    var sol = q("lcn-ckf-sol");
    sol.innerHTML = init.code || "";
    lcnEditor(q("lcn-ckf-solbar"), sol, { code: true });

    // Note：富文本（加粗 / 颜色 / inline code / code block 等）走正文笔记
    // 同一套 rich editor。旧记录是纯文本，回填时转
    // 一行一个 div（跟 contenteditable 自己的行结构一致，缩进逻辑才认得）
    var noteEl = q("lcn-ckf-note");
    // 空的保持真空（:empty 的占位提示才会出来）
    noteEl.innerHTML = !init.note ? "" : noteIsHtml(init.note) ? init.note
      : init.note.split("\n").map(function (l) {
          return "<div>" + (esc(l) || "<br>") + "</div>";
        }).join("");
    // 编辑时实时缩进：行首是 - 的行挂上跟历史同一个缩进类，打字即生效。
    // 只改 class 不动文本节点，光标不会跳。缩进也随 innerHTML 一起落库。
    function indentNoteLines() {
      Array.prototype.slice.call(noteEl.children).forEach(function (b) {
        if (!/^(DIV|P)$/.test(b.tagName)) return;
        b.classList.toggle("lcn-note-ind", /^\s*[-–—•·]/.test(b.textContent));
      });
    }
    noteEl.addEventListener("input", indentNoteLines);
    indentNoteLines();
    lcnEditor(q("lcn-ckf-notebar"), noteEl, { rich: true });

    function read() {
      if (selScore === null) { alert("Pick a score first"); return null; }
      return {
        date: dateEl.value || todayStr(),
        score: selScore,
        source: selSource,
        // Written/Spoken 都可选：只拼实际选了的那几个，一个都没选就存空字符串
        mode: [selModes.Written, selModes.Spoken].filter(Boolean).join(","),
        // 没打字 = 不存（innerHTML 里可能剩个 <br>，按纯文本判空）
        note: noteEl.textContent.trim() ? noteEl.innerHTML : "",
        code: sol.textContent.trim() ? sol.innerHTML : ""
      };
    }
    function reset() {
      selScore = null;
      renderScoreDescription();
      selModes = { Written: null, Spoken: null };
      selSource = "practice";
      dateEl.value = todayStr();
      hint.textContent = "";
      noteEl.innerHTML = "";
      sol.innerHTML = "";
      node.querySelectorAll(".lcn-score.sel, .lcn-fmt.sel").forEach(function (x) { x.classList.remove("sel"); });
      modes.querySelectorAll('.lcn-fmt[data-g="For"]').forEach(function (x) {
        x.classList.toggle("sel", x.dataset.k === "practice");
      });
    }
    return { node: node, read: read, reset: reset, actions: q("lcn-ckf-actions") };
  }
  /* ckForm 是全站打卡表单的唯一权威（2026-08-05）：题目页卡片、历史 Edit
     弹窗、checkin.html 汇总页都用它。挂到 window 供 notes.js 之外的页面
     调用——以后要在新的地方放打卡表单，直接 window.lcnCkForm() 挂载即可。
     注意这行在后端 ping 的门外：组件本身不依赖后端。 */
  window.lcnCkForm = ckForm;

  /* Scoring Rubric 行同理：题目页卡片和 checkin.html 共用同一份 HTML */
  function rubricHtml() {
    return '<div class="lcn-rubric">' + RUBRIC.map(function (r) {
      return '<div class="lcn-rub-row"><span class="lcn-rub-s" style="background:' + SCORE_BG[r.s] + '">' + r.s + "</span>" +
        '<div class="lcn-rub-t"><b>' + esc(r.t) + "</b>" +
        '<div class="lcn-rub-d">' + esc(r.d) + "</div></div></div>";
    }).join("") + "</div>";
  }
  window.lcnRubricHtml = rubricHtml;

  /* ---------- 题目页（含空壳页） ---------- */
  function buildQuestionPage(label, opts) {
    var num = (label.match(/^(\d+)/) || [])[1] || "";
    var cat = catalogLookup(num);
    // 标题链去力扣：slug 用题名 kebab-case（力扣的 URL 规则），个别缩写题名
    // 可能对不上官方 slug，点开 404 再单独修
    var lcUrl = num
      ? "https://leetcode.com/problems/" +
        label.replace(/^\d+\.\s*/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "/"
      : null;
    // 标题两侧的 ‹ › 翻题箭头：跳到本章目录顺序里的上一题/下一题（目标
    // 用 BASE 解析成绝对地址，壳页 /leetcode-notes/{num} 上相对路径才不会歪；
    // 到章两端就置灰。hover 提示目标题名。
    var nb = chapterNeighbors(num);
    // BASE 走了 catch 兜底时是 "/…" 相对路径，new URL 的 base 必须绝对，补上 origin
    var absBase = /^[a-z]+:/i.test(BASE) ? BASE : location.origin + BASE;
    function navArrow(p, ch2) {
      if (!p) return '<span class="lcn-nav-arrow off">' + ch2 + "</span>";
      return '<a class="lcn-nav-arrow" href="' + esc(new URL(p.file, absBase).href) +
        '" title="' + esc((p.num ? p.num + ". " : "") + p.name) + '">' + ch2 + "</a>";
    }
    // 共享页头：标题 + 副标题 + 切换按钮统一放最上面，两个区都在它底下。
    // content-wrapper：吃 sidebar.js 写的 margin-left 规则，不然滑到侧栏底下。
    // 章节信息放标题上方居中：章名 │ 细分名（等宽大写小字，2026-08-04 定稿
    // 见 mockups/lc-notes/header-chapter-mockup.html 的 C 案），不再用标题
    // 下面那行 lcn-sub 小字——用户嫌挤。
    // 细分名上黄色荧光标记（D 案定稿）；箭头永远渲染（没有邻题就置灰占位），
    // title-row 是三列 grid，两端箭头对齐版心边缘、标题绝对居中
    var chapLine = cat
      ? '<div class="lcn-chap">' + esc(cat.chapter) +
        (cat.section ? '<span class="lcn-chap-bar">│</span><span class="lcn-chap-hl">' + esc(cat.section) + "</span>" : "") +
        "</div>"
      : "";
    var head = el('<div class="lcn-zone content-wrapper lcn-shared-head">' +
      chapLine +
      '<div class="lcn-title-row">' +
        '<div class="lcn-title">' +
          (lcUrl ? '<a href="' + lcUrl + '" target="_blank" rel="noopener">' + esc(label) + "</a>" : esc(label)) +
          // 复制标题（2026-08-22 用户要求）：点一下把 "76. Minimum Window Substring"
          // 原样进剪贴板，成功闪 ✓
          ' <button class="lcn-copy-title" title="Copy title">⧉</button>' +
          ' <button class="lcn-star" title="' + LCN_FLAGS.star.title + '">☆</button>' +
          // 难题旗（2026-08-27）：本轮学习卡住的题，跟星标同一套开关
          ' <button class="lcn-struggle" title="' + LCN_FLAGS.struggle.title + '">⚐</button>' +
        "</div>" +
        '<div class="lcn-nav-arrows">' + navArrow(nb && nb.prev, "‹") + navArrow(nb && nb.next, "›") + "</div>" +
      "</div></div>");
    document.body.insertBefore(head, opts.animZone || null);

    /* 星标 / 难题旗开关：点一下立即变（乐观更新），侧栏同步亮/灭，落库失败不打断 */
    Object.keys(LCN_FLAGS).forEach(function (kind) {
      var def = LCN_FLAGS[kind], btn = head.querySelector("." + def.cls);
      function render() {
        var on = !!lcnFlags[kind][label];
        btn.textContent = on ? def.on : def.off;
        btn.classList.toggle("on", on);
      }
      btn.addEventListener("click", function () {
        var on = !lcnFlags[kind][label];
        if (on) lcnFlags[kind][label] = true; else delete lcnFlags[kind][label];
        render();
        lcnSideFlagSync(kind);
        api(on ? "PUT" : "DELETE", def.api + "/" + encodeURIComponent(label)).catch(function () {});
      });
      lcnFlagsLoad(kind).then(render).catch(function () {});
    });
    var copyTitleBtn = head.querySelector(".lcn-copy-title");
    copyTitleBtn.addEventListener("click", function () {
      lcnCopyText(label).then(function (ok) {
        copyTitleBtn.textContent = ok ? "✓" : "✗";
        copyTitleBtn.classList.add("done");
        setTimeout(function () { copyTitleBtn.textContent = "⧉"; copyTitleBtn.classList.remove("done"); }, 1200);
      });
    });
    // 网格两行两列：第一行 Check in（内含所选分数说明）│ History；第二行 [Problem] →
    // Solution │ Notes 标题卡 → 笔记——Problem 卡顶边跟 Notes 标题卡对齐
    // （用户要求）。两行都是单行项、不跨行，右列再长也只把自己那行撑高。
    // 左列宽仍由代码最长行定（max-content）。
    var zone = el('<div class="lcn-zone content-wrapper" style="display:none"><div class="lcn-wrap">' +
      '<div class="lcn-grid">' +
        '<div class="lcn-card lcn-cell-ck">' +
          '<h3>Check in <span class="lcn-grow"></span><span class="lcn-meta">shared SM-2 with Practice</span></h3>' +
          '<div id="lcnCkFormHost"></div>' +
        "</div>" +
        '<div class="lcn-col lcn-cell-rh">' +
          '<div class="lcn-card lcn-cell-hist"><h3>Check-in History <span class="lcn-grow"></span><span class="lcn-meta">shared SM-2</span></h3>' +
            '<div class="lcn-hist-scroll" id="lcnHist"></div></div>' +
        "</div>" +
        '<div class="lcn-col lcn-cell-histsol">' +
          '<div class="lcn-card lcn-sticky lcn-cell-sol">' +
            '<div class="lcn-sol-head">' +
              '<h3>Solution <span class="lcn-grow"></span><span class="lcn-meta" id="lcnSolMeta"></span>' +
                '<button class="lcn-btn-sub lcn-btn-sm" id="lcnSolEdit">✏️ Edit</button>' +
                '<button class="lcn-btn-sub lcn-btn-sm" id="lcnSolCopy">⧉ Copy</button></h3>' +
              '<div class="lcn-sol-tabs" id="lcnSolTabs"></div>' +
              '<div class="lcn-sol-tools" id="lcnSolTools"></div>' +
            "</div>" +
            '<div id="lcnSolBox"></div>' +
          "</div>" +
        "</div>" +
        '<div class="lcn-col lcn-cell-notes" id="lcnNoteCol">' +
          '<div class="lcn-card lcn-head-card lcn-mock-head" id="lcnMockHead"><h3>Mock Script <span class="lcn-meta" id="lcnMockCount"></span></h3>' +
            '<span style="flex:1"></span><button class="lcn-btn lcn-btn-sm" id="lcnNewMockBlock">+ New block</button></div>' +
          // 新建笔记插在 lcnNotesHead 后面、已有笔记 appendChild 到列尾
          '<div class="lcn-card lcn-head-card" id="lcnNotesHead"><h3>Notes <span class="lcn-meta" id="lcnNoteCount"></span></h3>' +
            '<span style="flex:1"></span><button class="lcn-btn lcn-btn-sm" id="lcnNewNote">+ New note</button></div>' +
        "</div>" +
      "</div>" +
    "</div></div>");
    document.body.appendChild(zone);
    var $ = function (id) { return zone.querySelector("#" + id); };

    /* ----- Problem 卡：每个题目页（动画页 / 空壳页 / OA 图文页）Solution
       块正上方固定一张，标准 lcn-card 只读块（静态 HTML，没有编辑入口，
       字号走 notes.css 的 .lcn-problem-*）。2026-08-27 起无条件建卡：
         · 页面里写了 .oa-layout 题面块（题干 + Examples + Constraints，
           如 253 和 OA 题解页）→ 从动画区搬进来；
         · 没写 → fetch 同目录 problems/<题号>.html（无题号的按题名 slug）
           题面片段（纯 innerHTML：正文 p + h3 "Example N" / "Constraints"
           小节，跟 .oa-layout 里 .card 的内容同一套结构，样式共用
           .lcn-problem-*）；片段不存在（404）就留占位（"not fetched yet"
           + 力扣链接）。以后爬虫抓题面也是往 problems/ 里写文件，不用改这里。
       答案不写在页面里，走 Solution 块的 Lyon tab。 ----- */
    var probCard = el('<div class="lcn-card lcn-problem"><h3>Problem <span class="lcn-grow"></span>' +
      '<span class="lcn-meta" id="lcnProblemMeta">read-only</span></h3>' +
      '<div class="lcn-problem-body" id="lcnProblemBody"></div></div>');
    var probBody = probCard.querySelector(".lcn-problem-body");
    var oa = opts.animZone ? opts.animZone.querySelector(".oa-layout") : null;
    if (oa) {
      oa.querySelectorAll(".card").forEach(function (c) {
        Array.prototype.slice.call(c.children).forEach(function (child) {
          // 页面卡片自己的 "Problem" 标题不搬——lcn-card 表头已经写了
          if (child.tagName === "H3" && /^problem$/i.test(child.textContent.trim())) return;
          probBody.appendChild(child);
        });
      });
      oa.remove();
      // 题面挪走后没有真动画（.layout-grid）的纯图文页：动画区整个藏掉。
      // 切换时代这里放的是"动画还没做"占位（点 Animation tab 能看到解释）；
      // 纵排模式（2026-08-26 起全站默认）没有切换按钮，占位挂在页底只碍眼
      if (!opts.animZone.querySelector(".layout-grid")) {
        opts.animZone.style.display = "none";
        opts.animZone = null;
      }
    } else {
      probCard.querySelector("#lcnProblemMeta").textContent = "not fetched yet";
      probBody.innerHTML = '<div class="lcn-problem-empty">Problem statement not fetched yet.' +
        (lcUrl ? ' <a href="' + lcUrl + '" target="_blank" rel="noopener">Open on LeetCode ↗</a>' : "") +
        "</div>";
      var probKey = num || label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      fetch(BASE + "problems/" + probKey + ".html")
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (html) {
          if (!html) return;
          probBody.innerHTML = html;
          probCard.querySelector("#lcnProblemMeta").textContent = "read-only";
        })
        .catch(function () { /* 没片段就留占位 */ });
    }
    var histsol = zone.querySelector(".lcn-cell-histsol");
    histsol.insertBefore(probCard, histsol.querySelector(".lcn-cell-sol"));

    /* ----- 双区切换（空壳页没有动画区，不给开关） ----- */
    if (opts.animZone) {
      /* Notes 和动画同页纵排（2026-08-26 起全站统一）：Notes 在上、动画在
         下，原来的 Notes/Animation 二选一切换按钮退场。DOM 里动画区
         （wrapPageZone 建的 #lcn-anim）本来排在 Notes 区前面，挪到 body
         末尾让它落到 Notes 下面。切换时代留下的 lcn-zone:* localStorage
         记录不再使用，留着无害。
         动画区的固定分布（2026-08-26 定稿）："Animation" 区块标题 → 步进
         控件（Step x/y、Prev/Next/Auto/Reset，居中）→ 页面自己的内容。
         步进控件统一锚在标题正下方，不再跟着图例走；说明框/图例在代码框
         上面还是下面由各页自己的搬运脚本定（guide 默认下面）。无控件页
         （controls:false）查不到节点，跳过。 */
      // 标题插进动画区自己的 .content-wrapper——那层带 sidebar 的
      // margin-left，标题才跟动画内容用同一个居中基准（挂在外面会按
      // 全页宽居中，偏左）
      var animWrap = opts.animZone.querySelector(".content-wrapper") || opts.animZone;
      // "Animation" 标题 + 步进控件打包成一条 sticky 头（2026-08-29 用户要求）：
      // 滚进动画区后钉在共享页头正下方，跟页头一起构成"题目 | Animation |
      // Step 行"三层固定头；滚出动画区（回到 Notes）自然消失。top 偏移 =
      // 共享页头实际高度，由下面的 --lcn-head-h 变量给
      var animHead = el('<div class="lcn-anim-head"></div>');
      var animTitle = el('<div class="lcn-anim-title">Animation</div>');
      animHead.appendChild(animTitle);
      var ctrl = opts.animZone.querySelector(".header-row.ctrl");
      if (ctrl) animHead.appendChild(ctrl);
      animWrap.insertBefore(animHead, animWrap.firstChild);
      // 共享页头高度随章行 / 题名长度变（可能折行），量出来写成 CSS 变量，
      // 页头一变（字体加载完、窗口变窄）就跟着更新
      function syncHeadH() {
        document.documentElement.style.setProperty("--lcn-head-h", head.offsetHeight + "px");
      }
      syncHeadH();
      if (window.ResizeObserver) new ResizeObserver(syncHeadH).observe(head);
      window.addEventListener("resize", syncHeadH);
      opts.animZone.style.display = "";
      zone.style.display = "";
      document.body.appendChild(opts.animZone);
    } else {
      zone.style.display = "";
    }

    /* ----- 打卡（表单来自 ckForm 组件，跟历史 Edit 弹窗共用同一份） ----- */
    var ckf = ckForm();
    $("lcnCkFormHost").appendChild(ckf.node);
    var ckSubmit = el('<button class="lcn-btn" style="padding:8px 32px">Check In ✓</button>');
    ckf.actions.appendChild(ckSubmit);

    var checkins = [];
    var WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    function renderHist() {
      var mine = checkins.filter(function (r) { return r.name === label; }).slice().reverse();
      // 时间轴（2026-08-04 定稿 T2+N1，见 mockups/lc-notes/hist-row-mockup.html）：
      // 竖线串起每条打卡，节点 = 白底黑框日期卡（月-日 + 星期，不显示时分，
      // ts 仍存完整时刻给 SM-2 用）；内容行 = 分数色块 + format/Class 小 chip；
      // 行与行之间不画分界线，靠留白分隔。笔记 pre-wrap 保留换行/缩进。
      $("lcnHist").innerHTML = mine.length ? '<div class="lcn-tl">' + mine.map(function (r) {
        var wd = WEEKDAYS[new Date(r.ts.slice(0, 10) + "T00:00:00").getDay()];
        return '<div class="lcn-tl-item">' +
          '<span class="lcn-tl-node"><span class="lcn-tl-d">' + esc(r.ts.slice(5, 10)) + "</span>" +
            '<span class="lcn-tl-w">' + wd + "</span></span>" +
          '<div class="lcn-tl-body">' +
            '<div class="lcn-hist-head">' +
            '<span class="lcn-chip" style="background:' + SCORE_BG[r.score] + '">' + r.score + "</span>" +
            String(r.mode || "").split(",").filter(Boolean).map(function (k) {
              return '<span class="lcn-tag">' + (MODE_ICON[k] ? MODE_ICON[k] + " " : "") + esc(MODE_LABEL[k] || k) + "</span>";
            }).join("") +
            (r.source === "class" ? '<span class="lcn-tag lcn-tag-cls">📚 Class</span>' : "") +
            '<span class="lcn-grow"></span>' +
            (r.code ? '<button class="lcn-pill lcn-hist-solbtn">Solution ▾</button>' : "") +
            (r.id != null ? '<button class="lcn-pill lcn-hist-editbtn" data-id="' + r.id + '">✏️ Edit</button>' : "") +
            "</div>" +
            '<div class="lcn-hist-note">' + histNoteHtml(r.note) + "</div>" +
            (r.code ? '<div class="lcn-hist-code" style="display:none">' + r.code + "</div>" : "") +
          "</div></div>";
      }).join("") + "</div>" : '<div class="lcn-empty">No check-ins yet.</div>';
    }
    /* 历史 Edit 弹窗：弹出跟 Check in 卡完全同一份表单（ckForm 预填这条
       记录），改完 PUT 覆盖。日期改了只换日期部分，当时的时刻保留。 */
    function openCkEdit(r) {
      var f = ckForm(r);
      var ov = el('<div class="lcn-modal-ov"><div class="lcn-modal lcn-ck-modal">' +
        '<h3 class="lcn-ck-modal-title">Edit Check-in <span class="lcn-meta">· ' +
          esc(r.ts.replace("T", " ").slice(0, 16)) + "</span></h3>" +
        '<div class="lcn-ck-modal-body"></div>' +
        '<div class="lcn-modal-btns">' +
          '<button class="lcn-btn-sub" data-a="cancel">Cancel</button>' +
          '<button class="lcn-btn lcn-safe" data-a="save">Save ✓</button>' +
        "</div></div></div>");
      ov.querySelector(".lcn-ck-modal-body").appendChild(f.node);
      function close() { ov.remove(); document.removeEventListener("keydown", onKey); }
      function onKey(e2) { if (e2.key === "Escape") close(); }
      document.addEventListener("keydown", onKey);
      ov.addEventListener("click", function (e2) {
        if (e2.target === ov) { close(); return; }
        var b = e2.target.closest("[data-a]");
        if (!b) return;
        if (b.dataset.a === "cancel") { close(); return; }
        var d = f.read();
        if (!d) return;
        var ts = d.date + r.ts.slice(10);
        api("PUT", "/api/leetcode/checkins/" + r.id, { ts: ts, score: d.score, mode: d.mode, source: d.source, note: d.note, code: d.code })
          .then(function () {
            r.ts = ts; r.score = d.score; r.mode = d.mode; r.source = d.source; r.note = d.note; r.code = d.code;
            renderHist();
            close();
          }).catch(function (e3) { alert("保存失败：" + e3.message); });
      });
      document.body.appendChild(ov);
    }
    $("lcnHist").addEventListener("click", function (e) {
      var eb = e.target.closest(".lcn-hist-editbtn");
      if (eb) {
        var row = null;
        checkins.forEach(function (r) { if (String(r.id) === eb.dataset.id) row = r; });
        if (row) openCkEdit(row);
        return;
      }
      var b = e.target.closest(".lcn-hist-solbtn");
      if (!b) return;
      var box = b.closest(".lcn-tl-body").querySelector(".lcn-hist-code");
      var show = box.style.display === "none";
      box.style.display = show ? "" : "none";
      b.textContent = show ? "Solution ▴" : "Solution ▾";
    });
    ckSubmit.addEventListener("click", function () {
      var d = ckf.read();
      if (!d) return;
      var now = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
      var ts = d.date + "T" + p(now.getHours()) + ":" + p(now.getMinutes()) + ":" + p(now.getSeconds());
      api("POST", "/api/leetcode/checkins", { names: [label], ts: ts, score: d.score, mode: d.mode, source: d.source, note: d.note, code: d.code })
        .then(function () {
          ckf.reset();
          // 重拉一遍列表：新行要带上数据库 id，历史里的 Edit 按钮才能用
          return api("GET", "/api/leetcode/checkins");
        })
        .then(function (rows) { checkins = rows; renderHist(); })
        .catch(function (e2) { alert("打卡失败：" + e2.message); });
    });

    /* ----- Solution：Lyon（只读，不入库）+ 任意多个用户自建 tab ----- */
    // tab 0 的作者名默认 Lyon；Lyon 没讲过、答案自己写的题在 catalog 里
    // 标 solAuthor（如 694 → 'Shuyang'），这里跟着显示
    var solAuthor = (catalogLookup(num) || {}).solAuthor || "Lyon";
    var solData = { lyon: "", versions: [] }; // versions 按 position 排好序
    var activeVersionId = null; // null = 正在看 Lyon
    var editing = false;
    function activeVersion() {
      for (var i = 0; i < solData.versions.length; i++) {
        if (solData.versions[i].id === activeVersionId) return solData.versions[i];
      }
      return null;
    }
    function currentCode() { var v = activeVersion(); return v ? fixFontRgb(v.code) : solData.lyon; }
    function solTabKey() { return "lcn-sol-tab:" + label; }
    function setActiveVersion(id) {
      activeVersionId = id;
      try {
        if (id) localStorage.setItem(solTabKey(), id);
        else localStorage.removeItem(solTabKey());
      } catch (e) { /* 隐私模式/禁用存储 */ }
    }
    // 用户副本一律经 ceToLines 存成"每行 HTML"（实体转义 + <font> 颜色）；
    // Lyon 原版和旧的纯文本副本按原样转义显示。用有没有转义痕迹来区分。
    function solIsHtml(s) { return SOL_MARKUP_RE.test(s) || /&lt;|&gt;|&amp;/.test(s); }
    function focusNoScroll(node) {
      if (!node) return;
      try { node.focus({ preventScroll: true }); }
      catch (e) { node.focus(); }
    }
    function renderSolution() {
      var v = activeVersion();
      // 左列宽平时由代码最长行定（max-content）；这题没有答案文件、当前 tab
      // 也没内容时没东西可撑，改成两列 5:5（2026-09-02 用户要求）
      $("lcnSolBox").closest(".lcn-grid").classList.toggle("lcn-grid-nosol", !currentCode());
      $("lcnSolMeta").textContent = v ? "your copy · based on " + solAuthor : solAuthor + " · original";
      // Lyon 是 tab 0，不可编辑（"这个里面我是不可以修改的"）——按钮直接藏掉
      $("lcnSolEdit").style.display = v ? "" : "none";
      renderSolTabs();
      if (editing) {
        $("lcnSolTools").innerHTML =
          lcnToolbarHtml(["bold"].concat(TB_PALETTE, ["clearformat"]), {
            after: '<span class="lcn-meta" style="align-self:center;margin-left:6px">select code → color / highlight</span>'
          });
        $("lcnSolBox").innerHTML = '<div class="lcn-code-ce" contenteditable="true"></div>';
        var ce = $("lcnSolBox").querySelector(".lcn-code-ce");
        var src = currentCode();
        ce.innerHTML = solEditHtml(src, v != null && solIsHtml(src));
        syncSolEditComments(ce);
        // 不开 rich：这是代码区，粘贴要保持原样，Tab 也不该被列表缩进抢走
        lcnEditor($("lcnSolTools").querySelector(".lcn-toolbar"), ce, { code: true });
        ce.addEventListener("input", function () { syncSolEditComments(ce); });
        focusNoScroll(ce);
        return;
      }
      $("lcnSolTools").innerHTML = "";
      var isHtml = v != null && solIsHtml(currentCode());
      var lines = currentCode().split("\n");
      // 注释染绿对 Lyon 原版和用户副本都生效；只影响显示 class，不写回代码内容。
      var cmt = commentFlags(lines, isHtml);
      $("lcnSolBox").innerHTML = '<div class="lcn-code">' + (lines.length && currentCode() ? lines.map(function (ln, i) {
        var n = i + 1;
        return '<div class="lcn-line' + (cmt[i] ? " lcn-cmt" : "") + '" data-l="' + n + '">' +
          '<span class="lcn-ln">' + n + "</span>" + (isHtml ? ln : esc(ln)) + "</div>";
      }).join("") : '<div class="lcn-empty" style="padding:8px">0-Lyon-Python / 0-my-answers 里没找到这题的答案文件</div>') + "</div>";
    }
    $("lcnSolEdit").addEventListener("click", function () {
      var v = activeVersion();
      if (!v) return; // Lyon 不可编辑；按钮这时也是藏着的，这里是双保险
      if (!editing) {
        var sx = window.scrollX;
        var sy = window.scrollY;
        editing = true;
        this.textContent = "✓ Done";
        renderSolution();
        window.scrollTo(sx, sy);
        requestAnimationFrame(function () { window.scrollTo(sx, sy); });
        return;
      }
      var html = ceToLines($("lcnSolBox").querySelector(".lcn-code-ce"));
      editing = false;
      this.textContent = "✏️ Edit";
      v.code = html;
      api("PUT", "/api/leetcode/notes/solution-version",
        { id: v.id, name: label, title: v.title, code: html }).catch(function () {});
      renderSolution();
    });
    /* ----- Solution 版本 tab 条：Lyon 固定第一个，之后是用户自建的 tab ----- */
    function renderSolTabs() {
      // Lyon 这个 tab 没有 × 删除按钮，跟下面 Copy tab 共用的
      // "padding: 4px 4px 4px 10px"（给 × 按钮流出的右侧空间）会让 "Lyon"
      // 这几个字看着往左偏——单独补一个 lcn-sol-tab-noclose 类改回对称内边距。
      var html = '<span class="lcn-sol-tab lcn-sol-tab-noclose' + (activeVersionId == null ? " on" : "") + '" data-id="">' +
        '<span class="lcn-sol-tab-name">' + esc(solAuthor) + "</span></span>";
      html += solData.versions.map(function (v) {
        var on = v.id === activeVersionId;
        return '<span class="lcn-sol-tab' + (on ? " on" : "") + '" data-id="' + v.id + '">' +
          '<span class="lcn-sol-tab-name" data-rename="1">' + esc(v.title) + "</span>" +
          '<button type="button" class="lcn-sol-tab-x" data-del="1">×</button></span>';
      }).join("") + '<button type="button" class="lcn-btn-sub lcn-btn-sm lcn-sol-tab-add" id="lcnSolTabAdd">+ Copy as new tab</button>';
      $("lcnSolTabs").innerHTML = html;
    }
    $("lcnSolTabs").addEventListener("click", function (e) {
      if (editing) return;
      if (e.target.closest("#lcnSolTabAdd")) {
        var nv = {
          id: uid(), name: label, title: "Copy " + (solData.versions.length + 1),
          code: currentCode(), position: solData.versions.length, updated_at: ""
        };
        solData.versions.push(nv);
        setActiveVersion(nv.id);
        api("PUT", "/api/leetcode/notes/solution-version",
          { id: nv.id, name: label, title: nv.title, code: nv.code }).catch(function () {});
        renderSolution();
        return;
      }
      var delBtn = e.target.closest(".lcn-sol-tab-x");
      if (delBtn) {
        var delId = delBtn.closest(".lcn-sol-tab").dataset.id;
        var delV = null;
        solData.versions.forEach(function (x) { if (x.id === delId) delV = x; });
        if (!delV) return;
        lcnConfirm('Delete "' + delV.title + '"? This can\'t be undone.', "Delete").then(function (ok) {
          if (!ok) return;
          api("DELETE", "/api/leetcode/notes/solution-version/" + encodeURIComponent(delId)).catch(function () {});
          solData.versions = solData.versions.filter(function (x) { return x.id !== delId; });
          if (activeVersionId === delId) setActiveVersion(null);
          renderSolution();
        });
        return;
      }
      var tabEl = e.target.closest(".lcn-sol-tab");
      if (!tabEl) return;
      setActiveVersion(tabEl.dataset.id || null);
      renderSolution();
    });
    $("lcnSolTabs").addEventListener("dblclick", function (e) {
      if (editing) return;
      var nameEl = e.target.closest(".lcn-sol-tab-name[data-rename]");
      if (!nameEl) return;
      var renId = nameEl.closest(".lcn-sol-tab").dataset.id;
      var renV = null;
      solData.versions.forEach(function (x) { if (x.id === renId) renV = x; });
      if (!renV) return;
      var input = document.createElement("input");
      input.className = "lcn-sol-tab-rename";
      input.value = renV.title;
      nameEl.replaceWith(input);
      input.focus();
      input.select();
      function commit() {
        var t = input.value.trim() || renV.title;
        renV.title = t;
        api("PUT", "/api/leetcode/notes/solution-version",
          { id: renV.id, name: label, title: t, code: renV.code }).catch(function () {});
        renderSolTabs();
      }
      input.addEventListener("keydown", function (e2) {
        if (e2.key === "Enter") { input.blur(); }
        else if (e2.key === "Escape") { input.value = renV.title; input.blur(); }
      });
      input.addEventListener("blur", commit);
    });
    $("lcnSolCopy").addEventListener("click", function () {
      var btn = this;
      var src = currentCode();
      var text = (activeVersion() != null && solIsHtml(src)) ? htmlLinesToPlain(src) : src;
      lcnCopyText(text).then(function (ok) {
        btn.textContent = ok ? "✓ Copied" : "Failed";
        setTimeout(function () { btn.textContent = "⧉ Copy"; }, 1400);
      });
    });
    /* Cmd/Ctrl+A 在代码框里按用户预期的来：只选这个框里的文字，不是整页
       （2026-08-12）。.lcn-code（Solution 只读展示）和 .lcn-hist-code（打卡
       历史里的代码快照）都是纯展示 div，没有 contenteditable，浏览器接不到
       "这是个独立编辑区"的信号——原生 Cmd+A 落到默认行为，选中整个文档。
       在这两种框里按下时手动拦一下，把选区收进当前这个框自己。真正的
       contenteditable 代码区（编辑态 .lcn-code-ce）本来就有边界，不用管。 */
    document.addEventListener("keydown", function (e) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "a") return;
      var sel = window.getSelection();
      var anchor = sel && sel.anchorNode;
      var target = anchor && (anchor.nodeType === 1 ? anchor : anchor.parentElement);
      var box = target && target.closest(".lcn-code, .lcn-hist-code");
      if (!box) return;
      e.preventDefault();
      var range = document.createRange();
      range.selectNodeContents(box);
      sel.removeAllRanges();
      sel.addRange(range);
    });
    /* ----- 笔记卡（组件本体是模块层的 noteCardEl，题目页/章节页共用） ----- */
    var mockKey = mockScriptCardId(label);
    function updateMockCount() {
      $("lcnMockCount").textContent = "· " + zone.querySelectorAll("#lcnNoteCol .lcn-note-card--mock-block").length;
    }
    function updateNoteCount() {
      $("lcnNoteCount").textContent = "· " + zone.querySelectorAll("#lcnNoteCol .lcn-note-card:not(.lcn-note-card--mock-block)").length;
    }
    function mockBlockEl(card, section) {
      return noteCardEl(card, mockKey, updateMockCount, {
        fixedClass: "lcn-note-card--mock-block",
        fixedTitle: section ? section.title : "",
        hideTags: true,
        titlePlaceholder: "Block title (optional)"
      });
    }
    $("lcnNewMockBlock").addEventListener("click", function () {
      var card = { id: uid(), note_date: todayStr(), category: "", title: "", html: "" };
      api("PUT", "/api/leetcode/notes/card", { id: card.id, name: mockKey, note_date: card.note_date, category: "", title: "", html: "" });
      var node = mockBlockEl(card);
      $("lcnNotesHead").before(node); // 额外 Mock Script block 放在固定 section 后面、Notes 前面
      node.querySelector(".lcn-body").focus();
      updateMockCount();
    });
    function renderMockBlocks(cards) {
      var byId = {};
      var byTitle = {};
      var extras = [];
      (cards || []).forEach(function (c) {
        if (byId[c.id]) {
          extras.push(c);
          return;
        }
        byId[c.id] = c;
        if (c.title && !byTitle[c.title]) byTitle[c.title] = c;
      });
      MOCK_SCRIPT_SECTIONS.forEach(function (section) {
        var id = mockScriptSectionId(label, section.k);
        var card = byId[id] || byTitle[section.title];
        if (card) {
          delete byId[card.id];
        } else {
          card = { id: id, note_date: todayStr(), category: "", title: section.title, html: "" };
          api("PUT", "/api/leetcode/notes/card", {
            id: card.id,
            name: mockKey,
            note_date: card.note_date,
            category: "",
            title: section.title,
            html: ""
          }).catch(function () {});
        }
        $("lcnNotesHead").before(mockBlockEl(card, section));
      });
      Object.keys(byId).forEach(function (id) {
        extras.push(byId[id]);
      });
      extras.forEach(function (c) {
        $("lcnNotesHead").before(mockBlockEl(c));
      });
      updateMockCount();
    }
    $("lcnNewNote").addEventListener("click", function () {
      var card = { id: uid(), note_date: todayStr(), category: "", html: "" };
      api("PUT", "/api/leetcode/notes/card", { id: card.id, name: label, note_date: card.note_date, category: "", html: "" });
      var node = noteCardEl(card, label, updateNoteCount);
      $("lcnNotesHead").after(node); // 新建放列表最上面（紧跟 Notes 标题卡）
      node.querySelector(".lcn-body").focus();
      updateNoteCount();
    });

    /* ----- 数据加载 ----- */
    api("GET", "/api/leetcode/checkins").then(function (rows) { checkins = rows; renderHist(); });
    api("GET", "/api/leetcode/notes/" + encodeURIComponent(label)).then(function (data) {
      solData.versions = (data.versions || []).slice().sort(function (a, b) { return a.position - b.position; });
      solData.lyon = data.lyon || "";
      var saved = null;
      try { saved = localStorage.getItem(solTabKey()); } catch (e) { /* 隐私模式/禁用存储 */ }
      // 没有记住的选择时：有 copy 就默认停在第一个 copy（versions 已按
      // position 排好序，[0] 就是 Copy 1）；一个 copy 都没有才落回 Lyon。
      activeVersionId = (saved && solData.versions.some(function (v) { return v.id === saved; }))
        ? saved
        : (solData.versions.length ? solData.versions[0].id : null);
      var cards = data.cards || [];
      var legacyMockCards = [];
      cards = cards.filter(function (c) {
        var isMock = c.id === mockScriptCardId(label) || c.title === MOCK_SCRIPT_TITLE;
        if (isMock) {
          legacyMockCards.push(c);
          return false;
        }
        return true;
      });
      cards.forEach(function (c) { $("lcnNoteCol").appendChild(noteCardEl(c, label, updateNoteCount)); });
      updateNoteCount();
      renderSolution();
      api("GET", "/api/leetcode/notes/" + encodeURIComponent(mockKey)).then(function (mockData) {
        var mockCards = mockData.cards || [];
        if (!mockCards.length) {
          legacyMockCards.forEach(function (old) {
            if (!old.html) return;
            var migrated = {
              id: uid(),
              note_date: old.note_date || todayStr(),
              category: "",
              title: "",
              html: old.html
            };
            mockCards.push(migrated);
            api("PUT", "/api/leetcode/notes/card", {
              id: migrated.id,
              name: mockKey,
              note_date: migrated.note_date,
              category: "",
              title: "",
              html: migrated.html
            }).catch(function () {});
          });
        }
        renderMockBlocks(mockCards);
      }).catch(function () { updateMockCount(); });
    });
  }

  /* ---------- 笔记卡（多卡）：题目页 Notes 列和章节页右列共用（2026-08-21
     从 buildQuestionPage 抽出，为了章节页也能 "+ New note"）。
     card = lc_note_cards 的一行；name = 这批卡挂靠的 key（题目页是
     "num. name" label，章节页是 "ch-notes:<章标题>"）；onRemove 可选，
     删除落库后回调（题目页刷新右上角计数用）。
     这条笔记是讲语法还是讲逻辑，自己选、不选也行（Syntax/Logic 各一个
     按钮，跟 ckForm 的 Format 按钮一个路数：再点一下已选中的取消，回到
     "不选"）。存的是 category 字段，跟 line/note_date/html 一起落库。 ---------- */
  var NOTE_TAGS = [{ k: "syntax", label: "Syntax" }, { k: "logic", label: "Logic" }, { k: "debugging", label: "Debugging" }];
  function tagPickHtml(category) {
    return '<div class="lcn-tagpick">' + NOTE_TAGS.map(function (t) {
      return '<button type="button" class="lcn-tagbtn' + (category === t.k ? " sel" : "") +
        '" data-k="' + t.k + '">' + t.label + "</button>";
    }).join("") + "</div>";
  }
  function noteCardEl(card, name, onRemove, opt) {
    opt = opt || {};
    // 日期不再让用户挑（原来的 <input type="date"> 撤掉了，2026-08-12）——
    // 落库的 note_date 就是新建那一刻的系统日期，创建后只读展示，不会再变，
    // 所以这里存进闭包变量，每次 save() 原样带上，不给 UI 改的机会。
    var noteDate = card.note_date || todayStr();
    // 标题输入框跟 Syntax/Logic 挤同一行（2026-08-14）：一句话概括这条笔记
    // 讲的是什么，跟正文 html 分开存，方便以后笔记列表/搜索直接读它，
    // 不用扒正文第一行。不填也行，默认空字符串。
    var titleHtml = opt.fixedTitle
      ? '<div class="lcn-note-title lcn-note-title-static">' + esc(opt.fixedTitle) + "</div>"
      : '<input class="lcn-note-title" placeholder="' + esc(opt.titlePlaceholder || "Title (optional)") + '" value="' + esc(card.title || "") + '">';
    var node = el('<div class="lcn-note-card' + (opt.fixedClass ? " " + esc(opt.fixedClass) : "") +
      '" data-id="' + esc(card.id) + '" data-category="' + esc(card.category || "") + '">' +
      '<div class="lcn-note-sticky-head">' +
      '<div class="lcn-note-head">' +
        titleHtml +
        (opt.fixedTitle || opt.hideTags ? "" : tagPickHtml(card.category || "")) +
        (opt.fixedTitle ? "" : '<button class="lcn-del">✕</button>') +
      "</div>" +
      lcnToolbarHtml(TB_FULL) + "</div>" +
      '<div class="lcn-body" contenteditable="true"' +
        (opt.placeholder ? ' data-ph="' + esc(opt.placeholder) + '"' : "") + '></div>' +
      '<div class="lcn-note-foot">' +
        '<span class="lcn-meta lcn-note-dates">' + esc(noteDate.slice(5, 10)) +
          (card.updated_at ? " · edited " + esc(card.updated_at.slice(5, 16)) : "") + "</span>" +
        '<span class="lcn-saved"></span>' +
      "</div></div>");
    node.querySelector(".lcn-body").innerHTML = card.html || "";
    wireEditor(node);
    var save = function () {
      return api("PUT", "/api/leetcode/notes/card", {
        id: card.id, name: name,
        note_date: noteDate,
        category: node.dataset.category || "",
        title: opt.fixedTitle || node.querySelector(".lcn-note-title").value,
        html: node.querySelector(".lcn-body").innerHTML
      });
    };
    var debouncedSave = autosave(node.querySelector(".lcn-body"), node.querySelector(".lcn-saved"), save);
    var titleInput = opt.fixedTitle ? null : node.querySelector(".lcn-note-title");
    if (titleInput) {
      titleInput.addEventListener("input", function () {
        var savedEl = node.querySelector(".lcn-saved");
        if (savedEl) savedEl.textContent = "Saving…";
        debouncedSave();
      });
    }
    var tagPick = node.querySelector(".lcn-tagpick");
    if (tagPick) {
      tagPick.addEventListener("click", function (e) {
        var b = e.target.closest(".lcn-tagbtn");
        if (!b) return;
        node.dataset.category = node.dataset.category === b.dataset.k ? "" : b.dataset.k;
        node.querySelectorAll(".lcn-tagbtn").forEach(function (x) {
          x.classList.toggle("sel", x.dataset.k === node.dataset.category);
        });
        save();
      });
    }
    var del = node.querySelector(".lcn-del");
    if (del) {
      del.addEventListener("click", function () {
        lcnConfirm("Delete this note?").then(function (ok) {
          if (!ok) return;
          api("DELETE", "/api/leetcode/notes/card/" + card.id).catch(function () {});
          node.remove();
          if (onRemove) onRemove();
        });
      });
    }
    return node;
  }

  /* ---------- 自命名 block（分类页用）：lc_custom_blocks 的一行。标题自己起，
     正文跟笔记卡同一套富文本编辑器；name = "sec:<章标题>|<分类标题>"。
     后端 API（/api/leetcode/notes/block）是 Life OS 迁移时就带过来的，
     2026-08-21 分类页上线才第一次有前端用它。 ---------- */
  function blockEl(blk, name) {
    var node = el('<div class="lcn-note-card" data-id="' + blk.id + '">' +
      '<div class="lcn-note-sticky-head">' +
      '<div class="lcn-note-head">' +
        '<input class="lcn-note-title" placeholder="Block title" value="' + esc(blk.title || "") + '">' +
        '<button class="lcn-del">✕</button>' +
      "</div>" +
      lcnToolbarHtml(TB_FULL) + "</div>" +
      '<div class="lcn-body" contenteditable="true"></div>' +
      '<div class="lcn-note-foot">' +
        '<span class="lcn-meta">' + (blk.updated_at ? "edited " + esc(blk.updated_at.slice(5, 16)) : "") + "</span>" +
        '<span class="lcn-saved"></span>' +
      "</div></div>");
    node.querySelector(".lcn-body").innerHTML = blk.html || "";
    wireEditor(node);
    var save = function () {
      return api("PUT", "/api/leetcode/notes/block", {
        id: blk.id, name: name,
        title: node.querySelector(".lcn-note-title").value,
        html: node.querySelector(".lcn-body").innerHTML
      });
    };
    var debouncedSave = autosave(node.querySelector(".lcn-body"), node.querySelector(".lcn-saved"), save);
    node.querySelector(".lcn-note-title").addEventListener("input", function () {
      var savedEl = node.querySelector(".lcn-saved");
      if (savedEl) savedEl.textContent = "Saving…";
      debouncedSave();
    });
    node.querySelector(".lcn-del").addEventListener("click", function () {
      lcnConfirm("Delete this block?").then(function (ok) {
        if (!ok) return;
        api("DELETE", "/api/leetcode/notes/block/" + blk.id).catch(function () {});
        node.remove();
      });
    });
    return node;
  }

  /* ---------- scope 笔记卡（index Overview / 章 Methodology / 分类）：单条大笔记 ---------- */
  function scopeCard(title, scopeKey, metaText) {
    var node = el('<div class="lcn-card"><h3>' + esc(title) +
      ' <span class="lcn-grow"></span><span class="lcn-meta">' + esc(metaText || "autosaves") + "</span></h3>" +
      lcnToolbarHtml(TB_FULL) + '<div class="lcn-body" contenteditable="true"></div><div class="lcn-saved"></div></div>');
    wireEditor(node);
    autosave(node, node.querySelector(".lcn-saved"), function () {
      return api("PUT", "/api/leetcode/notes-scope/" + encodeURIComponent(scopeKey),
        { html: node.querySelector(".lcn-body").innerHTML });
    });
    api("GET", "/api/leetcode/notes-scope/" + encodeURIComponent(scopeKey)).then(function (d) {
      node.querySelector(".lcn-body").innerHTML = d.html || "";
    });
    return node;
  }

  /* ---------- 表达库（scope='all' 或 'ch:<章>'；章级带 ↑ All 提升） ---------- */
  function exprCard(title, scope, opt) {
    opt = opt || {};
    var node = el('<div class="lcn-card"><h3>' + esc(title) +
      ' <span class="lcn-grow"></span><span class="lcn-meta">' + esc(opt.meta || "") + "</span></h3>" +
      '<div class="lcn-expr-list"></div>' +
      '<div class="lcn-add-row"><input class="lcn-add-input" placeholder="Add an expression…">' +
      '<button class="lcn-btn lcn-btn-sm">Add</button></div></div>');
    var list = node.querySelector(".lcn-expr-list");
    function rowEl(x) {
      var r = el('<div class="lcn-expr"><div class="lcn-expr-body">' + esc(x.text) +
        (x.source ? '<div class="lcn-expr-src">from ' + esc(x.source) + "</div>" : "") + "</div>" +
        '<div style="display:flex;gap:5px;flex:none">' +
        (opt.promote ? '<button class="lcn-pill" data-act="up">↑ All</button>' : "") +
        '<button class="lcn-pill" data-act="del">✕</button></div></div>');
      r.querySelector('[data-act="del"]').addEventListener("click", function () {
        api("DELETE", "/api/leetcode/expressions/" + x.id).catch(function () {});
        r.remove();
      });
      var up = r.querySelector('[data-act="up"]');
      if (up) up.addEventListener("click", function () {
        if (up.classList.contains("lcn-done")) return;
        api("POST", "/api/leetcode/expressions", { id: uid(), scope: "all", text: x.text, source: opt.promoteSource || "" })
          .then(function () { up.classList.add("lcn-done"); up.textContent = "✓ All"; });
      });
      return r;
    }
    node.querySelector(".lcn-btn").addEventListener("click", function () {
      var inp = node.querySelector(".lcn-add-input");
      var text = inp.value.trim();
      if (!text) return;
      var x = { id: uid(), scope: scope, text: text, source: "" };
      api("POST", "/api/leetcode/expressions", x).then(function (saved) {
        list.prepend(rowEl(saved));
        inp.value = "";
      });
    });
    api("GET", "/api/leetcode/expressions?scope=" + encodeURIComponent(scope)).then(function (rows) {
      rows.forEach(function (x) { list.appendChild(rowEl(x)); });
    });
    return node;
  }

  /* ---------- index.html：顶部 All LeetCode 区 ---------- */
  /* 2026-08-05 首页大扫除：Overview Notes / Expression Bank 两张卡从首页
     撤下（用户要求首页只留标题）。数据和 /api/leetcode/notes-scope、
     /api/leetcode/expressions 接口都还在，章节页的同类卡不受影响，
     以后要加回来把这里恢复成注入两张卡即可。 */
  function buildIndex() {}

  /* ---------- Lyon 课件（章级，写死在代码里，不走 contenteditable/autosave）
     ---------- 2026-08-06：内容照抄 Lyon 上课用的课件原文，用户不该能改动
     它——只有还没整理课件的章节没有条目，显示 coming soon。 */
  var LYON_NOTES = {
    // 原样照搬自 leetcode/4-leetcode-fill-in/chapters/ch02/ch02-notes.html
    // （2026-08-14）：脑图 SVG（Recursion → Traversal / D&C）和 Traversal vs
    // D&C 对比表都是原文（表格样式 .lcn-cmp-table 在 notes.css，SVG 自带
    // 全部样式不依赖外部）。
    "chapter-2":
      '<svg viewBox="0 0 700 290" xmlns="http://www.w3.org/2000/svg" font-family="Inter, sans-serif" style="display:block;width:100%;max-width:700px;margin:0 auto 10px;">' +
        '<defs>' +
          '<marker id="lcn-ch2-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">' +
            '<path d="M0,0 L0,7 L7,3.5 z" fill="#555"/>' +
          '</marker>' +
        '</defs>' +
        '<line x1="350" y1="68" x2="155" y2="135" stroke="#555" stroke-width="1.5" marker-end="url(#lcn-ch2-a)"/>' +
        '<line x1="350" y1="68" x2="545" y2="135" stroke="#555" stroke-width="1.5" marker-end="url(#lcn-ch2-a)"/>' +
        '<line x1="155" y1="181" x2="80"  y2="229" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>' +
        '<line x1="155" y1="181" x2="230" y2="229" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>' +
        '<line x1="545" y1="181" x2="480" y2="229" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>' +
        '<line x1="545" y1="181" x2="620" y2="229" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>' +
        '<rect x="270" y="20" width="160" height="48" rx="8" fill="#ede9d5" stroke="none"/>' +
        '<text x="350" y="40" text-anchor="middle" font-size="14" font-weight="600" fill="#1a1a1a">Recursion</text>' +
        '<text x="350" y="57" text-anchor="middle" font-size="11" fill="#1a1a1a">递归</text>' +
        '<rect x="55" y="135" width="200" height="46" rx="7" fill="#d6e4d2" stroke="none"/>' +
        '<text x="155" y="155" text-anchor="middle" font-size="13" font-weight="600" fill="#1a1a1a">Traversal</text>' +
        '<text x="155" y="171" text-anchor="middle" font-size="11" fill="#1a1a1a">遍历</text>' +
        '<rect x="445" y="135" width="200" height="46" rx="7" fill="#cfdde8" stroke="none"/>' +
        '<text x="545" y="155" text-anchor="middle" font-size="13" font-weight="600" fill="#1a1a1a">Divide &amp; Conquer</text>' +
        '<text x="545" y="171" text-anchor="middle" font-size="11" fill="#1a1a1a">分治</text>' +
        '<rect x="20"  y="229" width="120" height="40" rx="5" fill="#e8f0e6" stroke="none"/>' +
        '<text x="80"  y="245" text-anchor="middle" font-size="11" font-weight="500" fill="#1a1a1a">全局变量</text>' +
        '<text x="80"  y="260" text-anchor="middle" font-size="9"  fill="#1a1a1a">global variable</text>' +
        '<rect x="170" y="229" width="120" height="40" rx="5" fill="#e8f0e6" stroke="none"/>' +
        '<text x="230" y="245" text-anchor="middle" font-size="11" font-weight="500" fill="#1a1a1a">向下传值</text>' +
        '<text x="230" y="260" text-anchor="middle" font-size="9"  fill="#1a1a1a">pass-down</text>' +
        '<rect x="420" y="229" width="120" height="40" rx="5" fill="#dde8f0" stroke="none"/>' +
        '<text x="480" y="245" text-anchor="middle" font-size="11" font-weight="500" fill="#1a1a1a">构造返回值</text>' +
        '<text x="480" y="260" text-anchor="middle" font-size="9"  fill="#1a1a1a">return value</text>' +
        '<rect x="560" y="229" width="120" height="40" rx="5" fill="#dde8f0" stroke="none"/>' +
        '<text x="620" y="245" text-anchor="middle" font-size="11" font-weight="500" fill="#1a1a1a">合并子结果</text>' +
        '<text x="620" y="260" text-anchor="middle" font-size="9"  fill="#1a1a1a">merge results</text>' +
      '</svg>' +
      '<table class="lcn-cmp-table">' +
        "<tr><th></th><th>Traversal</th><th>Divide &amp; Conquer</th></tr>" +
        "<tr><td>思路</td>" +
          "<td>当我到达这一层时，应该做什么，向下传递的路线应该怎么走。应该传递什么值去下一层。遍历的解法，一般都需要一个全局变量来记录我遍历之后的结果，如 max, min, list 等。</td>" +
          "<td>我的左儿子，右儿子得到返回值以后，我拿着左右儿子的结果，应该怎么做。分治的最核心点在于构造返回值。</td></tr>" +
        "<tr><td>Top-down</td><td>preorder - process node first</td><td>pass value downward as parameter</td></tr>" +
        "<tr><td>Bottom-up</td><td>postorder - process node last</td><td>return value upward to parent</td></tr>" +
        "<tr><td>Result carried by</td><td><b>global variable / parameter</b></td><td><b>return value</b></td></tr>" +
      "</table>",
    "chapter-3":
      "<h4>BFS 的适用范围</h4>" +
      "<div>层级遍历 Level Order Traversal</div>" +
      "<div>拓扑排序 Topological sorting</div>" +
      "<div>Shortest Path in Simple Graph (Same Weight)</div>" +
      "<h4>使用 BFS 的几个问题</h4>" +
      "<div>BFS 初始的种子是什么？</div>" +
      "<div>队列中存储的结构是什么？</div>" +
      "<div>要不要记录层级信息(size)，初始的 level 是 0 还是 1？</div>" +
      "<div>是否需要 visited 记录访问过的点，以防止回头？</div>" +
      "<h4>层级遍历重点</h4>" +
      "<div>层级遍历时，step+1 需要放在层级遍历结束之后，根据题意 step 的初始值 0 or -1</div>" +
      "<div>Level order 遍历时如果要记录 level order 结果的话，要注意最后一轮可能 temp 为空，加入 res 之前要做判定 temp</div>" +
      "<h4>队列元素 Visited</h4>" +
      "<div>在入队列的时候更新 visited：起点需要先放入 visited 或者结果中</div>" +
      "<div>在出队列的时候更新 visited：入队之前除了要检查 visited，还要 check queue 里有没有重复元素。</div>" +
      "<h4>最小生成树问题</h4>" +
      "<div>使用 Heap 做 BFS</div>" +
      "<ul>" +
        "<li>入 Heap 之前检测 visited 防止死循环</li>" +
        "<li>pop 之后如果发现已经访问过或者代价比记录高就 skip</li>" +
        "<li>出队列时更新 visited 结果</li>" +
      "</ul>" +
      "<h4>重点</h4>" +
      "<div>能够用 BFS 解决的问题，一定不要用 DFS 去做！</div>",
    "chapter-4":
      "<h4>DFS 的适用范围</h4>" +
      "<div>Combination 问题（所有可能的组合）</div>" +
      "<div>Permutation 问题（所有可能的排列）</div>" +
      "<h4>使用 DFS 之前需要想清楚 3 问题</h4>" +
      "<ol>" +
        "<li>函数与参数的定义</li>" +
        "<li>递归的拆解</li>" +
        "<li>递归的出口</li>" +
      "</ol>" +
      // 下面三条不在 Lyon 课件正文里，是课上讲的三类分法的判据——课件本身只
      // 给了一份 Combination 模板，分类的区别全在 for 循环的起点/去重上，
      // 不写出来光看模板看不出 Permutation 和 Grid 该改哪里。
      "<h4>三类 DFS 的区别</h4>" +
      "<div>Combination：用 startIndex 只往后走，不回头看前面的元素</div>" +
      "<div>Permutation：每次都从头遍历，跳过已经在 temp 里的元素</div>" +
      "<div>Graph / Grid：既不是组合也不是排列，在二维格子或图上搜索</div>",
    // 照抄自 leetcode/4-leetcode-fill-in/chapters/ch05/ch05-notes.html（2026-08-13）。
    // 那份课件本身概念笔记很短，篇幅主要在 Recommended Practice Order 表格 /
    // 按分类分组的题目链接——这两块挪进了 catalog.js 的 chapter-5 sections
    // （题目卡 + 分类标题 lcn-ch-sec），不在这张纯文字卡里重复。
    "chapter-5":
      "<h4>图的问题</h4>" +
      "<div>1. 如何构建图：邻接表</div>" +
      "<div>2. 如何遍历图：BFS + DFS</div>",
    // 照抄自 leetcode/4-leetcode-fill-in/chapters/ch06/ch06-notes.html
    // （2026-08-15）。这份课件本身概念笔记也很短，跟 chapter-5 一样，建议做题
    // 顺序表 / 按分类分组的题目链接挪进了 catalog.js 的 chapter-6 sections
    // （Two Pointer / Linked List 两个 section），不在这张纯文字卡里重复。
    // 课件原文没有给任何 Python 模板，所以 LYON_TEMPLATES 里没加对应条目——
    // 两个分类的模板卡照样显示 coming soon，不是漏做。
    "chapter-6":
      "<h4>Two Pointer 的适用范围</h4>" +
      "<div>字符串操作 (in place)</div>" +
      "<div>线性操作 LinkedList, ArrayList, Substring 问题</div>" +
      "<h4>明确 Two Pointer 的几个问题</h4>" +
      "<div>Fixed Pointer and Float Pointer 定义是什么</div>" +
      "<div>谁是 fixed pointer</div>" +
      "<div>谁是 float pointer，float pointer 如何移动</div>",
    // 照抄自 Lyon 第七章课件原文（2026-08-20，同
    // leetcode/3-leetcode-lecture-notes/ch07-notes.md 的知识点总结）。
    "chapter-7":
      "<h4>Heap 解决的问题</h4>" +
      "<div>从 N 个数找最大/最小的数</div>" +
      "<div>Push, Pop O(LGN)</div>" +
      "<div>Peek O(1)</div>" +
      "<h4>TOPK 问题</h4>" +
      "<div>从 N 个数找第 K 大的数/第 K 小的数（第 K 大则用 MinHeap，反之则用 maxHeap）</div>" +
      "<h4>单调栈问题</h4>" +
      "<div>单调递增栈：在 O(N) 的时间复杂度内，找到第一个比当前元素小的值</div>" +
      "<div>单调递减栈：在 O(N) 的时间复杂度内，找到第一个比当前元素大的值</div>",
    // 照抄自 Lyon 第九章课件截图（2026-08-29，
    // 3-leetcode-lecture-notes/算法课件第五期 (截图)/9 - ... page1/2.png）。
    // 只搬笔记：概念 + 例题。题目链接在下面的分类卡里、模板在模板卡里，不重复。
    // 前缀和公式课件给了两种写法：第一种多补一个 0（长度 n+1），跟 Python
    // 模板一致；第二种不补 0，用 presum[i-1]。
    "chapter-9":
      "<h4>Prefix Sum</h4>" +
      "<div><code>List[1, 3, 4, 5, 67]</code> — 计算第 I – J 之间的 sum</div>" +
      "<div><code>sum[i,j] = PreSum[J+1] - PreSum[i]</code>　<code>prefixArr[i] = 【0, -2, -2, 1, -4, -2, -3】</code></div>" +
      "<div><code>sum[i,j] = presum[j] - presum[i-1]</code>　<code>prefixArr[i] = 【-2, -2, 1, -4, -2, -3】</code></div>" +
      "<h4>例题</h4>" +
      "<div>输入：数组记录每天安保数量，时间间隔 time</div>" +
      "<div>小偷去偷东西，输出一个 list，保证之前 time 天到第 i 天每天安保数量递减，第 i 天到后面 time 天每天安保数量递增，保存 i。</div>" +
      "<div>比如输入 <code>security = [5, 3, 3, 3, 4, 6]</code>，<code>time = 2</code>，输出 <code>[3, 4]</code></div>" +
      "<pre>0 1 2 3 0 0\n0 4 3 2 1 0</pre>",
  };
  function lyonCard(chId) {
    var html = LYON_NOTES[chId];
    return el('<div class="lcn-card"><h3>Lyon 课件 <span class="lcn-grow"></span><span class="lcn-meta">只读</span></h3>' +
      '<div class="lcn-body">' + (html || '<div class="lcn-empty">coming soon</div>') + "</div></div>");
  }

  /* ---------- Lyon Python 模板（分类级，写死，原文照抄自旧站
     leetcode/4-leetcode-fill-in/chapters/ch03/ch03-notes.html）——key 是
     "章 id|分类标题"，跟 sidebar/notes.js 里派生 scope key 的写法一致，
     方便以后按同样规律给别的章节 / 分类续上模板。 */
  var LYON_TEMPLATES = {
    // 照抄自 leetcode/4-leetcode-fill-in/chapters/ch02/ch02-notes.html
    // （2026-08-14）。那页还有一份 Java 版没搬——跟其它章 "python only" 一致。
    "chapter-2|Tree DFS — Divide and Conquer": [
      { title: "Tree Divide and Conquer DFS Python 模板",
        code: "def dfs(self, root):\n" +
          "    if not root:\n" +
          "        return 0\n" +
          "\n" +
          "    leftReturn = self.dfs(root.left)\n" +
          "    rightReturn = self.dfs(root.right)\n" +
          "\n" +
          "    # Optional Leaf processing\n" +
          "    if root.left is None and root.right is None:\n" +
          "        return 1\n" +
          "\n" +
          "    height = max(leftReturn, rightReturn) + 1\n" +
          "    return height" },
    ],
    "chapter-3|BFS": [
      { title: "BFS 坐标类 Python 模板",
        code: "def bfs(self, grid, queue, visited):\n" +
          "    step = -1\n" +
          "    while len(queue) > 0:\n" +
          "        size = len(queue)\n" +
          "        for _ in range(size):\n" +
          "            x,y = queue.popleft()\n" +
          "            for dx,dy in [(0,1),(0,-1),(1,0),(-1,0)]:\n" +
          "                newx = x + dx\n" +
          "                newy = y + dy\n" +
          "                if self.isValid(newx,newy, grid, visited):\n" +
          "                    visited.add((newx,newy))\n" +
          "                    queue.append((newx,newy))\n" +
          "        step +=1\n" +
          "    return step\n" +
          "\n" +
          "def isValid(self,x,y,grid, visited):\n" +
          "    return 0<=x<len(grid) and 0<=y<len(grid[0]) and (x,y) not in visited and grid[x][y] == 1" },
      { title: "BFS Level order Python 模板",
        code: "def bfs(self, node, res):\n" +
          "    import collections\n" +
          "    queue = collections.deque([])\n" +
          "    queue.append(node)\n" +
          "\n" +
          "    while len(queue) > 0:\n" +
          "        size = len(queue)\n" +
          "        temp = []\n" +
          "        for _ in range(size):\n" +
          "            curr = queue.popleft()\n" +
          "            if curr:\n" +
          "                levelRes.append(curr.val)\n" +
          "                queue.append(curr.left)\n" +
          "                queue.append(curr.right)\n" +
          "        if temp:\n" +
          "            res.append(temp)" },
    ],
    "chapter-3|BFS + Heap: Dijkstra": [
      { title: "Dijkstra Python 模板",
        code: "def dijkstra(self, heap, n, graph):\n" +
          "    visited = {}\n" +
          "\n" +
          "    while len(heap) > 0:\n" +
          "        curr, node = heapq.heappop(heap)\n" +
          "\n" +
          "        if node in visited and visited[node] < curr:\n" +
          "            continue\n" +
          "        visited[node] = curr\n" +
          "        if len(visited) == n:\n" +
          "            return curr\n" +
          "        for val, nextNode in graph[node]:\n" +
          "            if nextNode not in visited:\n" +
          "                heapq.heappush(heap, (val + curr, nextNode))\n" +
          "\n" +
          "    return -1" },
    ],
    // 第四章的课件只给了一份 Combination 模板（Python + Java 两版），另外两个
    // 分类没有。这里 Combination 是课件原文照抄（只留 Python，跟第三章的
    // "python only" 一致），Permutation / Grid 两份是从 Lyon 的答案里抽出来的
    // 骨架（46 / 79），保持他本人的写法，没有另外发明。
    "chapter-4|Combinations": [
      { title: "DFS Combination Python 模板",
        code: "def dfs(self, candidates, temp, res, target, startIndex):\n" +
          "    if sum(temp) == target:\n" +
          "        res.append(temp + [])  # deepcopy\n" +
          "        return\n" +
          "\n" +
          "    if sum(temp) > target:  # early terminate\n" +
          "        return\n" +
          "\n" +
          "    for i in range(startIndex, len(candidates)):\n" +
          "        # 以 startIndex 对应数字开始\n" +
          "        num = candidates[i]\n" +
          "        temp.append(num)\n" +
          "        self.dfs(candidates, temp, res, target, i)  # i or i+1\n" +
          "        temp.pop(-1)",
        // roles / same 见 tmplCodeHtml：给参数按"角色"上底色，两份模板里角色
        // 相同的参数用同一种色（candidates↔nums、startIndex↔visited），
        // same 是跟 Permutation 那份逐字一模一样的行号（0 起）。
        roles: { candidates: "arr", temp: "temp", res: "res", target: "target", startIndex: "pick" },
        same: [2, 3, 11, 13] },
    ],
    "chapter-4|Permutations": [
      { title: "DFS Permutation Python 模板",
        code: "def dfs(self, nums, temp, res, visited):\n" +
          "    if len(temp) == len(nums):\n" +
          "        res.append(temp + [])  # deepcopy\n" +
          "        return\n" +
          "\n" +
          "    for i in range(0, len(nums)):  # 每次都从头开始，不用 startIndex\n" +
          "        if i in visited:           # 已经在 temp 里的跳过\n" +
          "            continue\n" +
          "        num = nums[i]\n" +
          "        visited.add(i)\n" +
          "        temp.append(num)\n" +
          "        self.dfs(nums, temp, res, visited)\n" +
          "        visited.remove(i)\n" +
          "        temp.pop(-1)",
        // 跟 Combination 那份对照着看：nums 就是它的 candidates，visited 就是它的
        // startIndex——都是"这一层还能挑哪些"的手段，只是一个用下界一个用集合。
        roles: { nums: "arr", temp: "temp", res: "res", visited: "pick" },
        same: [2, 3, 10, 13] },
    ],
    "chapter-4|Graph / Grid DFS": [
      { title: "DFS 坐标类 Python 模板",
        code: "def dfs(self, i, j, board, index, word, visited):\n" +
          "    if index < len(word) and word[index] != board[i][j]:\n" +
          "        return False\n" +
          "    if index == len(word) - 1:\n" +
          "        return True\n" +
          "\n" +
          "    visited.add((i,j))\n" +
          "    for (di, dj) in [(0,1), (0,-1), (1,0), (-1,0)]:\n" +
          "        newi = i + di\n" +
          "        newj = j + dj\n" +
          "        if not (0<=newi<len(board) and 0<=newj<len(board[0])):\n" +
          "            continue\n" +
          "        if (newi,newj) in visited:\n" +
          "            continue\n" +
          "        if self.dfs(newi, newj, board, index + 1, word, visited):\n" +
          "            return True\n" +
          "    visited.remove((i,j))  # 回溯：这条路走不通，把格子还回去" },
    ],
    // 照抄自 leetcode/4-leetcode-fill-in/chapters/ch05/ch05-notes.html（2026-08-13）。
    // 课件原文只给了两份模板（BFS/DFS 各一份 Python + 一份 Java），跟第三/四章
    // 的惯例一致只留 Python 那份（卡头写死"python only"）。课件本身没有按分类
    // 分开挂，这里按内容对应到最贴切的分类：BFS Traverse Graph → BFS 分类，
    // DFS Traverse Graph → DFS / Backtracking 分类。"Graph Theory (BFS + DFS)"
    // 分类没有专属模板，跟第四章 Permutations/Graph 那些一样显示 coming soon。
    "chapter-5|BFS": [
      { title: "BFS Traverse Graph Python 模板",
        code: "graphs = collections.defaultdict(list)\n" +
          "# Create Graph\n" +
          "for edge in edges:\n" +
          "    start = edge[0]\n" +
          "    end = edge[1]\n" +
          "    graphs[start].append(end)\n" +
          "    graphs[end].append(start)\n" +
          "\n" +
          "queue = collections.deque([])\n" +
          "visited = {1}\n" +
          "queue.append(1)\n" +
          "while len(queue) > 0:\n" +
          "    size = len(queue)\n" +
          "    for _ in range(size):\n" +
          "        curr = queue.popleft()\n" +
          "        neighbours = graphs.get(curr, [])\n" +
          "        for neighbour in neighbours:\n" +
          "            if neighbour not in visited:\n" +
          "                visited.add(neighbour)\n" +
          "                queue.append(neighbour)\n" +
          "\n" +
          "return len(visited) == n" },
    ],
    "chapter-5|DFS / Backtracking": [
      { title: "DFS Traverse Graph Python 模板",
        code: "def DFS(self, graph, node, target, path):\n" +
          "    if node == target:\n" +
          "        self.paths.append(list(path))\n" +
          "        return\n" +
          "\n" +
          "    for node_next in graph[node]:\n" +
          "        path.append(node_next)\n" +
          "        self.DFS(graph, node_next, target, path)\n" +
          "        path.pop()" },
    ],
    // 照抄自 Lyon 第七章课件原文（2026-08-20，截图见 3-leetcode-lecture-notes/
    // 算法课件第五期 (截图)/7 - ... page1/page2.png）。课件还有 Java 版没搬，
    // 跟其它章 "python only" 一致。Top K 分类 2026-08-20 已并入 Heap（见
    // catalog.js），这份 Heap 模板本身就是 692 Top K Frequent Words 的写法，
    // 正好归位；Hashmap 分类没有专属模板，显示 coming soon 不是漏做。
    "chapter-7|Heap": [
      { title: "Heap Python 模板",
        code: "maps = {}\n" +
          "\n" +
          "for i in words:\n" +
          "    maps[i] = maps.get(i, 0) + 1\n" +
          "\n" +
          "heap = []\n" +
          "\n" +
          "for word, count in maps.items():\n" +
          "    heapq.heappush(heap, Item(count, word))\n" +
          "    if len(heap) > k:\n" +
          "        heapq.heappop(heap)" },
    ],
    "chapter-7|Monotonic Stack": [
      { title: "Mono Stack Python 模板",
        code: "stack = []\n" +
          "maps = {}\n" +
          "\n" +
          "for index, num in enumerate(nums):\n" +
          "    while stack and num > nums[stack[-1]]:\n" +
          "        key = stack.pop()\n" +
          "        maps[key] = index\n" +
          "    stack.append(index)" },
    ],
    // 照抄自 Lyon 第九章课件（2026-08-29）。课件只给了 Prefix Sum 的模板，
    // Stack / DP 两个分类没有——那两张模板卡照样 coming soon，不是漏做。
    "chapter-9|Prefix Sum": [
      { title: "Prefix Sum Python 模板",
        code: "self.prefix = [0] * (len(nums) + 1)\n" +
          "for i, val in enumerate(nums):\n" +
          "    self.prefix[i+1] = self.prefix[i] + val\n" +
          "return self.prefix[right+1] - self.prefix[left]" },
    ],
  };
  /* ---------- 模板代码的对照上色 ----------
     两份模板并排看的时候，最想知道的是"哪些是同一回事、哪些不一样"。所以：
       · 参数按角色上底色，同一个角色在两份模板里颜色相同——candidates 和 nums
         都是"待选数组"，startIndex 和 visited 都是"这层还能挑哪些"，一眼对上；
       · 跟另一份逐字相同的行（same 里的行号）加绿底 = 公共骨架；
       · 注释一律灰底，跟代码本身区分开（注释里出现的 startIndex / temp 不上
         参数色，免得跟真正的代码混淆）。
     没写 roles / same 的模板照旧原样输出，不受影响。 */
  var TMPL_LEGEND = [
    { cls: "tm-arr",    label: "待选数组 candidates / nums" },
    { cls: "tm-temp",   label: "当前路径 temp" },
    { cls: "tm-res",    label: "结果 res" },
    { cls: "tm-pick",   label: "这层还能挑哪些 startIndex / visited" },
    { cls: "tm-target", label: "只有 Combination 有 target" },
    { cls: "tm-same",   label: "两份逐字相同" },
    { cls: "tm-note",   label: "注释" },
  ];

  function tmplCodeHtml(t) {
    if (!t.roles && !t.same) return esc(t.code);
    var same = t.same || [], roles = t.roles || {};
    // 一个正则一趟换完，不要一个名字一趟——分趟的话第二趟会匹配到第一趟刚写进去的
    // class="tm-mark tm-res" 里的 res（"-" 是非单词字符，\b 照样成立），HTML 就烂了。
    // 长名字排前面，保证 alternation 里先试长的。
    var names = Object.keys(roles).sort(function (a, b) { return b.length - a.length; });
    var nameRe = names.length ? new RegExp("\\b(" + names.join("|") + ")\\b", "g") : null;
    return t.code.split("\n").map(function (line, k) {
      // 先按第一个 # 切开：注释整段走灰底，不参与参数上色
      var hash = line.indexOf("#");
      var codePart = hash >= 0 ? line.slice(0, hash) : line;
      var notePart = hash >= 0 ? line.slice(hash) : "";
      // 缩进留在 chip 外面，绿底只包住真正的代码，不拖一条长尾巴
      var indent = codePart.match(/^\s*/)[0];
      var bodyHtml = esc(codePart.slice(indent.length));
      if (nameRe) bodyHtml = bodyHtml.replace(nameRe, function (m) {
        return '<span class="tm-mark tm-' + roles[m] + '">' + m + "</span>";
      });
      if (bodyHtml && same.indexOf(k) >= 0) {
        bodyHtml = '<span class="tm-mark tm-same">' + bodyHtml + "</span>";
      }
      var noteHtml = notePart ? '<span class="tm-mark tm-note">' + esc(notePart) + "</span>" : "";
      return indent + bodyHtml + noteHtml;
    }).join("\n");
  }

  function lyonTemplateCard(chId, secTitle) {
    var tmpls = LYON_TEMPLATES[chId + "|" + secTitle];
    // 只有一份模板时不写小标题：分类名已经在这一行上方的 .lcn-ch-sec 里，
    // 卡头也写着"Lyon Python 模板"，再来一行"DFS Combination Python 模板"
    // 是第三遍重复。两份以上才需要标题区分（如第三章 BFS 的坐标类 / Level
    // order），那时标题是有信息量的。
    var one = tmpls && tmpls.length === 1;
    var body = tmpls ? tmpls.map(function (t) {
      return (one ? "" : "<h4>" + esc(t.title) + "</h4>") + "<pre>" + tmplCodeHtml(t) + "</pre>";
    }).join("") : '<div class="lcn-empty">coming soon</div>';
    // 上了色才挂图例；没标 roles/same 的章节（第三章那些）保持原样不多一行
    if (tmpls && tmpls.some(function (t) { return t.roles || t.same; })) {
      body += '<div class="tm-legend">' + TMPL_LEGEND.map(function (x) {
        return '<span class="tm-leg"><span class="tm-mark ' + x.cls + '">&nbsp;&nbsp;</span>' +
          esc(x.label) + "</span>";
      }).join("") + "</div>";
    }
    return el('<div class="lcn-card"><h3>Lyon Python 模板 <span class="lcn-grow"></span><span class="lcn-meta">只读 · python only</span></h3>' +
      '<div class="lcn-body">' + body + "</div></div>");
  }

  /* ---------- chapter-notes.html?ch=… ---------- */
  function buildChapterPage() {
    var chId = new URLSearchParams(location.search).get("ch");
    var d = window.LC_ANIM_DATA;
    var ch = d && d.chapters.filter(function (c) { return c.id === chId; })[0];
    var host = document.querySelector(".content-wrapper") || document.body;
    if (!ch) { host.appendChild(el('<div class="lcn-zone"><div class="lcn-wrap"><div class="lcn-empty">未知章节</div></div></div>')); return; }
    var wrap = el('<div class="lcn-zone lcn-page"><div class="lcn-wrap">' +
      '<div class="lcn-title">' + esc(ch.title) + " — Notes</div>" +
      '<div class="lcn-stack"></div></div></div>');
    var stack = wrap.querySelector(".lcn-stack");
    // 整页两大列（2026-08-06 改版）：所有卡都是同一个 .lcn-ch-grid 的单元格
    // （左列加 lcn-ch-l、右列加 lcn-ch-r），而不是每行自己开一个小 grid——
    // 这样右列宽度由所有模板里最长一行代码统一决定，上下对齐成两根柱子。
    // 顶行：左边 Lyon 课件原文——写死不可编辑；右边是用户自己写的章级笔记，
    // 全新 scope key（跟旧的 "ch:" 区分），不会把 Lyon 课件搬进来之前用户
    // 已经存的内容带出来。Notes 卡加 lcn-ch-free：用户内容不参与右列量宽。
    var grid = el('<div class="lcn-ch-grid"></div>');
    var lyon = lyonCard(ch.id);
    lyon.classList.add("lcn-ch-l");
    // 右上格是一根小柱子（2026-08-21）：最上面还是原来的章级 scope 笔记卡
    // （数据不动），标题行加 "+ New note"——往下追加任意多张笔记卡，跟题目页
    // 同一个组件（noteCardEl）、同一张表（lc_note_cards），挂靠 key 复用
    // "ch-notes:<章标题>"（跟 scope 笔记同名但各存各的表，互不影响）。
    // 新建插在 scope 卡正下方 = 最新在上，跟题目页一致。
    var notesKey = "ch-notes:" + ch.title;
    var notesCol = el('<div class="lcn-col lcn-ch-r lcn-ch-free"></div>');
    var notes = scopeCard("Notes", notesKey);
    notesCol.appendChild(notes);
    var addNote = el('<button class="lcn-btn lcn-btn-sm">+ New note</button>');
    notes.querySelector("h3 .lcn-grow").after(addNote);
    addNote.addEventListener("click", function () {
      var card = { id: uid(), note_date: todayStr(), category: "", html: "" };
      api("PUT", "/api/leetcode/notes/card", { id: card.id, name: notesKey, note_date: card.note_date, category: "", html: "" });
      var node = noteCardEl(card, notesKey);
      notes.after(node);
      node.querySelector(".lcn-body").focus();
    });
    api("GET", "/api/leetcode/notes/" + encodeURIComponent(notesKey)).then(function (nd) {
      (nd.cards || []).forEach(function (c) { notesCol.appendChild(noteCardEl(c, notesKey)); });
    });
    grid.appendChild(lyon);
    grid.appendChild(notesCol);
    stack.appendChild(grid);
    // Mock Expressions 暂时下线（2026-08-06，用户要求）——exprCard 函数还在，
    // 以后要恢复直接把下面这行加回来即可：
    // stack.appendChild(exprCard("Mock Expressions", "ch:" + ch.title,
    //   { meta: "chapter-level phrases", promote: true, promoteSource: ch.title }));
    // 一个分类一行：左边题目列表，右边并排放该分类的 Lyon Python 模板——
    // 写死不可编辑（2026-08-06 改版，同 Lyon 课件的处理），原文照抄自旧站
    // ch03-notes.html，没录入模板的分类显示 coming soon。
    // 两张卡分别标左/右列后直接塞进大 grid，auto-placement 会按出现顺序
    // 一对一对往下排行。
    // 2026-08-08：分类名从题目卡的 h3 提到整行上方（.lcn-ch-sec 横跨两列），
    // 一行只出现一次——以前左卡写"COMBINATIONS"、右卡的模板又叫"DFS
    // Combination Python 模板"，同一个词读三遍。提上去之后题目卡就是纯链接列表。
    ch.sections.forEach(function (sec) {
      // 分类名右边一个小链接直达分类页（2026-08-21）——那边能自建 block
      grid.appendChild(el('<div class="lcn-ch-sec">' + esc(sec.title) +
        '<a class="lcn-sec-open" href="section-notes.html?ch=' + ch.id +
        "&sec=" + encodeURIComponent(sec.title) + '">notes →</a></div>'));
      var links = el('<div class="lcn-card lcn-ch-l"></div>');
      sec.problems.forEach(function (p) {
        links.appendChild(el('<a class="lcn-qlink" href="' + p.file + '">' +
          (p.num ? p.num + ". " : "") + esc(p.name) + "</a>"));
      });
      var tmpl = lyonTemplateCard(ch.id, sec.title);
      tmpl.classList.add("lcn-ch-r");
      grid.appendChild(links);
      grid.appendChild(tmpl);
    });
    host.appendChild(wrap);
  }

  /* ---------- section-notes.html?ch=…&sec=… ---------- */
  // 分类页（2026-08-21）：顶行左题目列表、右 Lyon 模板（跟章节页那一行
  // 同一对卡），下面是用户自建的 block 列——lc_custom_blocks，标题自己起，
  // "+ New block" 随便加，挂靠 key = "sec:<章标题>|<分类标题>"。
  function buildSectionPage() {
    var q = new URLSearchParams(location.search);
    var chId = q.get("ch"), secTitle = q.get("sec");
    var d = window.LC_ANIM_DATA;
    var ch = d && d.chapters.filter(function (c) { return c.id === chId; })[0];
    var sec = ch && ch.sections.filter(function (s) { return s.title === secTitle; })[0];
    var host = document.querySelector(".content-wrapper") || document.body;
    if (!sec) { host.appendChild(el('<div class="lcn-zone"><div class="lcn-wrap"><div class="lcn-empty">未知分类</div></div></div>')); return; }
    document.title = ch.title.split(" · ")[0] + " · " + sec.title;
    var wrap = el('<div class="lcn-zone lcn-page"><div class="lcn-wrap">' +
      '<div class="lcn-title">' + esc(ch.title.split(" · ")[0]) + " · " + esc(sec.title) + " — Notes</div>" +
      '<div class="lcn-stack"></div></div></div>');
    var stack = wrap.querySelector(".lcn-stack");
    var grid = el('<div class="lcn-ch-grid"></div>');
    var links = el('<div class="lcn-card lcn-ch-l"></div>');
    sec.problems.forEach(function (p) {
      links.appendChild(el('<a class="lcn-qlink" href="' + p.file + '">' +
        (p.num ? p.num + ". " : "") + esc(p.name) + "</a>"));
    });
    var tmpl = lyonTemplateCard(ch.id, sec.title);
    tmpl.classList.add("lcn-ch-r");
    grid.appendChild(links);
    grid.appendChild(tmpl);
    stack.appendChild(grid);
    var blocksKey = "sec:" + ch.title + "|" + sec.title;
    var bar = el('<div class="lcn-ch-sec" style="display:flex;align-items:center;gap:10px">Blocks' +
      '<button class="lcn-btn lcn-btn-sm">+ New block</button></div>');
    bar.querySelector("button").addEventListener("click", function () {
      var blk = { id: uid(), title: "", html: "" };
      api("PUT", "/api/leetcode/notes/block", { id: blk.id, name: blocksKey, title: "", html: "" });
      var node = blockEl(blk, blocksKey);
      stack.appendChild(node);
      node.querySelector(".lcn-note-title").focus();
    });
    stack.appendChild(bar);
    api("GET", "/api/leetcode/notes/" + encodeURIComponent(blocksKey)).then(function (nd) {
      (nd.blocks || []).forEach(function (b) { stack.appendChild(blockEl(b, blocksKey)); });
    });
    host.appendChild(wrap);
  }

  /* 独立笔记页复用题目页的卡片，各页面使用独立 key 持久化。 */
  function buildFreeNotesPage(notesKey) {
    var cards = document.getElementById("lcnFreeCards");
    var add = document.getElementById("lcnFreeAdd");
    var status = document.getElementById("lcnFreeStatus");
    function updateCount() {
      var count = cards.children.length;
      status.textContent = count ? count + " notes · Changes save automatically" : "Click + New note to start writing.";
    }
    add.addEventListener("click", function () {
      add.disabled = true;
      var card = { id: uid(), name: notesKey, note_date: todayStr(), title: "", category: "", html: "" };
      api("PUT", "/api/leetcode/notes/card", card).then(function (saved) {
        var node = noteCardEl(saved, notesKey, updateCount);
        cards.prepend(node);
        updateCount();
        node.querySelector(".lcn-body").focus();
      }).catch(function () {
        status.textContent = "Could not create note. Please try again.";
      }).finally(function () { add.disabled = false; });
    });
    return api("GET", "/api/leetcode/notes/" + encodeURIComponent(notesKey)).then(function (data) {
      (data.cards || []).forEach(function (card) { cards.appendChild(noteCardEl(card, notesKey, updateCount)); });
      updateCount();
      add.disabled = false;
    });
  }

  function algoBlockForFile(file) {
    var cat = window.LC_ALGO_CATALOG || {};
    var found = null;
    Object.keys(cat).some(function (colKey) {
      return (cat[colKey].blocks || []).some(function (block) {
        if (block.page !== file) return false;
        found = { colKey: colKey, block: block, heading: cat[colKey].heading };
        return true;
      });
    });
    return found;
  }

  function buildAlgoBlockNotesPage(hit) {
    var host = document.querySelector(".content-wrapper") || document.body;
    if (host.querySelector(".lcn-algo-notes")) return;
    var notesKey = "algo-notes:" + hit.block.id;
    var wrap = el('<div class="lcn-zone lcn-page lcn-algo-notes"><div class="lcn-wrap">' +
      '<div class="lcn-col">' +
        '<div class="lcn-card lcn-head-card">' +
          '<h3>Notes <span class="lcn-meta lcn-algo-note-count"></span></h3>' +
          '<span style="flex:1"></span><button class="lcn-btn lcn-btn-sm">+ New note</button>' +
        '</div>' +
        '<div class="lcn-empty lcn-algo-note-status">Loading notes…</div>' +
        '<div class="lcn-algo-note-cards lcn-col"></div>' +
      '</div></div></div>');
    var add = wrap.querySelector(".lcn-btn");
    var countEl = wrap.querySelector(".lcn-algo-note-count");
    var status = wrap.querySelector(".lcn-algo-note-status");
    var cards = wrap.querySelector(".lcn-algo-note-cards");
    function updateCount() {
      var count = cards.children.length;
      countEl.textContent = count ? "· " + count : "";
      status.textContent = count ? "Changes save automatically" : "Click + New note to start writing.";
    }
    add.addEventListener("click", function () {
      add.disabled = true;
      var card = { id: uid(), name: notesKey, note_date: todayStr(), title: "", category: "", html: "" };
      api("PUT", "/api/leetcode/notes/card", card).then(function (saved) {
        var node = noteCardEl(saved, notesKey, updateCount);
        cards.prepend(node);
        updateCount();
        node.querySelector(".lcn-body").focus();
      }).catch(function () {
        status.textContent = "Could not create note. Please try again.";
      }).finally(function () { add.disabled = false; });
    });
    host.appendChild(wrap);
    return api("GET", "/api/leetcode/notes/" + encodeURIComponent(notesKey)).then(function (data) {
      (data.cards || []).forEach(function (card) { cards.appendChild(noteCardEl(card, notesKey, updateCount)); });
      updateCount();
    }).catch(function () {
      status.textContent = "Could not load notes. Check the connection and refresh to retry.";
    });
  }

  /* ---------- 入口：先 ping 后端，不通就整体不注入 ---------- */
  api("GET", "/api/leetcode/notes-scope/ping").then(function () {
    // 全页面：拉星标 / 难题旗点亮侧栏（题目页的开关共用同一份缓存）
    Object.keys(LCN_FLAGS).forEach(function (kind) {
      lcnFlagsLoad(kind).then(function () { lcnSideFlagSync(kind); }).catch(function () {});
    });
    var file = location.pathname.split("/").pop() || "";
    var shellNum = document.body.dataset.lcNum;
    // 页面原有内容包进一个可切换的区（sidebar / script 除外）——动画页和
    // 图文页（OA 题解等）共用
    function wrapPageZone() {
      var zone = document.createElement("div");
      zone.id = "lcn-anim";
      Array.prototype.slice.call(document.body.children).forEach(function (c) {
        // sidebar / 收起后的定位 tab 都是全局浮层，不能被卷进动画区
        // （动画区默认隐藏，卷进去它们就消失了）
        if (c.tagName === "SCRIPT" || c.classList.contains("sidebar") ||
            c.classList.contains("sb-loc-tab") ||
            c.id === "lcn-anim") return;
        zone.appendChild(c);
      });
      document.body.appendChild(zone);
      return zone;
    }
    // catalog 里有真实页面（page: 图文页或无题号的 anim: 动画页，OA 题
    // 都是）？按文件名对 LC_ANIM_DATA。有题号的动画页不会走到这里——
    // 它们标题带 "数字. "，被上面的分支先接走
    function isCatalogPage() {
      var d = window.LC_ANIM_DATA;
      if (!d) return false;
      var hit = false;
      d.chapters.concat(d.others ? [d.others] : []).forEach(function (g) {
        (g.sections || []).forEach(function (sec) {
          (sec.problems || []).forEach(function (p) {
            if (p.file === file && !p.pending) hit = true;
          });
        });
      });
      return hit;
    }
    var algoBlockHit = algoBlockForFile(file);
    if (shellNum) {
      var hit = catalogLookup(shellNum);
      var label = hit ? hit.label : shellNum + ".";
      document.title = label + " · Notes";
      buildQuestionPage(label, { animZone: null });
    } else if (file === "" || file === "index.html") {
      buildIndex();
    } else if (file === "chapter-notes.html") {
      buildChapterPage();
    } else if (file === "section-notes.html") {
      buildSectionPage();
    } else if (file === "script.html") {
      return buildFreeNotesPage("script-notes:global");
    } else if (file === "python-grammar.html") {
      return buildFreeNotesPage("python-grammar-notes:global");
    } else if (algoBlockHit) {
      return buildAlgoBlockNotesPage(algoBlockHit);
    } else if (/^\d+\.\s/.test(document.title)) {
      // 只留 "739. Daily Temperatures"：破折号后的副标题（如 — Monotonic Stack
      // Animation）不进标题、也不进打卡/笔记的 key，才能按题号对上答案文件
      // 页面里若写了题面（.oa-layout，如 253），同样搬进 Notes 区 Solution 上方
      buildQuestionPage(document.title.trim().split(/\s+—\s+/)[0].trim(), { animZone: wrapPageZone() });
    } else if (isCatalogPage()) {
      // OA 等无题号的图文页也能打卡：key 用页面标题（= catalog 的
      // pageName，跟这题当年还是 placeholder 壳页时的 key 一致，历史不断）。
      // 形态跟题目页一样是 Notes / Animation（2026-08-16 改，原来开关叫
      // "Problem"）：题面挪进 Notes 区底部当只读块，Animation 区先放占位，
      // 以后给这题补动画时把占位换掉就行
      buildQuestionPage(document.title.trim(), { animZone: wrapPageZone() });
    }
  }).catch(function () {
    var status = document.getElementById("lcnFreeStatus");
    if (status) status.textContent = "Could not load notes. Check the connection and refresh to retry.";
  });
})();
