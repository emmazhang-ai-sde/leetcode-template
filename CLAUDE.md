# CLAUDE.md

给 Claude Code 用的项目说明。

## 项目概况

刷题相关的一切：题目动画、题解答案、lecture notes、fill-in 练习、
standard-answers 标准答案，加一套长在动画站里的 LC Notes 笔记系统（打卡 + 笔记 +
星标 + 表达库）。2026-08-10 从 `shuyangzhang-life-summary`（Life OS）拆出来，
独立仓库、独立后端、独立数据库。

## 常用命令

```bash
# 首次
python3 -m venv ~/.venvs/leetcode-app
~/.venvs/leetcode-app/bin/pip install -r requirements.txt

./run.sh   # 启动，打开 http://127.0.0.1:8789
```

没有测试/lint/构建步骤，验证方式是启动后在浏览器里实际点。

## 架构

单进程 FastAPI：`backend/main.py` 挂 `/api/leetcode/*` 若干接口 + 把
`leetcode/` 整个目录原样发布在根路径下（`backend/main.py` 的
`app.mount("/", ...)`）。数据存 `backend/leetcode.db`（gitignored），
截图存 `backend/note_images/`（gitignored）。

`leetcode/` 内部结构、共享 CSS 分层、notes.js 四种页面形态等，见
`leetcode/leetcode-all-in-one/ARCHITECTURE.md`——改动画站/笔记系统之前先读。
做新动画页必读 `ANIMATION_GUIDE.md`（硬性规则：紫色行高亮必须逐行走不许跳）。

题目答案的权威是 `leetcode/standard-answers/`（标准答案，保持原样不改动）；
本地私人补充答案可放 `leetcode/user-answers/`（平铺，按题号或题名 slug
命名），但这个目录不属于 template 结构。后端按题号/slug 现扫答案目录
（标准答案优先），不再单独复制一份。`standard-answers` 目录名写死在
`backend/main.py` 顶部的 `STANDARD_ANSWERS_DIR`，改名目录必须同步改常量。
`leetcode/leetcode-all-in-one/catalog.js` 是题目目录的唯一权威（加题/上架
动画都只改它）。`2-leetcode-speak`、`3-leetcode-lecture-notes`、
`4-leetcode-fill-in`、`0-oa-real-problems` 属于本地私人资料，导出的
template 不包含它们。

## 跟 Life OS 的关系

从 `shuyangzhang-life-summary` 拆出来时，Life OS 留了一个独立的
"LeetCode · Class" 上课笔记页（打卡表单 + Notes/Follow-up + 讲题顺序），
没有搬过来，继续用它自己的 `life.db`。这边的 `lc_checkins` /
`lc_class_links` 是 2026-08-10 从那边迁移过来的一份快照，之后两边的打卡
历史各自独立累计，不互相同步。

Life OS 那个页面会跨源 fetch 这边的 `catalog.js`（题目补全用），所以
`backend/main.py` 开了一条只放行 `http://127.0.0.1:8787`、只放行 GET 的
CORS 规则——别把这条规则放宽到覆盖写接口。
