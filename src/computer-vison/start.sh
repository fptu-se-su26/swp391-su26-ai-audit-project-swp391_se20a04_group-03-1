#!/bin/bash
# Chạy CV service bằng tay (Linux/Pi 5). Muốn tự chạy lúc boot: xem cv-ai.service.
#
# Bản cũ gọi venv/Scripts/python — đường dẫn của WINDOWS, trên Pi không tồn tại.
# Linux là venv/bin/python.
unset PYTHONPATH
unset PIP_TARGET

cd "$(dirname "$0")" || exit 1

if [ -x "venv/bin/python" ]; then
    PY="venv/bin/python"
elif [ -x "$HOME/venv-cv/bin/python" ]; then
    PY="$HOME/venv-cv/bin/python"
else
    PY="python3"
    echo "[start.sh] Không thấy venv, dùng $PY của hệ thống."
fi

exec "$PY" src/app.py
