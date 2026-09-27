"""SQLite 存储层。

2026-08-10 从 shuyangzhang-life-summary 拆出来的独立后端：只留 LeetCode
动画站（notes.js / checkin.html / class.html）用到的表。lc_class_notes
（Life OS 的 "LeetCode · Class" 上课笔记页专用）不在这里——那个页面暂时
还留在 Life OS，见那边的 CLAUDE.md。
"""

import sqlite3
import uuid
from pathlib import Path

DB_PATH = Path(__file__).parent / "leetcode.db"

SCHEMA = """
-- LeetCode Check-in（从 leetcode-all-in-one/checkin.html 移植）：
-- 只存打卡历史本身（一次打卡一行）；SM-2 的 ef/interval/nextReview 由前端
-- 按历史整体重放（replay）推导，不落库。
-- code：这一次打卡时自己写出的 solution（HTML，可带 <font> 颜色标注）。
CREATE TABLE IF NOT EXISTS lc_checkins (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT NOT NULL,
    ts     TEXT NOT NULL,
    score  INTEGER NOT NULL,
    mode   TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    note   TEXT NOT NULL DEFAULT '',
    code   TEXT NOT NULL DEFAULT ''
);

-- 每节课的录屏回看链接（class.html 用）：日期一条，链接和密码都清空就删行。
-- password 是 2026-08-11 加的列，见下面 init() 里的 ALTER TABLE 迁移
-- （老库建表时没有这一列，CREATE TABLE IF NOT EXISTS 对已存在的表不会补列）。
CREATE TABLE IF NOT EXISTS lc_class_links (
    date            TEXT PRIMARY KEY,
    recording_link  TEXT NOT NULL DEFAULT '',
    password        TEXT NOT NULL DEFAULT '',
    updated_at      TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- LC Notes（长在动画站里的笔记系统）：全部按"题目 label"（同 lc_checkins.name）
-- 或 scope key 挂靠。内容是受信 HTML（单人本地应用，前端 contenteditable 直出）。
-- lc_note_cards：行链笔记卡。line 可空（整体笔记）；position 越小越靠上（新建=0，其余+1）。
-- category：这条笔记是讲语法还是讲逻辑，''/'syntax'/'logic'，不强制选。
-- title：卡片自己的标题，跟 html 正文分开存，不选就是空字符串（2026-08-14 加）。
CREATE TABLE IF NOT EXISTS lc_note_cards (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    line       INTEGER,
    note_date  TEXT NOT NULL DEFAULT '',
    html       TEXT NOT NULL DEFAULT '',
    position   INTEGER NOT NULL DEFAULT 0,
    category   TEXT NOT NULL DEFAULT '',
    title      TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_custom_blocks：自命名 block（标题自己起）。2026-08-21 起分类页
-- （section-notes.html）用，name = 'sec:<章标题>|<分类标题>'。
CREATE TABLE IF NOT EXISTS lc_custom_blocks (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    title      TEXT NOT NULL DEFAULT '',
    html       TEXT NOT NULL DEFAULT '',
    position   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_scope_notes：单条大笔记（all 级 Overview / 章级 Methodology / 分类级），
-- scope_key 形如 'all' | 'ch:<章标题>' | 'cat:<章标题>|<分类标题>'，一键 upsert。
CREATE TABLE IF NOT EXISTS lc_scope_notes (
    scope_key  TEXT PRIMARY KEY,
    html       TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_expressions：表达库（章级 Mock Expressions / all 级 Expression Bank）。
CREATE TABLE IF NOT EXISTS lc_expressions (
    id         TEXT PRIMARY KEY,
    scope      TEXT NOT NULL,
    text       TEXT NOT NULL DEFAULT '',
    source     TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_solutions：旧版"一题一份"用户副本，已被 lc_solution_versions 取代。
-- 表和历史数据原样留着（一次性迁移的读取源 + 保险），代码里不再读写它。
CREATE TABLE IF NOT EXISTS lc_solutions (
    name       TEXT PRIMARY KEY,
    code       TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_solution_versions：solution 多版本 tab（标准答案不入库，现读 standard-answers /
-- user-answers；
-- 这里存的都是用户自己开的副本）。一题可以有多份，position 定 tab 顺序（新建
-- 追加到最后 = MAX+1，跟 lc_custom_blocks 一个路数）。
CREATE TABLE IF NOT EXISTS lc_solution_versions (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    title      TEXT NOT NULL DEFAULT 'My copy',
    code       TEXT NOT NULL DEFAULT '',
    position   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_starred：重点题标记（题目页标题旁点 ★，侧栏跟着亮）。有行 = 星标，
-- 键 = 题目 label（同 lc_checkins.name）。
CREATE TABLE IF NOT EXISTS lc_starred (
    name       TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- lc_struggled：难题标记（2026-08-27，题目页标题旁点 ⚑，"这一轮学习卡住的题"）。
-- 结构同 lc_starred，键 = 题目 label。
CREATE TABLE IF NOT EXISTS lc_struggled (
    name       TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
"""


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _migrate_lc_solutions_to_versions(conn):
    """一次性把旧 lc_solutions（一题一份）灌进 lc_solution_versions 当作
    "My copy" 的第一个 tab；已经迁过的题（lc_solution_versions 里已有行）跳过，
    每次启动重跑也不会重复插入。"""
    rows = conn.execute("SELECT name, code, updated_at FROM lc_solutions WHERE code != ''").fetchall()
    for row in rows:
        exists = conn.execute(
            "SELECT 1 FROM lc_solution_versions WHERE name = ?", (row["name"],)).fetchone()
        if exists:
            continue
        conn.execute(
            "INSERT INTO lc_solution_versions (id, name, title, code, position, updated_at)"
            " VALUES (?, ?, 'My copy', ?, 0, ?)",
            (str(uuid.uuid4()), row["name"], row["code"], row["updated_at"]))


def _migrate_lc_class_links_add_password(conn):
    """老库的 lc_class_links 建表时没有 password 列——CREATE TABLE IF NOT EXISTS
    对已存在的表是空操作，得单独 ALTER TABLE 补列。已经补过的库再跑会报
    "duplicate column"，吞掉就行，天然幂等。"""
    try:
        conn.execute("ALTER TABLE lc_class_links ADD COLUMN password TEXT NOT NULL DEFAULT ''")
    except sqlite3.OperationalError:
        pass


def _migrate_lc_note_cards_add_category(conn):
    """同上：老库的 lc_note_cards 建表时没有 category 列（Syntax/Logic 标签，
    2026-08-12 加）。"""
    try:
        conn.execute("ALTER TABLE lc_note_cards ADD COLUMN category TEXT NOT NULL DEFAULT ''")
    except sqlite3.OperationalError:
        pass


def _migrate_lc_note_cards_add_title(conn):
    """同上：老库的 lc_note_cards 建表时没有 title 列（卡片标题，2026-08-14 加）。"""
    try:
        conn.execute("ALTER TABLE lc_note_cards ADD COLUMN title TEXT NOT NULL DEFAULT ''")
    except sqlite3.OperationalError:
        pass


def init():
    conn = connect()
    try:
        conn.executescript(SCHEMA)
        _migrate_lc_solutions_to_versions(conn)
        _migrate_lc_class_links_add_password(conn)
        _migrate_lc_note_cards_add_category(conn)
        _migrate_lc_note_cards_add_title(conn)
        conn.commit()
    finally:
        conn.close()


# ---------- LeetCode Check-in ----------

def get_lc_checkins():
    conn = connect()
    try:
        rows = conn.execute(
            "SELECT id, name, ts, score, mode, source, note, code FROM lc_checkins ORDER BY ts, id"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def add_lc_checkins(names, ts, score, mode, source, note, code=""):
    score = float(score)
    if score.is_integer():
        score = int(score)
    conn = connect()
    try:
        conn.executemany(
            "INSERT INTO lc_checkins (name, ts, score, mode, source, note, code) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [(n, ts, score, mode or "", source or "", note or "", code or "") for n in names],
        )
        conn.commit()
        return {"ok": True, "count": len(names)}
    finally:
        conn.close()


def update_lc_checkin(cid, ts, score, mode, note, code, source):
    score = float(score)
    if score.is_integer():
        score = int(score)
    conn = connect()
    try:
        cur = conn.execute(
            "UPDATE lc_checkins SET ts = ?, score = ?, mode = ?, note = ?, code = ?, source = ? WHERE id = ?",
            (ts, score, mode or "", note or "", code or "", source or "", cid),
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def delete_lc_item(name):
    """删掉一个条目 = 删掉它的全部打卡历史。"""
    conn = connect()
    try:
        cur = conn.execute("DELETE FROM lc_checkins WHERE name = ?", (name,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


# ---------- 录屏回看链接（class.html） ----------

def get_lc_class_links():
    conn = connect()
    try:
        rows = conn.execute(
            "SELECT date, recording_link, password, updated_at FROM lc_class_links ORDER BY date"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def set_lc_class_link(day, recording_link, password):
    conn = connect()
    try:
        recording_link = (recording_link or "").strip()
        password = (password or "").strip()
        if recording_link or password:
            conn.execute(
                "INSERT INTO lc_class_links (date, recording_link, password, updated_at)"
                " VALUES (?, ?, ?, datetime('now','localtime'))"
                " ON CONFLICT(date) DO UPDATE SET recording_link = excluded.recording_link,"
                " password = excluded.password, updated_at = excluded.updated_at",
                (day, recording_link, password),
            )
            conn.commit()
            row = conn.execute(
                "SELECT date, recording_link, password, updated_at FROM lc_class_links WHERE date = ?", (day,)
            ).fetchone()
            return dict(row)
        else:
            conn.execute("DELETE FROM lc_class_links WHERE date = ?", (day,))
            conn.commit()
            return {"date": day, "recording_link": "", "password": "", "updated_at": ""}
    finally:
        conn.close()


# ---------- LC Notes（动画站笔记系统） ----------

def get_lc_question_notes(name):
    conn = connect()
    try:
        cards = [dict(r) for r in conn.execute(
            "SELECT id, name, line, note_date, html, position, category, title, updated_at FROM lc_note_cards"
            " WHERE name = ? ORDER BY position, updated_at DESC", (name,))]
        blocks = [dict(r) for r in conn.execute(
            "SELECT id, name, title, html, position, updated_at FROM lc_custom_blocks"
            " WHERE name = ? ORDER BY position, updated_at", (name,))]
        versions = [dict(r) for r in conn.execute(
            "SELECT id, name, title, code, position, updated_at FROM lc_solution_versions"
            " WHERE name = ? ORDER BY position, updated_at", (name,))]
        return {"cards": cards, "blocks": blocks, "versions": versions}
    finally:
        conn.close()


def upsert_lc_note_card(payload):
    conn = connect()
    try:
        row = conn.execute("SELECT id FROM lc_note_cards WHERE id = ?", (payload["id"],)).fetchone()
        if row is None:
            mn = conn.execute(
                "SELECT COALESCE(MIN(position), 0) FROM lc_note_cards WHERE name = ?",
                (payload["name"],)).fetchone()[0]
            conn.execute(
                "INSERT INTO lc_note_cards (id, name, line, note_date, html, position, category, title)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (payload["id"], payload["name"], payload.get("line"), payload.get("note_date") or "",
                 payload.get("html") or "", mn - 1, payload.get("category") or "", payload.get("title") or ""))
        else:
            conn.execute(
                "UPDATE lc_note_cards SET line = ?, note_date = ?, html = ?, category = ?, title = ?,"
                " updated_at = datetime('now','localtime') WHERE id = ?",
                (payload.get("line"), payload.get("note_date") or "", payload.get("html") or "",
                 payload.get("category") or "", payload.get("title") or "", payload["id"]))
        conn.commit()
        return dict(conn.execute(
            "SELECT id, name, line, note_date, html, position, category, title, updated_at FROM lc_note_cards WHERE id = ?",
            (payload["id"],)).fetchone())
    finally:
        conn.close()


def delete_lc_note_card(card_id):
    conn = connect()
    try:
        cur = conn.execute("DELETE FROM lc_note_cards WHERE id = ?", (card_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def upsert_lc_custom_block(payload):
    conn = connect()
    try:
        row = conn.execute("SELECT id FROM lc_custom_blocks WHERE id = ?", (payload["id"],)).fetchone()
        if row is None:
            mx = conn.execute(
                "SELECT COALESCE(MAX(position), 0) FROM lc_custom_blocks WHERE name = ?",
                (payload["name"],)).fetchone()[0]
            conn.execute(
                "INSERT INTO lc_custom_blocks (id, name, title, html, position) VALUES (?, ?, ?, ?, ?)",
                (payload["id"], payload["name"], payload.get("title") or "", payload.get("html") or "", mx + 1))
        else:
            conn.execute(
                "UPDATE lc_custom_blocks SET title = ?, html = ?, updated_at = datetime('now','localtime')"
                " WHERE id = ?",
                (payload.get("title") or "", payload.get("html") or "", payload["id"]))
        conn.commit()
        return dict(conn.execute(
            "SELECT id, name, title, html, position, updated_at FROM lc_custom_blocks WHERE id = ?",
            (payload["id"],)).fetchone())
    finally:
        conn.close()


def delete_lc_custom_block(block_id):
    conn = connect()
    try:
        cur = conn.execute("DELETE FROM lc_custom_blocks WHERE id = ?", (block_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def get_lc_scope_note(scope_key):
    conn = connect()
    try:
        row = conn.execute(
            "SELECT scope_key, html, updated_at FROM lc_scope_notes WHERE scope_key = ?",
            (scope_key,)).fetchone()
        return dict(row) if row else {"scope_key": scope_key, "html": "", "updated_at": ""}
    finally:
        conn.close()


def set_lc_scope_note(scope_key, html):
    conn = connect()
    try:
        if (html or "").strip():
            conn.execute(
                "INSERT INTO lc_scope_notes (scope_key, html, updated_at)"
                " VALUES (?, ?, datetime('now','localtime'))"
                " ON CONFLICT(scope_key) DO UPDATE SET html = excluded.html,"
                " updated_at = excluded.updated_at", (scope_key, html))
        else:
            conn.execute("DELETE FROM lc_scope_notes WHERE scope_key = ?", (scope_key,))
        conn.commit()
        return get_lc_scope_note(scope_key)
    finally:
        conn.close()


def get_lc_stars():
    conn = connect()
    try:
        return [r["name"] for r in conn.execute("SELECT name FROM lc_starred ORDER BY name")]
    finally:
        conn.close()


def set_lc_star(name, starred):
    conn = connect()
    try:
        if starred:
            conn.execute("INSERT OR IGNORE INTO lc_starred (name) VALUES (?)", (name,))
        else:
            conn.execute("DELETE FROM lc_starred WHERE name = ?", (name,))
        conn.commit()
    finally:
        conn.close()


def get_lc_struggles():
    conn = connect()
    try:
        return [r["name"] for r in conn.execute("SELECT name FROM lc_struggled ORDER BY name")]
    finally:
        conn.close()


def set_lc_struggle(name, on):
    conn = connect()
    try:
        if on:
            conn.execute("INSERT OR IGNORE INTO lc_struggled (name) VALUES (?)", (name,))
        else:
            conn.execute("DELETE FROM lc_struggled WHERE name = ?", (name,))
        conn.commit()
    finally:
        conn.close()


def get_lc_expressions(scope):
    conn = connect()
    try:
        return [dict(r) for r in conn.execute(
            "SELECT id, scope, text, source, created_at FROM lc_expressions"
            " WHERE scope = ? ORDER BY created_at DESC", (scope,))]
    finally:
        conn.close()


def add_lc_expression(payload):
    conn = connect()
    try:
        conn.execute(
            "INSERT OR IGNORE INTO lc_expressions (id, scope, text, source) VALUES (?, ?, ?, ?)",
            (payload["id"], payload["scope"], payload.get("text") or "", payload.get("source") or ""))
        conn.commit()
        return dict(conn.execute(
            "SELECT id, scope, text, source, created_at FROM lc_expressions WHERE id = ?",
            (payload["id"],)).fetchone())
    finally:
        conn.close()


def delete_lc_expression(expr_id):
    conn = connect()
    try:
        cur = conn.execute("DELETE FROM lc_expressions WHERE id = ?", (expr_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def upsert_lc_solution_version(payload):
    conn = connect()
    try:
        row = conn.execute("SELECT id FROM lc_solution_versions WHERE id = ?", (payload["id"],)).fetchone()
        if row is None:
            mx = conn.execute(
                "SELECT COALESCE(MAX(position), -1) FROM lc_solution_versions WHERE name = ?",
                (payload["name"],)).fetchone()[0]
            conn.execute(
                "INSERT INTO lc_solution_versions (id, name, title, code, position) VALUES (?, ?, ?, ?, ?)",
                (payload["id"], payload["name"], payload.get("title") or "My copy",
                 payload.get("code") or "", mx + 1))
        else:
            conn.execute(
                "UPDATE lc_solution_versions SET title = ?, code = ?, updated_at = datetime('now','localtime')"
                " WHERE id = ?",
                (payload.get("title") or "My copy", payload.get("code") or "", payload["id"]))
        conn.commit()
        return dict(conn.execute(
            "SELECT id, name, title, code, position, updated_at FROM lc_solution_versions WHERE id = ?",
            (payload["id"],)).fetchone())
    finally:
        conn.close()


def delete_lc_solution_version(version_id):
    conn = connect()
    try:
        cur = conn.execute("DELETE FROM lc_solution_versions WHERE id = ?", (version_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()
