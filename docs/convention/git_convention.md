# 🐘 팀 코끼리 Git & Jira Convention

---

## 📌 목차

1. [Github Flow](#1-github-flow)
2. [도메인 태그](#2-도메인-태그)
3. [Git Convention](#3-git-convention)
4. [Code Convention](#4-code-convention)
5. [MR Convention](#5-mr-convention)
6. [Merge 전략](#6-merge-전략)
7. [자주 쓰는 Git 명령어](#7-자주-쓰는-git-명령어)
8. [Jira 컨벤션](#8-jira-컨벤션)
9. [응답 템플릿](#9-응답-템플릿)

---

## 1. Github Flow

### 브랜치 구조

```
main
 └── develop
      └── feat/이슈번호
```

### 규칙

- **main** 브랜치에는 프로젝트 마지막에 merge (배포할 때)
- **develop** 브랜치에 개발한 feature 브랜치를 merge
- **feature** 브랜치는 각각 **기능 하나씩** 개발
  - 기능별로 분리할 것
  - 브랜치명은 **이슈 번호**로 작성: `feat/이슈번호`

---

## 2. 도메인 태그

커밋 메시지, MR 타이틀 등에서 작업 도메인을 명시하기 위해 아래 태그를 사용합니다.

| 태그  | 도메인                  | 설명                              |
| ----- | ----------------------- | --------------------------------- |
| `USR` | 인증 / 사용자 (User/Auth) | 로그인, 회원가입, 권한 관리 등     |
| `SPC` | 공간 / 관리자 (Space)    | 공간 등록, 관리자 기능 등          |
| `CTR` | 계약 / 정산 (Contract)   | 계약 관리, 정산 처리 등            |
| `RSV` | 예약 / 시설 (Reservation)| 예약 생성, 시설 관리 등            |
| `IOT` | IoT / 모니터링 (Device)  | 기기 연동, 모니터링 등             |
| `CS`  | 커뮤니티 / CS            | 문의, 공지, 커뮤니티 기능 등       |
| `CMN` | 공통 (Common)            | 공통 유틸, 인프라, CI/CD 등        |

> 도메인 경계가 애매한 작업은 **주된 변경이 일어나는 도메인** 기준으로 태그를 선택합니다.

---

## 3. Git Convention

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
:이모지: [도메인] 커밋메세지
```

**예시:**

```
:sparkles: [USR] 소셜 로그인 API 구현
:bug: [RSV] 예약 목록 렌더링 오류 수정
:wrench: [CMN] CI/CD 파이프라인 설정
:memo: [CMN] README 작성
```

### 브랜치 생성 규칙

```
feat/이슈번호
```

**예시:** `feat/S01P01A101-42`

---

## 4. Code Convention

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

## 5. MR Convention

### MR 타이틀 작성법

```
[도메인/타입] 기능 설명
```

**예시:**

```
[USR/feat] OAuth 기능 구현
[RSV/fix] 예약 페이지 버그 수정
[CMN/refactor] 공통 유틸 리팩토링
```

> **참고:** 제목에 지라 이슈 번호는 작성하지 않으며, 마일스톤은 제외합니다.

---

## 6. Merge 전략

| 방향                    | 전략                  |
| ----------------------- | --------------------- |
| **feature → develop**   | Squash and Merge      |
| **develop → main**      | Rebase and Merge      |

---

## 7. 자주 쓰는 Git 명령어

| 명령어                                   | 설명                                                |
| ---------------------------------------- | --------------------------------------------------- |
| `git status`                             | 현재 변경사항 보기                                  |
| `git commit -m "commit_message"`         | 커밋                                                |
| `git checkout -b "branch_name"`          | 새로운 브랜치 생성 후 이동                          |
| `git checkout "branch_name"`             | 이미 생성된 브랜치로 이동                           |
| `git log`                                | 커밋 로그 확인                                      |
| `git revert "commit_name"`              | 해당 커밋으로 롤백 (되돌리는 새로운 커밋 생성)      |

---

## 8. Jira 컨벤션

### 에픽 (Epic)

- `[도메인] 큰 기능 이름` → 예) `[USR] 회원가입`, `[RSV] 예약 관리`

### 이슈 (Issue)

| 항목         | 규칙                                                                 |
| ------------ | -------------------------------------------------------------------- |
| **이슈 유형** | `스토리`                                                             |
| **상태**     | 시작 시 `ToDo` → 진행 시 `In Progress` → 완료 시 `Done`             |
| **Epic Link** | 해당 에픽 선택                                                      |
| **Sprint**   | 해당 주차 스프린트 선택                                              |

### 이슈 요약 작성법

```
[도메인] 세부 기능 이름
```

**예시:**

- `[USR] 소셜 로그인`
- `[RSV] 예약 목록 조회`
- `[CMN] 데일리 스크럼(월)`
- `[CMN] 회고(금)`

### 컴포넌트 분류

- 회의 (데일리 스크럼 포함) — 단체
- 학습
- 개발
- 설계 — 개인
- 문서작성

> 컴포넌트는 위 유형 중 **하나를** 선택하여 넣어주세요.

---

## 9. 응답 템플릿

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
