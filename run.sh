#!/bin/bash
# 启动 LeetCode 项目后端，打开 http://127.0.0.1:8789
#
# venv 放在 ~/.venvs 而不是项目目录里，理由跟 shuyangzhang-life-summary 一样：
# 这个项目在 ~/Desktop 下面可能被 OneDrive 同步，venv 是编译好的、跟这台机器
# 绑死的 Python 环境，同步过去到另一台电脑也用不了。换一台新电脑先跑一次：
#   python3 -m venv ~/.venvs/leetcode-app
#   ~/.venvs/leetcode-app/bin/pip install -r requirements.txt
VENV="$HOME/.venvs/leetcode-app"
cd "$(dirname "$0")"
exec "$VENV/bin/uvicorn" main:app --app-dir backend --host 127.0.0.1 --port 8789 --reload
