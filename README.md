# LeetCode

刷题动画站 + 题解 + 讲义 + LC Notes 笔记系统（打卡 / 笔记 / 星标 / 表达库）。

2026-08-10 从 `shuyangzhang-life-summary`（Life OS）拆出来的独立项目——不再
需要 Life OS 跑着才能用。

## 运行

```bash
python3 -m venv ~/.venvs/leetcode-app
~/.venvs/leetcode-app/bin/pip install -r requirements.txt
./run.sh
```

打开 <http://127.0.0.1:8789>。

## 目录

```
leetcode/
├── 0-Lyon-Python/              Lyon 老师原始答案（答案权威，原样不改）
└── leetcode-all-in-one/        动画 + LC Notes 笔记 + 打卡 + 上课记录
backend/
├── main.py                     API + 静态资源挂载
├── db.py                       SQLite 存储层
├── leetcode.db                 数据（gitignored）
└── note_images/                笔记截图（gitignored）
```

本地私人资料目录不属于 template 结构，例如 `0-my-answers/`、`2-leetcode-speak/`、
`3-leetcode-lecture-notes/`、`4-leetcode-fill-in/`、`0-oa-real-problems/`。
有这些目录时项目会使用它们；导出的 template 不包含它们。

结构细节、共享 CSS 分层、`notes.js` 的四种页面形态见
`leetcode/leetcode-all-in-one/ARCHITECTURE.md`。

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET / POST | `/api/leetcode/checkins` | 打卡记录：全量读取 / 新增（一次可多题） |
| PUT | `/api/leetcode/checkins/{cid}` | 改一条打卡记录 |
| DELETE | `/api/leetcode/items/{name}` | 删一道题连同它全部打卡历史 |
| GET / PUT | `/api/leetcode/class-links`、`/class-links/{day}` | 每节课的录屏回看链接 |
| GET | `/api/leetcode/notes/{name}` | 一道题的笔记卡 + 自定义 block + solution 副本 + Lyon 原版代码 |
| PUT / DELETE | `/api/leetcode/notes/card` `/card/{id}` | 行链笔记卡 upsert / 删除 |
| PUT / DELETE | `/api/leetcode/notes/block` `/block/{id}` | 自命名 block upsert / 删除 |
| GET / PUT | `/api/leetcode/notes-scope/{scope_key}` | 单条大笔记：`all` / `ch:<章>` / `cat:<章>\|<分类>` |
| GET / POST / DELETE | `/api/leetcode/expressions` | 表达库 |
| PUT | `/api/leetcode/solution/{name}` | 用户自改 solution 副本；code 传空 = 还原 Lyon |
| GET / PUT / DELETE | `/api/leetcode/stars` `/stars/{name}` | 重点题星标 |
| GET / PUT / DELETE | `/api/leetcode/struggles` `/struggles/{name}` | 难题旗（本轮卡住的题） |
| POST / GET | `/api/leetcode/note-image` `/note-image/{fn}` | 截图上传（base64）/ 读取 |
| GET | `/leetcode-notes/{num}` | 无动画题的空壳笔记页 |

## 跟 Life OS 的关系

Life OS（`~/Desktop/shuyangzhang-life-summary`）留了一个独立的
"LeetCode · Class" 上课笔记页，没有搬过来，继续用它自己的数据库。这边的
`lc_checkins` / `lc_class_links` 是拆分当天从那边迁移过来的一份快照，之后
两边的打卡历史各自累计，不互相同步。
