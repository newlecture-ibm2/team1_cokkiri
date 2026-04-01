# 🐘 팀 코끼리 Git & Jira Convention

---

## 📌 목차

1. [Github Flow](#1-github-flow)
2. [Git Convention](#2-git-convention)
3. [Code Convention](#3-code-convention)
4. [MR Convention](#4-mr-convention)
5. [Merge 전략](#5-merge-전략)
6. [자주 쓰는 Git 명령어](#6-자주-쓰는-git-명령어)
7. [Jira 컨벤션](#7-jira-컨벤션)
8. [응답 템플릿](#8-응답-템플릿)

---

## 1. Github Flow

### 브랜치 구조

```
main
 └── develop
      ├── be/develop
      │    └── feat/이슈번호
      └── fe/develop
           └── feat/이슈번호
```

### 규칙

- **main** 브랜치에는 프로젝트 마지막에 merge (배포할 때)
- **develop** 브랜치에 개발한 feature 브랜치를 merge
  - `be/develop` — 백엔드 개발 브랜치
  - `fe/develop` — 프론트엔드 개발 브랜치
- **feature** 브랜치는 각각 **기능 하나씩** 개발
  - 기능별로 분리할 것
  - 브랜치명은 **이슈 번호**로 작성: `feat/이슈번호`

---

## 2. Git Convention

### 커밋 타입

| 타입       | 설명                              |
| ---------- | --------------------------------- |
| `fix`      | 버그, 오류 해결                   |
| `feat`     | 새로운 기능 구현                  |
| `refactor` | 코드 개선하는 리팩토링            |
| `env`      | 기타 환경 설정                    |
| `test`     | 테스트 코드 추가                  |
| `chore`    | 그 외의 일                        |
| `docs`     | README나 WIKI 등 내용 추가 및 변경 |
| `style`    | 레이아웃 등 스타일                |
| `merge`    | 브랜치 병합                       |

### Gitmoji 가이드

| 아이콘 | 코드                           | 설명                        | 원문                                          |
| ------ | ------------------------------ | --------------------------- | --------------------------------------------- |
| 🎉     | `:tada:`                       | 프로젝트 시작               | Begin a project.                              |
| ✨     | `:sparkles:`                   | 새 기능                     | Introduce new features.                       |
| 🎨     | `:art:`                        | 코드의 구조/형태 개선       | Improve structure / format of the code.       |
| 🐛     | `:bug:`                        | 버그 수정                   | Fix a bug.                                    |
| ⚡️    | `:zap:`                        | 성능 개선                   | Improve performance.                          |
| 🚧     | `:construction:`               | 진행 중인 코드              | WIP (Work in progress)                        |
| 💄     | `:lipstick:`                   | UI / style 파일 추가 및 수정 | Add or update the UI and style files.         |
| 📝     | `:memo:`                       | 문서 추가 / 수정            | Add or update documentation.                  |
| 🔥     | `:fire:`                       | 코드/파일 삭제              | Remove code or files.                         |
| 💚     | `:green_heart:`                | CI 빌드 수정                | Fix CI Build.                                 |
| 👷     | `:construction_worker:`        | CI 빌드 시스템 추가 / 수정  | Add or update CI build system.                |
| ♻️     | `:recycle:`                    | 코드 리팩토링               | Refactor code.                                |
| 🔧     | `:wrench:`                     | 구성 파일 추가 / 삭제       | Add or update configuration files.            |
| 💡     | `:bulb:`                       | 주석 추가 / 수정            | Add or update comments in source code.        |
| ✅     | `:white_check_mark:`           | 테스트 추가 / 수정          | Add or update tests.                          |
| 🔀     | `:twisted_rightwards_arrows:`  | 브랜치 병합                 | Merge branches.                               |

### 커밋 메시지 형식

```
:이모지: [BE] 커밋메세지
:이모지: [FE] 커밋메세지
```

**예시:**

```
:sparkles: [BE] 로그인 API 구현
:bug: [FE] 메뉴 리스트 렌더링 오류 수정
:memo: [BE] README 작성
```

### 브랜치 생성 규칙

```
feat/이슈번호
```

**예시:** `feat/S01P01A101-42`

---

## 3. Code Convention

### Java / Spring (Backend)

- **Google Java Formatter** 적용
  - 참고: <https://sas-study.tistory.com/445>
- IntelliJ 설정:
  - `Settings` → `Tools` → `Actions on Save`
  - ✅ **Reformat code**
  - ✅ **Optimize imports**

### React (Frontend)

- **ESLint + Prettier** (Airbnb Style Guide) 적용
  - 스타일 가이드: <https://github.com/airbnb/javascript>
  - 설치 방법: <https://techwell.wooritech.com/docs/tools/prettier/prettier-eslint-airbnb/>

---

## 4. MR Convention

### MR 타이틀 작성법

```
[역할/타입] 기능 설명
```

**예시:**

```
[BE/feat] OAuth 기능 구현
[FE/fix] 로그인 페이지 버그 수정
[BE/refactor] 인증 로직 리팩토링
```

> **참고:** 제목에 지라 이슈 번호는 작성하지 않으며, 마일스톤은 제외합니다.

---

## 5. Merge 전략

| 방향                    | 전략                  |
| ----------------------- | --------------------- |
| **feature → develop**   | Squash and Merge      |
| **develop → main**      | Rebase and Merge      |

---

## 6. 자주 쓰는 Git 명령어

| 명령어                                   | 설명                                                |
| ---------------------------------------- | --------------------------------------------------- |
| `git status`                             | 현재 변경사항 보기                                  |
| `git commit -m "commit_message"`         | 커밋                                                |
| `git checkout -b "branch_name"`          | 새로운 브랜치 생성 후 이동                          |
| `git checkout "branch_name"`             | 이미 생성된 브랜치로 이동                           |
| `git log`                                | 커밋 로그 확인                                      |
| `git revert "commit_name"`              | 해당 커밋으로 롤백 (되돌리는 새로운 커밋 생성)      |

---

## 7. Jira 컨벤션

### 에픽 (Epic)

- **BE**: `[BE] 큰 기능 이름` → 예) `[BE] 회원가입`
- **FE**: `[FE] 페이지 이름` → 예) `[FE] 로그인 페이지`

### 이슈 (Issue)

| 항목         | 규칙                                                                 |
| ------------ | -------------------------------------------------------------------- |
| **이슈 유형** | `스토리`                                                             |
| **상태**     | 시작 시 `ToDo` → 진행 시 `In Progress` → 완료 시 `Done`             |
| **컴포넌트** | `BE`, `FE`, `통합` 중 선택                                          |
| **Epic Link** | 해당 에픽 선택                                                      |
| **Sprint**   | 해당 주차 스프린트 선택                                              |

### 이슈 요약 작성법

```
[역할] 세부 기능 이름
```

**예시:**

- BE: `[BE] 도서 검색`
- FE (컴포넌트 또는 기능 단위): `[FE] 로그인 버튼`
- 데일리 스크럼: `데일리 스크럼(월)`
- 회고: `회고(금)`

### 컴포넌트 분류

**분류 1 (역할)**

- BE
- FE

**분류 2 (유형)**

- 회의 (데일리 스크럼 포함) — 단체
- 학습
- 개발
- 설계 — 개인
- 문서작성

> 컴포넌트는 **분류 1**과 **분류 2**에서 **하나씩** 선택하여 넣어주세요.

---

## 8. 응답 템플릿

### 성공 응답

```json
{
  "success": true,
  "message": "로그인 성공!",
  "data": {
    "id": 1,
    "userId": "qwer1234",
    "email": "user@example.com",
    "name": "이름"
  }
}
```

```json
{
  "success": true,
  "message": "권한 변경 성공!",
  "data": null
}
```

### 실패 응답

```json
{
  "success": false,
  "message": "원인 설명 (클라이언트 개발자가 알아볼 수 있게)",
  "errorCode": "E01"
}
```

### 에러 코드 정의

| 에러 코드 | HTTP Status             | 설명                       |
| --------- | ----------------------- | -------------------------- |
| `E00`     | `400 Bad Request`       | 입력값이 잘못됨            |
| `E01`     | `403 Forbidden`         | 권한 없음 (인가 실패)      |
| `E02`     | `401 Unauthorized`      | 로그인 안 됨 (인증 실패)   |
| `E03`     | `404 Not Found`         | 없는 유저로 로그인 시도    |
| `E04`     | `409 Conflict`          | 패스워드 불일치            |
