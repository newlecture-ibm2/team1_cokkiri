#!/bin/bash

# Git Hooks 경로를 .githooks로 설정
git config core.hooksPath .githooks

# Hook 스크립트에 실행 권한 부여
chmod +x .githooks/prepare-commit-msg

echo "✅ Git Hooks 설정이 완료되었습니다."
echo "   커밋 시 'feat: [USR] 메시지' → '✨ [USR] 메시지' 로 자동 변환됩니다."
