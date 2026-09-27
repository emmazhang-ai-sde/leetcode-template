"""LeetCode 项目后端。

2026-08-10 从 shuyangzhang-life-summary 拆出来的独立服务：只服务这个目录下的
静态内容（动画站 / 题解 / 讲义等）+ LC Notes 笔记系统的 API。

启动：./run.sh   然后打开 http://127.0.0.1:9009

跟 Life OS 的分工：Life OS 那边还留着一个"LeetCode · Class"上课笔记页
（打卡表单 + Notes/Follow-up + 讲题顺序），暂时没有搬过来，继续读写它自己
的 life.db。这边的 lc_checkins / lc_class_links 是从 life.db 迁移过来的
一份快照（见 migrate_data.py），迁移之后两边的打卡历史各自独立累计，不
互相同步——等以后 Class 页也搬过来了再考虑合并。
"""

import base64
import re
import uuid
from html import escape
from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

import db

ROOT = Path(__file__).parent.parent
CONTENT = ROOT / "leetcode"
NOTE_IMG_DIR = Path(__file__).parent / "note_images"
STANDARD_ANSWERS_DIR = CONTENT / "standard-answers"
USER_ANSWERS_DIR = CONTENT / "user-answers"
ANSWER_DIRS = (STANDARD_ANSWERS_DIR, USER_ANSWERS_DIR)

app = FastAPI(title="LeetCode")

# Life OS 的 "LeetCode · Class" 页跨源读 catalog.js（题目目录，纯 GET，只读
# 静态数据）用；只放这一个源、只放 GET，别的源/别的方法一律不放，别把
# /api/leetcode/* 的写接口也开放给跨源请求。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8787"],
    allow_methods=["GET"],
)


@app.on_event("startup")
def _startup():
    db.init()
    if not STANDARD_ANSWERS_DIR.is_dir():
        print(f"[warn] answer dir missing: {STANDARD_ANSWERS_DIR} —— 目录改名了？同步改 backend/main.py 顶部的路径常量")


class NoCacheStaticFiles(StaticFiles):
    """CSS/JS 也加 no-store：改完文件刷新就能看到最新版。"""

    def file_response(self, *args, **kwargs):
        resp = super().file_response(*args, **kwargs)
        resp.headers["Cache-Control"] = "no-store"
        return resp


@app.get("/")
def index():
    # index.html 2026-08-14 删了（不再用首页），落地页改为 BFS 算法汇总页
    return RedirectResponse("/leetcode-all-in-one/bfs-all-in-one.html")


# ---------- LeetCode Check-in ----------

@app.get("/api/leetcode/checkins")
def lc_checkins():
    return db.get_lc_checkins()


@app.post("/api/leetcode/checkins")
def lc_checkin(payload: dict):
    names = [n for n in (payload.get("names") or []) if (n or "").strip()]
    if not names or payload.get("score") is None or not payload.get("ts"):
        raise HTTPException(400, "缺少 names / ts / score")
    return db.add_lc_checkins(
        names, payload["ts"], payload["score"],
        payload.get("mode") or "", payload.get("source") or "", payload.get("note") or "",
        payload.get("code") or "")


@app.put("/api/leetcode/checkins/{cid}")
def lc_checkin_update(cid: int, payload: dict):
    if payload.get("score") is None or not payload.get("ts"):
        raise HTTPException(400, "缺少 ts / score")
    if not db.update_lc_checkin(
            cid, payload["ts"], payload["score"],
            payload.get("mode") or "", payload.get("note") or "", payload.get("code") or "",
            payload.get("source") or ""):
        raise HTTPException(404, "打卡记录不存在")
    return {"ok": True}


@app.delete("/api/leetcode/items/{name:path}")
def lc_delete_item(name: str):
    if not db.delete_lc_item(name):
        raise HTTPException(404, "条目不存在")
    return {"ok": True}


# ---------- 录屏回看链接（class.html 用） ----------

@app.get("/api/leetcode/class-links")
def lc_class_links():
    return db.get_lc_class_links()


@app.put("/api/leetcode/class-links/{day}")
def put_lc_class_link(day: str, payload: dict):
    return db.set_lc_class_link(day, payload.get("recording_link") or "", payload.get("password") or "")


# ---------- LC Notes（长在动画站里的笔记系统，notes.js 调用） ----------

def _answer_files():
    """standard-answers（template 自带标准答案）优先，user-answers（本地可选）
    补缺。每次现扫。"""
    for d in ANSWER_DIRS:
        # 标准答案目录改名/缺失时只丢一条警告、跳过这个目录，别让整个 notes 接口
        # 500。user-answers 是可选目录，缺了不警告。
        if not d.is_dir():
            if d == STANDARD_ANSWERS_DIR:
                print(f"[warn] answer dir missing: {d}")
            continue
        for p in sorted(d.iterdir()):
            if p.is_file() and not p.name.startswith("."):
                yield p


def _answer_index():
    """题号 → 答案文件。标准答案文件名不规则（"1.TwoSum.py"、"127. Word Ladder"
    连扩展名都没有），只认前导数字，其余不管。"""
    idx = {}
    for p in _answer_files():
        m = re.match(r"(\d+)", p.name)
        if m:
            idx.setdefault(m.group(1), p)
    return idx


def _slugify(s: str) -> str:
    # 无题号文件可能是驼峰名（FindKPairCount），先按大小写拆词再小写
    # 连字符化，和前端按题名生成的 slug（find-k-pair-count）对得上
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])", "-", s)
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def _answer_index_by_slug():
    """无题号答案文件（OA 题）：题名 slug → 文件。"""
    idx = {}
    for p in _answer_files():
        if not p.name[0].isdigit():
            idx.setdefault(_slugify(p.stem), p)
    return idx


@app.get("/api/leetcode/notes/{name:path}")
def lc_question_notes(name: str):
    data = db.get_lc_question_notes(name)
    num = name.split(".", 1)[0].strip()
    p = _answer_index().get(num)
    if p is None:
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        p = _answer_index_by_slug().get(slug)
    standard = p.read_text(encoding="utf-8") if p else ""
    data["standard"] = standard
    data["lyon"] = standard  # Backward-compatible key for older frontend code.
    return data


@app.put("/api/leetcode/notes/card")
def lc_put_note_card(payload: dict):
    if not payload.get("id") or not payload.get("name"):
        raise HTTPException(400, "缺少 id / name")
    return db.upsert_lc_note_card(payload)


@app.delete("/api/leetcode/notes/card/{card_id}")
def lc_delete_note_card(card_id: str):
    if not db.delete_lc_note_card(card_id):
        raise HTTPException(404, "笔记卡不存在")
    return {"ok": True}


@app.put("/api/leetcode/notes/block")
def lc_put_custom_block(payload: dict):
    if not payload.get("id") or not payload.get("name"):
        raise HTTPException(400, "缺少 id / name")
    return db.upsert_lc_custom_block(payload)


@app.delete("/api/leetcode/notes/block/{block_id}")
def lc_delete_custom_block(block_id: str):
    if not db.delete_lc_custom_block(block_id):
        raise HTTPException(404, "block 不存在")
    return {"ok": True}


@app.put("/api/leetcode/notes/solution-version")
def lc_put_solution_version(payload: dict):
    if not payload.get("id") or not payload.get("name"):
        raise HTTPException(400, "缺少 id / name")
    return db.upsert_lc_solution_version(payload)


@app.delete("/api/leetcode/notes/solution-version/{version_id}")
def lc_delete_solution_version(version_id: str):
    if not db.delete_lc_solution_version(version_id):
        raise HTTPException(404, "版本不存在")
    return {"ok": True}


@app.get("/api/leetcode/notes-scope/{scope_key:path}")
def lc_get_scope_note(scope_key: str):
    return db.get_lc_scope_note(scope_key)


@app.put("/api/leetcode/notes-scope/{scope_key:path}")
def lc_put_scope_note(scope_key: str, payload: dict):
    return db.set_lc_scope_note(scope_key, payload.get("html") or "")


@app.get("/api/leetcode/expressions")
def lc_expressions(scope: str):
    return db.get_lc_expressions(scope)


@app.post("/api/leetcode/expressions")
def lc_add_expression(payload: dict):
    if not payload.get("id") or not payload.get("scope") or not (payload.get("text") or "").strip():
        raise HTTPException(400, "缺少 id / scope / text")
    return db.add_lc_expression(payload)


@app.delete("/api/leetcode/expressions/{expr_id}")
def lc_delete_expression(expr_id: str):
    if not db.delete_lc_expression(expr_id):
        raise HTTPException(404, "条目不存在")
    return {"ok": True}


@app.get("/api/leetcode/stars")
def lc_get_stars():
    return db.get_lc_stars()


@app.put("/api/leetcode/stars/{name:path}")
def lc_add_star(name: str):
    db.set_lc_star(name, True)
    return {"ok": True}


@app.delete("/api/leetcode/stars/{name:path}")
def lc_remove_star(name: str):
    db.set_lc_star(name, False)
    return {"ok": True}


@app.get("/api/leetcode/struggles")
def lc_get_struggles():
    return db.get_lc_struggles()


@app.put("/api/leetcode/struggles/{name:path}")
def lc_add_struggle(name: str):
    db.set_lc_struggle(name, True)
    return {"ok": True}


@app.delete("/api/leetcode/struggles/{name:path}")
def lc_remove_struggle(name: str):
    db.set_lc_struggle(name, False)
    return {"ok": True}


@app.post("/api/leetcode/note-image")
def lc_upload_note_image(payload: dict):
    """截图粘贴：前端传 base64（dataURL 去头），存文件返回可引用的 URL。"""
    b64 = payload.get("data") or ""
    ext = {"image/png": "png", "image/jpeg": "jpg", "image/gif": "gif",
           "image/webp": "webp"}.get(payload.get("type") or "", "png")
    if not b64:
        raise HTTPException(400, "缺少 data")
    NOTE_IMG_DIR.mkdir(exist_ok=True)
    fn = uuid.uuid4().hex + "." + ext
    (NOTE_IMG_DIR / fn).write_bytes(base64.b64decode(b64))
    return {"url": "/api/leetcode/note-image/" + fn}


@app.get("/api/leetcode/note-image/{fn}")
def lc_note_image(fn: str):
    p = NOTE_IMG_DIR / Path(fn).name  # Path().name 防目录穿越
    if not p.exists():
        raise HTTPException(404, "图片不存在")
    return FileResponse(p)


@app.get("/leetcode-notes/{num}")
def lc_shell_page(num: str):
    """无动画题的空壳笔记页：套动画站模板，notes.js 认出自己在壳页后
    照常渲染 Notes 区（没有 Animation 区）。"""
    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LC {num} · Notes</title>
<link rel="stylesheet" href="/leetcode-all-in-one/shared.css">
<link rel="stylesheet" href="/leetcode-all-in-one/ink.css">
<link rel="stylesheet" href="/leetcode-all-in-one/notes.css">
</head><body class="lcn-shell" data-lc-num="{num}">
<div class="content-wrapper"></div>
<script src="/leetcode-all-in-one/catalog.js"></script>
<script src="/leetcode-all-in-one/sidebar.js"></script>
<script src="/leetcode-all-in-one/notes.js"></script>
</body></html>"""
    return HTMLResponse(html, headers={"Cache-Control": "no-store"})


# ---------- 本地答案浏览 ----------
# 静态挂载不列目录、.py 会被浏览器当下载，所以单独给一个清单页 + 纯文本页。

@app.get("/answers/", response_class=HTMLResponse)
@app.get("/lyon/", response_class=HTMLResponse)
def answers_index():
    rows = []
    for p in _answer_files():
        rows.append(f'<li><a href="/answers/file/{quote(p.name)}">{escape(p.name)}</a>'
                    f' <small>{escape(p.parent.name)}</small></li>')
    title = " / ".join(d.name for d in ANSWER_DIRS if d.is_dir()) or "answers"
    return HTMLResponse(
        "<!DOCTYPE html><meta charset='utf-8'><title>Answers</title>"
        "<style>body{font:14px/1.7 -apple-system,sans-serif;max-width:760px;margin:32px auto;padding:0 16px}"
        "li{list-style:none}a{text-decoration:none}small{color:#888;margin-left:8px}</style>"
        f"<h2>{escape(title)}（{len(rows)}）</h2><ul>{''.join(rows)}</ul>",
        headers={"Cache-Control": "no-store"})


def _plain(p: Path):
    return FileResponse(p, media_type="text/plain; charset=utf-8",
                        headers={"Cache-Control": "no-store"})


@app.get("/answers/file/{name}")
@app.get("/lyon/file/{name}")
def answers_file(name: str):
    for p in _answer_files():
        if p.name == name:
            return _plain(p)
    raise HTTPException(404, "没有这个答案文件")


@app.get("/answers/{num}")
@app.get("/lyon/{num}")
def answers_by_num(num: str):
    p = _answer_index().get(num) or _answer_index_by_slug().get(num)
    if p is None:
        raise HTTPException(404, f"答案目录里没有 {num} 的答案文件")
    return _plain(p)


# ---------- 静态资源（放在所有 API 路由之后） ----------

# 页面里大量资源路径是从站点根开始写的（例如 /leetcode-all-in-one/...）。
# 明确挂顶层目录，比 app.mount("/") 在当前 Starlette 版本下更稳。
app.mount("/leetcode-all-in-one", NoCacheStaticFiles(directory=CONTENT / "leetcode-all-in-one", html=True), name="leetcode-all-in-one")
if (CONTENT / "4-leetcode-fill-in").is_dir():
    app.mount("/4-leetcode-fill-in", NoCacheStaticFiles(directory=CONTENT / "4-leetcode-fill-in", html=True), name="leetcode-fill-in")
if (CONTENT / "3-leetcode-lecture-notes").is_dir():
    app.mount("/3-leetcode-lecture-notes", NoCacheStaticFiles(directory=CONTENT / "3-leetcode-lecture-notes", html=True), name="leetcode-lecture-notes")
if (CONTENT / "0-oa-real-problems").is_dir():
    app.mount("/0-oa-real-problems", NoCacheStaticFiles(directory=CONTENT / "0-oa-real-problems", html=True), name="leetcode-oa-real-problems")
