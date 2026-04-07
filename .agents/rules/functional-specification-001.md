---
trigger: always_on
---

# 기능 명세서 001

## 4. ADMIN 기능

### 4.1 대시보드 | ADM-DSH-01 | Should — 위젯: 입주현황(전체/입주/공실),기기상태(ONLINE/OFFLINE/ERROR),오늘예약,최근미처리민원

### 4.2 공간관리
4.2.0 배치대시보드 | ADM-SPC-00 | Should — 층별평면도뷰,D&D배치,상태색상(OCCUPIED파랑/AVAILABLE초록/MAINTENANCE노랑),방정보팝오버,층별통계
4.2.1 목록 | ADM-SPC-01 | Must — 전체공간(호실+공용), 유형/상태 필터. 표시: 공간명,유형,상태,층,면적,기기
4.2.2 등록 | ADM-SPC-02 | Must — name(1~100,중복불가),type(PRIVATE/COMMON),status(AVAILABLE/MAINTENANCE),floor,area,maxCapacity(COMMON시),operatingHours(COMMON시),isReservable(COMMON만true가능). PRIVATE시 roomTypeId(동적목록에서 선택)
4.2.3 수정 | ADM-SPC-03 | Must — 입주중(OCCUPIED) 유형변경 불가
4.2.4 방 유형 관리 | ADM-SPC-04 | Should — room_types CRUD. 공간관리 페이지 내 탭으로 배치. 기본값(SINGLE/DOUBLE/STUDIO/SUITE)은 is_system_default=true로 시드. 사용 중인 유형은 삭제 불가(409)

### 4.3 기기관리
4.3.1 목록 | ADM-DEV-01 | Must — 공간별/종류별/상태별 필터. 표시: 기기명,종류,공간,상태,활성화,설치일
4.3.2 등록 | ADM-DEV-02 | Must — spaceId,name(1~100),deviceTypeId(동적목록,기본:DOOR_LOCK/LIGHT/AIR_CONDITIONER/WASHER/DRYER/CCTV/HEATER),modelName(100자),macAddress(50자,중복불가),mockEndpoint(URL). 기기종류는 관리자가 추가/수정 가능
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

### 4.5 신청관리 | ADM-CTR-05 | Must
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
### 4.10 커뮤니티 관리 | ADM-CMT-01 | Should
관리자용 게시글/댓글 검수 기능.
- 게시글 관리: 목록 조회(카테고리/작성자/기간/정렬), 상세 조회, 소프트 삭제(운영 정책 위반 게시글 블라인드)
- 댓글 관리: 목록 조회(게시글/작성자/기간), 소프트 삭제
- 권한: ADMIN 전용. USER/RESIDENT는 본인 작성물만 수정·삭제 가능 원칙 유지
- 감사: 관리자 삭제 작업은 `deleted_at` 기반 soft delete 및 감사 로그(요청자, 대상 ID, 시각) 남김

---

## 5. BFF/Gateway

### 5.1 라우팅 | GW-ROUTE-01 | Must
Next 미들웨어가 프론트엔드의 **`/api/...`** 요청을 가로채어 Spring **`/api/...`** 와 **동일 경로**로 프록시한다(예: 클라이언트 `GET /api/rooms` → 미들웨어 → Spring `GET /api/rooms`). 과거의 `/bff` 세그먼트는 더 이상 사용하지 않는다. URL에 `/user/`, `/resident/` 등 역할 프리픽스를 두는 방식은 **필수 아님** — 인가는 Spring Security·`@PreAuthorize`로 처리. Mock IoT 등 예외 경로만 별도 라우팅.

### 5.2 인증/인가 | GW-AUTH-01 | Must
JWT검증→역할기반인가. IoT접근: ①role=RESIDENT/ADMIN아니면403 ②RESIDENT→space_id비교→불일치시403 ③ADMIN→전체허용

### 접근제어 매트릭스

**Admin전용(🔒)**: 대시보드, 공간CRUD, 기기CRUD+제어(전체), 계약CRUD+승인거절, 예약승인, 결제, 모니터링, 민원관리(`GET /admin/vocs` 등)

**게스트(🔓)**: 방 목록/상세, 커뮤니티 **게시글 목록·상세 열람**, (정책 선택) VoC 목록·상세 열람

**USER+(👤)**: 방조회(🔓Public), 계약신청/체결/조회, 시설목록조회(🔓Public)

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
| 신청 관리 | ADM-CTR-05 | 신청 승인(조건확정)/거절 | Must |
| 예약 현황 | ADM-RSV-01~02 | 예약 조회, 승인/취소 | Should |
| 결제·정산 | ADM-BIL-01 | 결제 승인 목록 (PG 미연동) | Should |
| 모니터링 | ADM-MON-01~02 | 장애 기기, 제어 빈도 차트 | Should |
| 민원 관리 | ADM-VOC-01 | 민원 조회/답변 처리 | Should |
| 커뮤니티 관리 | ADM-CMT-01 | 게시글/댓글 검수, 관리자 삭제(블라인드) | Should |

> **Must 기능부터 구현**: Must만으로 "회원가입 → 방 조회 → 계약 신청 → 관리자 승인 → 유저 계약 체결 → RESIDENT 승격 → IoT 기기 제어" 핵심 플로우 데모 가능