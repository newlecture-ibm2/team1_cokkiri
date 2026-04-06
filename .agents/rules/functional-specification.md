---
trigger: always_on
---

# 기능 명세서 (압축본)

## 역할(Role) 정의

| 역할 | DB값 | 설명 | 전환 조건 |
|---|---|---|---|
| 일반 유저 | `USER` | 기본 역할. 방 조회, 계약 신청, 커뮤니티 이용 | 회원가입 시 자동 부여 |
| 입주자 | `RESIDENT` | 계약 체결 완료. IoT 기기 제어, 공용 시설 예약 가능 | 계약 체결(ACTIVE) 시 자동 승격 |
| 관리자 | `ADMIN` | 시스템 전체 관리. 모든 기능 접근 | 시스템 직접 부여 |

**승격 흐름:** `USER` →(계약 체결)→ `RESIDENT` →(계약 만료/해지)→ `USER`
계약 만료·해지 시 자동으로 USER 복귀, IoT 접근 권한 회수.

**JWT Payload:** `sub`, `role`, `exp`, `iat` + RESIDENT만 `contract_id`, `space_id` 포함 → IoT 접근범위 토큰레벨 제한

## 공용 공간 (MVP 4종)
| 공간 | 예약정책 | IoT |
|---|---|---|
| 세탁실 | 자유이용 | 세탁기,건조기,조명,CCTV |
| 라운지 | 자유이용 | 조명,에어컨,CCTV |
| 회의실 | **예약제** | 조명,에어컨,CCTV |
| 헬스장 | 자유이용 | 조명,에어컨,CCTV |



## IoT 디바이스 (MVP 7종)
| 디바이스 | 공간 | 명령 | UI |
|---|---|---|---|
| 도어락 | 개인 | LOCK,UNLOCK | 토글 |
| 세탁기 | 공용 | START,STOP | 버튼+코스 |
| 건조기 | 공용 | START,STOP | 버튼+코스 |
| 조명 | 개인/공용 | ON,OFF,SET_BRIGHTNESS | 토글+밝기슬라이더 |
| 에어컨 | 개인/공용 | ON,OFF,SET_TEMP,SET_MODE | 토글+온도+모드(냉방/난방/제습/송풍) |
| 난방 | 개인/공용 | ON,OFF,SET_TEMP | 토글+온도(16~30℃) |
| CCTV | 공용 | ON,OFF | 토글(**관리자전용**) |

- CCTV: **ADMIN만 제어**, 입주자 조회/제어 불가
- 도어락: **개인공간만** 설치, 해당 호실 입주자만 제어

---

## 1. 공통 기능

### 1.1 회원가입 | CMN-AUTH-00 | Must
입력: loginId(4~50,영숫자,중복불가), password(8+,영숫자특수), passwordConfirm, name(2~50), birthDate(YYMMDD 6자리), gender(M/F), nationality, phone(000-0000-0000/11자리), email
흐름: 폼→BFF→POST /api/auth/register→검증(ID중복,PW정책,형식)→USERS INSERT(role=USER)→로그인화면

### 1.2 로그인 | CMN-AUTH-01 | Must
입력: loginId(4~50), password(8+)
흐름: POST /api/auth/login→PW해시검증→성공:RESIDENT→CONTRACT조회→JWT(contract_id,space_id포함)/USER·ADMIN→기본JWT
실패: 401 "아이디 또는 비밀번호를 확인하세요"
BFF: httpOnly쿠키저장→라우팅(ADMIN→/admin/dashboard, RESIDENT→/my-room, USER→/rooms)

### 1.3 아이디찾기 | CMN-AUTH-04 | Should
입력: name(2~50)+email→POST /api/auth/find-id
USERS에서 일치조회(DEACTIVATED도 404통일→보안)→마스킹(앞2자리+*)+가입일 표시
에러: 404(계정없음), 400(형식오류)

### 1.4 비밀번호찾기 | CMN-AUTH-05 | Should
입력: loginId+email→POST /api/auth/reset-password
임시PW생성(12자,영대소+숫자+특수)→해시DB업데이트→이메일발송("[CoLiving] 임시 비밀번호 안내")→RefreshToken무효화
에러: 404, 400, 500(이메일실패), 429(5분내5회초과)

### 1.5 로그아웃 | CMN-AUTH-02 | Must — JWT무효화→로그인화면
### 1.6 토큰갱신 | CMN-AUTH-03 | Must — RefreshToken→새 Access/Refresh 발급. **RESIDENT**는 갱신 시점에 계약 **ACTIVE** 재확인(만료·해지·TERMINATED면 **role=USER** 클레임으로 갱신, `contract_id`·`space_id` 제거)

### 1.7 내정보조회 | CMN-PRF-01 | Must
표시: loginId(수정불가),name,phone,email,birthDate,gender,nationality,role,createdAt,계약요약(RESIDENT:호실+상태/USER:"없음"),예약요약

### 1.8 내정보수정 | CMN-PRF-02 | Must — 수정가능: name(2~50),phone,email. loginId/role 변경불가(시스템자동)
### 1.8.1 연락처 인증 | CMN-PRF-02-1 | Should — `POST /api/users/me/verify/phone/send|confirm`, `.../email/send|confirm` 로 SMS·이메일 검증. 계약 신청(§2.3)의 phone/email 필수 인증과 동일 정책으로 맞출 것
### 1.9 비밀번호변경 | CMN-PRF-03 | Must — 현재PW검증→새PW(8+,영숫자특수)해시→DB업데이트→RefreshToken무효화→로그인화면

### 1.9.1 회원탈퇴 | CMN-PRF-04 | Should
PW재입력→검증: ACTIVE계약없음+미납금없음→확인모달→개인정보익명화+DEACTIVATED+게시글작성자→"탈퇴한 사용자"+JWT무효화
에러: 409(활성계약/미납금), 401(PW불일치). 탈퇴후 CONTROL_LOG등 감사로그 보존

### 1.10 커뮤니티 | 목록·상세 🔓 / 쓰기 🔑(USER+)
1.10.1 게시글목록/상세 | CMN-CMT-01 | Should — **비회원 열람 가능**(`GET /api/posts`, `GET /api/posts/{id}`). 표시: 유형(공지/질문/제안/모임/자유),프사,제목,작성자,작성일,댓글수,좋아요,조회수. 최신순+페이지네이션
1.10.2 게시글CRUD | CMN-CMT-02 | Should — 입력: 유형(공지=ADMIN만),제목(100자),본문,첨부(5개,10MB),URL(3개). 본인만 수정/삭제
1.10.3 댓글 | CMN-CMT-03 | Should — 본인만 삭제. **줄바꿈보존 필수**: 저장시 `\n` 보존, 렌더링시 `\n`→`<br>` 변환

### 1.11 알림 | CMN-NTF-01 | Should
목록·읽음처리: `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, Query `is_read`, `p`, `s`. 계약·예약·VoC 답변 등 참조 타입은 `api-specification.md` §10과 ERD NOTIFICATION 정의에 맞출 것.

### 1.12 민원(VoC) 열람 정책 | CMN-VOC-00 | Should
공개 목록·상세(`GET /vocs`, `GET /vocs/{id}`)는 🔓 또는 🔑 **팀 정책으로 선택**. 등록·내목록·수정·취소는 🔑.

---

## 2. USER 기능

### 2.1 방목록 | USR-ROM-01 | Must | 🔓Public
표시: 이미지,호실명,유형(1인실/2인실),층,면적(㎡),방수,보증금,월임대료,상태(AVAILABLE/OCCUPIED)

### 2.2 방상세 | USR-ROM-02 | Must | 🔓Public
표시: 이미지(갤러리),평면도,호실명,유형,층,면적,방/욕실수,수용인원,방향,보증금,월세,관리비,계약가능여부,주차,생활시설아이콘,상세설명

### 2.3 계약신청 | USR-CTR-00 | Must | 👤USER+
입력: spaceId(AVAILABLE PRIVATE만), name, birthDate, gender, phone(**SMS인증필수**), nationality, address, email(**이메일인증필수**), bankAccount, desiredStartDate(오늘이후), desiredDuration(1개월+), contractLanguage(한국어/영어), privacyConsent, requestNotes(500자), **phoneVerified**, **emailVerified**(또는 인증 세션 플래그), **`status`**: DRAFT(임시저장) / PENDING(제출)
버튼: 임시저장(→**status=DRAFT**, 재진입 시 복원) / 신청(→인증완료 확인→**status=PENDING**). **`isDraft` 단일 불리언으로 구분하지 않음**(API·ERD는 `CONTRACT.status`만 사용)
검증: 호실 AVAILABLE + 진행 중 신청 없음 + 인증 완료 → CONTRACT INSERT/UPDATE → 관리자 알림
승인 후 유저가 계약 체결 화면에서 최종 동의 필요

### 2.4 신청현황 | USR-CTR-00-1 | Must — PENDING/APPROVED/REJECTED 조회, PENDING취소가능, APPROVED→"계약체결"버튼

### 2.5 계약체결 | USR-CTR-01 | Must
표시: 호실, 층/면적, 시작일, 종료일, 월임대료, 보증금, 특약
동의체크(필수): 계약조건 동의 + 이용약관 동의
검증: APPROVED 상태 + 호실 AVAILABLE
통과 시: CONTRACT→ACTIVE, Space→OCCUPIED, role→RESIDENT (자동 승격)
체결 성공 응답에 **갱신된 accessToken·refreshToken** 포함 권장(즉시 RESIDENT UI 전환). 다음 요청부터 JWT에 contract_id, space_id 포함
에러: 409 "계약 체결 불가" (비APPROVED) | 409 "호실 이미 계약완료" (OCCUPIED) | 409 "이미 활성계약 보유"

### 2.6 내계약조회 | USR-CTR-02 | Should — 상태,호실,기간,임대료,보증금,체결일. 활성계약없으면 "계약없음"+방둘러보기안내
### 2.7 활동이력 | USR-HST-01 | Should — 탭: 신청이력/계약이력/게시글이력/댓글이력. 각 최신순 정렬. 백엔드 집계 시 **`GET /api/users/me/history`**(Query: `type`, `p`, `s`) 등 단일·분할 API로 제공 가능 — `api-specification.md` §2.6, `03-backend-architecture.md` §5-1 참조

---

## 3. RESIDENT 기능
접근: RESIDENT역할 필수, JWT `space_id` 기반 IoT접근범위 결정

### 3.1.1 기기목록 | RES-DEV-01 | Must
개인(PRIVATE): space_id기기(is_active=true) / 공용(COMMON): 전체공용기기+예약여부표시
조회로직: JWT role=RESIDENT→space_id추출→CONTRACT ACTIVE+space_id이중검증→개인/공용기기조회→RESERVATION확인
표시: 공간구분(개인/공용),기기명,종류(아이콘),상태(ONLINE초록/OFFLINE회색/ERROR빨강),공간명,제어가능여부
**공용IoT정책**: 조회=자유, 제어=APPROVED예약시간대만, 예약없으면 "예약 후 이용 가능" 표시

### 3.1.2 기기제어 | RES-DEV-02 | Must
권한검증:
- role=RESIDENT 확인
- PRIVATE 기기: JWT space_id와 기기 설치 space_id 일치 확인
- COMMON 기기: RESERVATION에서 현재시각 APPROVED 예약 보유 확인
- CONTRACT ACTIVE + 기기 ONLINE 확인
통과→목업IoT명령전송→CONTROL_LOG(actor_type=RESIDENT)→결과반환
에러: 403 "입주자만 가능" | 403 "접근 권한 없음" | 403 "예약시간 아님" | 403 "계약 만료" | 409 "기기 오프라인" | 502 "IoT 통신 실패"

### 3.2 공용시설예약 (RESIDENT한정)
3.2.1 시설조회 | RES-RSV-01 | Must — is_reservable=true인 COMMON공간. 표시: 공간명,운영시간,수용인원,상태
3.2.2 타임슬롯 | RES-RSV-02 | Must — **주단위 타임테이블**(가로:요일,세로:시간). 색상: 회색(타인예약)/초록(가능)/파란(내예약). 주이동+셀클릭예약
3.2.3 예약신청 | RES-RSV-03 | Must — 입력: spaceId,date(오늘이후),startTime,endTime(운영시간내). 검증: ACTIVE계약+시간대중복→RESERVATION(PENDING)→자동/관리자승인
3.2.4 내예약 | RES-RSV-04 | Must — 조회+PENDING/APPROVED 취소가능

### 3.3 계약정보
3.3.1 계약상세 | RES-CTR-01 | Should — 호실,기간,상태,임대료,보증금
3.3.2 계약이력 | RES-CTR-02 | Should — 전체이력(과거포함)

### 3.5 기기사용기록 | RES-LOG-01 | Should
CONTROL_LOG에서 actor_id=본인,actor_type=RESIDENT 조회 (개인+공용기기 모두)
표시: 일시,공간구분,공간명,기기명,종류,명령,결과(SUCCESS/FAILURE),상세
필터: 기간(월/주간/직접입력),공간구분,기기종류,기기명,결과

### 3.6 예약이력 | RES-LOG-02 | Should — 예약ID,시설명,날짜,시간대,상태(PENDING/APPROVED/CANCELLED/COMPLETED),신청일

---

## 4. ADMIN 기능

### 4.1 대시보드 | ADM-DSH-01 | Should — 위젯: 입주현황(전체/입주/공실),기기상태(ONLINE/OFFLINE/ERROR),오늘예약,최근미처리민원

### 4.2 공간관리
4.2.0 배치대시보드 | ADM-SPC-00 | Should — 층별평면도뷰,D&D배치,상태색상(OCCUPIED파랑/AVAILABLE초록/MAINTENANCE노랑),방정보팝오버,층별통계
4.2.1 목록 | ADM-SPC-01 | Must — 전체공간(호실+공용), 유형/상태 필터. 표시: 공간명,유형,상태,층,면적,기기
4.2.2 등록 | ADM-SPC-02 | Must — name(1~100,중복불가),type(PRIVATE/COMMON),status(AVAILABLE/MAINTENANCE),floor,area,maxCapacity(COMMON시),operatingHours(COMMON시),isReservable(COMMON만true가능)
4.2.3 수정 | ADM-SPC-03 | Must — 입주중(OCCUPIED) 유형변경 불가

### 4.3 기기관리
4.3.1 목록 | ADM-DEV-01 | Must — 공간별/종류별/상태별 필터. 표시: 기기명,종류,공간,상태,활성화,설치일
4.3.2 등록 | ADM-DEV-02 | Must — spaceId,name(1~100),deviceTypeId(동적목록,기본:LIGHT/HVAC/LOCK/WASHER),modelName(100자),mockEndpoint(URL). 기기종류는 관리자가 추가/수정 가능
4.3.3 비활성화 | ADM-DEV-03 | Must — is_active 토글. 비활성=입주자목록 미표시+제어불가
4.3.4 수정 | ADM-DEV-05 | Must — name,space(변경시 접근권한자동변경),modelName,mockEndpoint. **기기종류 변경불가**(삭제후 재등록)
4.3.5 삭제 | ADM-DEV-06 | Must — 조건: is_active=false + CONTROL_LOG이력없음. 이력있으면 비활성화로 관리. 에러: 409(활성/이력존재)
4.3.6 제어 | ADM-DEV-04 | Must — RES-DEV-02와 동일 흐름, ADMIN→space_id제한없이 전체접근. CONTROL_LOG actor_type=ADMIN

### 4.4 계약관리
4.4.1 목록 | ADM-CTR-01 | Must — 상태/입주자/호실 필터
4.4.2 등록(직접) | ADM-CTR-02 | Must — 관리자주도(오프라인/대리등록)
  입력: userId, spaceId(PRIVATE+AVAILABLE), startDate, endDate, monthlyRent, deposit
  처리: CONTRACT(ACTIVE)직행 + Space→OCCUPIED + role→RESIDENT (신청단계 생략)
4.4.3 수정 | ADM-CTR-03 | Must — 기간,임대료 수정 가능. TERMINATED 상태는 수정불가
4.4.4 만료/해지 | ADM-CTR-04 | Must
  처리: CONTRACT→EXPIRED/TERMINATED + Space→AVAILABLE + 다른ACTIVE계약 없으면 role→USER
  JWT 즉시 무효화(블랙리스트), 다음접근시 재로그인 유도

### 4.5 신청관리 | ADM-BKG-01 | Must
PENDING목록→승인: 조건확정(startDate,endDate,rent,deposit,specialTerms(1000자))→APPROVED→유저알림→유저최종동의시 체결
거절: →REJECTED→유저알림. **승인≠계약생성**, 유저동의필요

### 4.6 예약관리
4.6.1 현황 | ADM-RSV-01 | Should — 캘린더/리스트, 시설/날짜/상태필터
4.6.2 승인/취소 | ADM-RSV-02 | Should — PENDING→APPROVED/CANCELLED

### 4.7 결제 | ADM-BIL-01 | Should — 결제승인목록, MVP=PG미연동(상태변경만:PENDING→PAID)
### 4.8 모니터링
4.8.1 장애 | ADM-MON-01 | Should — ERROR기기 실시간목록(기기명,공간,마지막온라인)
4.8.2 에너지 | ADM-MON-02 | Should — CONTROL_LOG기반 제어빈도차트(실제전력=범위밖)
### 4.9 민원 | ADM-VOC-01 | Should — 민원조회+답변→처리완료

---

## 5. BFF/Gateway

### 5.1 라우팅 | GW-ROUTE-01 | Must
Next **`/api/bff/...`** 는 Spring **`/api/...`** 와 **동일 경로**로 프록시한다(예: BFF `GET /api/bff/rooms` → Spring `GET /api/rooms`). URL에 `/user/`, `/resident/` 등 역할 프리픽스를 두는 방식은 **필수 아님** — 인가는 Spring Security·`@PreAuthorize`로 처리. Mock IoT 등 예외 경로만 별도 라우팅.

### 5.2 인증/인가 | GW-AUTH-01 | Must
JWT검증→역할기반인가. IoT접근: ①role=RESIDENT/ADMIN아니면403 ②RESIDENT→space_id비교→불일치시403 ③ADMIN→전체허용

### 접근제어 매트릭스

**Admin전용(🔒)**: 대시보드, 공간CRUD, 기기CRUD+제어(전체), 계약CRUD+승인거절, 예약승인, 결제, 모니터링, 민원관리(`GET /admin/vocs` 등)

**게스트(🔓)**: 방 목록/상세, 커뮤니티 **게시글 목록·상세 열람**, (정책 선택) VoC 목록·상세 열람

**공통(🔑)**: 내정보조회/수정, PW변경, 탈퇴, 활동이력, 커뮤니티 **작성·댓글·좋아요**(ADMIN=게시글/댓글 전체 삭제 권한), 민원 **등록·내목록·수정**

**USER+(👤)**: 계약신청/체결/조회(방 열람은 🔓와 중복)

**RESIDENT+(🏠)**: IoT기기제어(space_id기반, 공용=예약시간대만), 시설예약(신청/조회/취소), 기기사용기록, 예약이력

- ADMIN: 게시글/댓글/민원 전체 처리(관리 목적), IoT 전 공간 제어
- RESIDENT/USER: 본인 게시글/댓글/민원만 수정·삭제

### 5.3 로깅 | GW-LOG-01 | Should — CorrelationID+요청메타 로그. 기기제어→CONTROL_LOG별도기록
### 5.4 Health | GW-HEALTH-01 | Must — `/actuator/health`

---

## 6. 기능-화면 매핑 요약

### 6.0 일반 유저 앱 (공용/USER)

| 화면 | 기능 ID | 주요 기능 | 우선순위 |
|---|---|---|---|
| 회원가입 | CMN-AUTH-00 | ID/PW/이름/생년월일/성별/국적/연락처/이메일, USER 부여 | Must |
| 아이디 찾기 | CMN-AUTH-04 | 이름+이메일 → 마스킹 ID 확인 | Should |
| 비밀번호 찾기 | CMN-AUTH-05 | 로그인ID+이메일 → 임시 비밀번호 발급 | Should |
| 방 둘러보기 | USR-ROM-01~02 | 방 목록(이미지/유형/금액), 방 상세(평면도/시설/설명) | Must |
| 계약 신청 | USR-CTR-00 | 개인공간 계약 신청 (인증/임시저장) | Must |
| 신청 현황 | USR-CTR-00-1 | 신청 상태 조회, 취소 | Must |
| 계약 체결 | USR-CTR-01 | 승인된 신청의 조건 확인 및 동의, RESIDENT 승격 | Must |
| 내 계약 조회 | USR-CTR-02 | 현재/과거 계약 정보 | Should |
| 커뮤니티 | CMN-CMT-01~03 | 게시글/댓글 CRUD (유형/첨부/URL/좋아요) | Should |
| 내 정보 | CMN-PRF-01~04 | 조회/수정, PW변경, 탈퇴 | Must |
| 활동 이력 | USR-HST-01 | 신청/계약/게시글/댓글 이력 | Should |
| 민원(VoC) | - | 문의 등록/조회/수정/취소 | Should |

### 6.1 입주자 앱 (RESIDENT)

| 화면 | 기능 ID | 주요 기능 | 우선순위 |
|---|---|---|---|
| 로그인 | CMN-AUTH-01~05 | JWT 발급(contract_id, space_id 포함), 토큰갱신, ID/PW찾기 | Must |
| 내 기기 제어 | RES-DEV-01~02 | 개인/공용 구분 목록, ON/OFF/설정 제어 | Must |
| 공용 시설 예약 | RES-RSV-01~04 | 시설 조회, 주단위 타임테이블, 예약 신청, 내 예약 관리 | Must |
| 계약 정보 | RES-CTR-01~02 | 계약 상세, 계약 이력 | Should |
| 기기 사용 기록 | RES-LOG-01 | 제어 이력(개인+공용, 월/주간 필터) | Should |
| 예약 이력 | RES-LOG-02 | 예약 전체 이력 | Should |
| 내 정보 | CMN-PRF-01~04 | 조회/수정, PW변경, 탈퇴 | Must |

### 6.2 관리자 대시보드 (ADMIN)

| 화면 | 기능 ID | 주요 기능 | 우선순위 |
|---|---|---|---|
| 관리자 로그인 | CMN-AUTH-01~05 | JWT 발급, 토큰갱신, ID/PW찾기 | Must |
| 대시보드 홈 | ADM-DSH-01 | 입주현황, 기기상태, 예약, 민원 요약 | Should |
| 공간 배치 | ADM-SPC-00 | 층별 평면도 D&D 배치 | Should |
| 공간 관리 | ADM-SPC-01~03 | 공간 CRUD, 상태 변경 | Must |
| 기기 관리 | ADM-DEV-01~06 | 기기 CRUD, 활성화/비활성화, 제어 | Must |
| 계약 관리 | ADM-CTR-01~04 | 직접등록/대리, 수정, 만료/해지, 역할 승격/강등 | Must |
| 신청 관리 | ADM-BKG-01 | 신청 승인(조건확정)/거절 | Must |
| 예약 현황 | ADM-RSV-01~02 | 예약 조회, 승인/취소 | Should |
| 결제·정산 | ADM-BIL-01 | 결제 승인 목록 (PG 미연동) | Should |
| 모니터링 | ADM-MON-01~02 | 장애 기기, 제어 빈도 차트 | Should |
| 민원 관리 | ADM-VOC-01 | 민원 조회/답변 처리 | Should |

> **Must 기능부터 구현**: Must만으로 "회원가입 → 방 조회 → 계약 신청 → 관리자 승인 → 유저 계약 체결 → RESIDENT 승격 → IoT 기기 제어" 핵심 플로우 데모 가능
