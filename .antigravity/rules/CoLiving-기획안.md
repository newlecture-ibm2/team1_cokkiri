# 코리빙(Co-Living) IoT 플랫폼 — 기획안
목적: 교육과제「코리빙 플랫폼」의 요구사항·범위·방법론·산출물 정리. 팀 MVP 합의용.
> 상세기능은 `functional_specification.md`, 역할/공간/디바이스 정의 참조

## 1. 요약
**코리빙 환경 IoT 연동·관리 플랫폼.** IoT업체↔코리빙시설 미들웨어 역할(도어락·세탁기·건조기·조명·에어컨·난방·CCTV).
교육현실: 목업IoT+단일진입URL(BFF)+최소MSA → 데모가능 산출물 목표.

| 층 | 제안 |
|---|---|
| 사용자접점 | Next.js(화면+BFF) |
| 도메인·DB | Spring Boot(헥사고날)+JPA |
| 데이터 | PostgreSQL |
| 목업IoT | HTTP JSON서버(WireMock/Node) |
| 실행·배포 | Docker Compose + CI/CD 최소1줄 |

**한줄결론:** 브라우저→Next(BFF)→Spring(API)→DB+목업IoT 끊기지 않게, 게이트웨이(라우팅·인증·로깅)+입주자·관리자 최소화면 4주 완주

## 2. 배경
- **As-Is:** IoT업체별 API제각각, 단일API표면·인증·라우팅·감사로그 없음
- **To-Be:** 미들웨어 통합API+게이트웨이 라우팅. 유저(방조회/계약),입주자(기기제어/예약),관리자(공간·기기·계약관리)
- **제약:** 실제IoT없음→목업HTTP API, 인력·기간 제한

## 3. 과제매핑
| 과제구분 | 반영 |
|---|---|
| 게이트웨이 | BFF+Spring 라우팅·인증·로깅, 모니터링=로그+간단대시보드(Should) |
| 거주자 | Next입주자UI+Spring유스케이스 |
| 관리자 | 관리자UI+Spring adminAPI |
| 기술아키텍처 | 문서·다이어그램+Docker Compose실구현 |

API Gateway: 컨슈머→하나의엔드포인트, 게이트웨이가 라우팅·보안·로깅 처리

## 4. MoSCoW 범위

**Must:** M1 게이트웨이/BFF(JWT인증·인가) | M2 백엔드API(공간,기기CRUD,목업연동) | M3 유저UI(회원가입,방둘러보기,계약신청/체결) | M4 입주자UI(기기목록/제어,시설예약-주단위타임테이블) | M5 관리자UI(공간관리,기기CRUD/제어,계약승인/직접등록/수정/만료/해지) | M6 배포(DockerCompose) | M7 산출물(주차별누적)

**Should:** S1 모니터링(에너지·장애) | S2 커뮤니티게시판 | S3 계약/활동이력조회 | S4 기기사용기록 | S5 API동결(2주차말48h) | S6 관리자대시보드홈 | S7 예약관리 | S8 결제·정산(PG미연동) | S9 민원VoC | S10 회원탈퇴 | S11 공간배치대시보드 | S12 예약이력

**Could:** C1 노코드확장(설계서만) | C2 부하테스트1회
**Won't:** W1 실제IoT벤더연동 | W2 과금·SLA·다중AZ

## 5. 기능요구사항

### 5.1 게이트웨이/BFF
- 라우팅: `/api/bff/...`→Spring·목업IoT 분배
- 인증/인가: JWT기반, 역할별(USER/RESIDENT/ADMIN) + RESIDENT→space_id기반 IoT접근범위 추가검증
- 로깅: CorrelationID, ControlLog, HealthCheck(`/actuator/health`)

### 5.2 3대 역할자 (상세는 `functional_specification.md` 참조)
① **USER**: 방조회, 계약신청(임시저장/인증), 체결시RESIDENT승격, 커뮤니티, VoC
② **RESIDENT**: 개인/공용IoT제어(공용=예약시간대만), 시설예약(주단위타임테이블), 계약·기기·예약이력
③ **ADMIN**: 계약신청승인/거절, 직접등록, 기기CRUD/제어(전체+CCTV), 공간CRUD, 배치D&D, 모니터링, 결제, VoC

## 6. 비기능
| 구분 | 내용 |
|---|---|
| 성능 | 체감응답(데모기준) |
| 보안 | HTTPS(배포), 시크릿=환경변수, Git비밀번호미커밋 |
| 가용성 | DockerCompose단일환경, 이중화=문서 |
| 관측 | CorrelationID, 에러포맷통일, ControlLog |
| 호환 | 크롬최신1종 |

## 7. 도메인모델
Space(PRIVATE/COMMON) | User→Resident→Admin | Contract(DRAFT→PENDING→APPROVED→ACTIVE→EXPIRED/TERMINATED) | Device(IoT) | Reservation(공용시설예약) | ControlLog(감사) | Community(게시글+댓글) | VoC(민원) | 목업IoT(HTTP Mock)

## 8. UI목록

**유저앱(Must):** 회원가입 | 방둘러보기(목록+상세) | 계약신청(인증/임시저장) | 신청현황 | 계약체결 | 내정보
**유저앱(Should):** 내계약조회 | 커뮤니티 | 활동이력 | VoC문의

**입주자앱(Must):** 로그인(JWT+contract_id,space_id) | 기기제어(개인/공용) | 시설예약(타임테이블) | 내정보
**입주자앱(Should):** 계약정보 | 기기사용기록 | 예약이력 | VoC

**관리자(Must):** 로그인 | 공간관리 | 기기관리 | 계약관리(직접등록+수정+만료/해지) | 신청관리(승인/거절)
**관리자(Should):** 대시보드홈 | 배치D&D | 예약현황 | 결제·정산 | 에너지·장애 | VoC관리

BFF: 브라우저→`/api/bff/...`만 호출, Spring URL은 서버환경변수

## 9. 아키텍처
DockerCompose: web(Next)+api(Spring)+postgres+mock-iot → `docker compose up` 1줄 기동
```
브라우저 → Next(UI+BFF) → Spring(헥사고날) → PostgreSQL
                                    ↓
                               목업IoT(HTTP)
```
디렉토리: 프론트→`02-frontend-architecture.md`, 백엔드→`03-backend-architecture.md`

## 10. 수행방법론(5단계 워터폴)
①준비(WBS,도구) → ②요구사항(MoSCoW) → ③설계(아키텍처,ERD,API,와이어프레임) → ④개발(DB→API·화면병행) → ⑤테스트(통합시나리오)

## 11. 역할분담
PM/기획(1) | BE관리자(1,계약·결제·예약) | BE입주자(1,기기·커뮤니티) | FE관리자(1,대시보드+BFF) | FE입주자(1,앱+BFF) | 인프라(1,Compose·CI/CD·목업IoT)

## 12. 리스크
범위과다→Must만완주 | API변경→동결구간 | 프론트대기→목업BFF스텁 | 인프라몰입→Compose고정

## 13. 산출물
요구사항정의서 | 아키텍처정의서(Compose구성도) | ERD·테이블정의서 | API명세(OpenAPI) | 화면설계서 | 테스트케이스·결과 | README(실행방법,데모계정)
