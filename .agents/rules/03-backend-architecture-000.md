---
trigger: always_on
---

# ⚙️ [백엔드] 아키텍처 및 서버 룰 (Spring Boot 3.3)

백엔드 로직 작성 및 기능 구현 시 AI가 항상 기반으로 삼아야 하는 규칙입니다.

---

## 1. Application Layering (육각형 아키텍처 — 디렉토리 구조)

모듈 분리 기준: 철저하게 **도메인 중심**으로 패키지를 나눕니다. 기술 중심(`controllers/`, `services/` 한 곳에 전부 몰아넣기) 구조를 **지양**합니다.

### 1-1. 아키텍처 레이어 흐름
```
Client (HTTP)
  → adapter/in/web (Controller, DTO)
    → application/port/in (UseCase 인터페이스)
      → application/service (UseCase 구현, 비즈니스 로직)
        → application/port/out (RepositoryPort 인터페이스)
          → adapter/out/persistence (PersistenceAdapter — Port 구현)
            → adapter/out/jpa (Entity, JpaRepository)
              → Database
```

### 1-2. 최상위 패키지 구조

베이스 패키지 `com.coliving` 아래 **역할 기반**으로 최상위 패키지를 구분합니다.
```
src/main/java/com/coliving/
├── CoLivingApplication.java
├── global/                          # 횡단 관심사 (Cross-Cutting)
│   ├── config/                      # SecurityConfig, JpaConfig, WebConfig, SwaggerConfig
│   ├── security/                    # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
│   ├── error/                       # ErrorCode, BusinessException, GlobalExceptionHandler
│   ├── dto/                         # ApiResponse<T>
│   ├── entity/                      # BaseEntity (공통 부모 엔티티)
│   └── filter/                      # CorrelationIdFilter
├── admin/                           # 관리자 유스케이스
│   ├── contract/                    # 입주민 계약 관리, 신청 승인/거절
│   ├── space/                       # 공간(Space) CRUD
│   ├── device/                      # 기기 등록 및 전체 공간 기기 제어
│   ├── reservation/                 # 예약 현황 및 취소 처리
│   ├── payment/                     # 결제 목록 및 승인
│   ├── monitoring/                  # 장애 모니터링 및 에너지 통계
│   ├── dashboard/                   # 대시보드 통계 요약
│   ├── community/                   # 커뮤니티 게시글/댓글 관리자 검수
│   └── voc/                         # 민원 조회 및 답변 처리
├── user/                            # 일반 유저 유스케이스
│   ├── room/                        # 방(공간) 둘러보기
│   ├── contract/                    # 개인 공간 계약 신청
│   └── history/                     # 내 활동 이력 및 신청 목록
├── resident/                        # 입주자 유스케이스
│   ├── device/                      # 본인 방/공용 공간 기기 제어
│   ├── booking/                     # 공용 시설 예약 신청 및 취소
│   └── log/                         # 기기 제어 이력 및 예약 이력
├── common/                          # 공통 유스케이스 (전체 역할)
│   ├── auth/                        # 로그인, 회원가입, JWT 검증
│   ├── profile/                     # 내 정보, 비밀번호 변경, 회원 탈퇴
│   ├── community/                   # 커뮤니티 게시판 조회 및 작성
│   ├── voc/                         # 민원 등록 및 내 민원 조회
│   └── notification/                # 알림 목록 조회 및 읽음 처리
└── infra/                           # 외부 연동 어댑터 (Outbound)
    ├── iot/                         # MockIotClient (→ 추후 SmartThings 교체)
    └── persistence/                 # JPA 설정 및 공용 Repository 어댑터
```
> `global/`은 모든 도메인 모듈이 공유하는 횡단 관심사입니다. 개별 도메인 로직이 여기에 들어가면 안 됩니다.
> `infra/`는 외부 시스템과의 연동 어댑터를 모읍니다. 도메인별 Persistence Adapter는 각 도메인 모듈 내부에 위치합니다.

### 1-3. 도메인 모듈 내부 구조 (표준 디렉토리 트리)

위 최상위 패키지의 **각 도메인 모듈 내부**는 아래 구조를 **그대로** 사용합니다.
`{feature}` 자리에 도메인 이름을 넣습니다 (소문자 단수형, 예: `space`, `device`, `contract`).
**Admin 모듈**은 `admin/{feature}/` 경로에 동일 구조로 별도 생성하며, 클래스명에 `Admin` 접두사를 붙입니다.
```
{feature}/                                          admin/{feature}/
├── adapter/                                        ├── adapter/
│   ├── in/web/                                     │   ├── in/web/
│   │   ├── {Feature}Controller.java                │   │   ├── Admin{Feature}Controller.java
│   │   └── dto/                                    │   │   └── dto/
│   │       ├── req/                                │   │       ├── req/  ← Admin은 항상 req/res 분리
│   │       │   ├── Create{Feature}RequestDto.java  │   │       └── res/
│   │       │   ├── Update{Feature}RequestDto.java  │   └── out/persistence/
│   │       │   └── {Feature}ListRequestDto.java    │       └── Admin{Feature}PersistenceAdapter.java
│   │       └── res/                                ├── application/
│   │           ├── {Feature}ResponseDto.java       │   ├── command/
│   │           ├── {Feature}DetailResponseDto.java │   ├── port/
│   │           ├── {Feature}ListResponseDto.java   │   │   ├── in/  ← Admin{Feature}UseCase 등
│   │           ├── Create{Feature}ResponseDto.java │   │   └── out/ ← Admin{Feature}RepositoryPort
│   │           └── Update{Feature}ResponseDto.java │   ├── result/
│   └── out/                                        │   └── service/
│       ├── jpa/                                    │       └── Admin{Feature}Service.java
│       │   ├── {Feature}Entity.java                └── model/
│       │   └── {Feature}JpaRepository.java             └── Admin{Feature}.java (필요 시)
│       └── persistence/
│           └── {Feature}PersistenceAdapter.java
├── application/
│   ├── command/                    ← Service 입력 VO (불변 객체)
│   │   ├── Create{Feature}Command.java
│   │   ├── Update{Feature}Command.java
│   │   ├── Delete{Feature}Command.java
│   │   ├── Get{Feature}Command.java
│   │   └── {Feature}ListCommand.java
│   ├── port/
│   │   ├── in/                     ← UseCase 인터페이스
│   │   │   ├── {Feature}UseCase.java (통합, 선택)
│   │   │   ├── Create{Feature}UseCase.java
│   │   │   ├── Update{Feature}UseCase.java
│   │   │   ├── Delete{Feature}UseCase.java
│   │   │   └── View{Feature}ListUseCase.java
│   │   └── out/                    ← Repository 포트
│   │       └── {Feature}RepositoryPort.java
│   ├── result/                     ← Service 출력 VO (불변 객체)
│   │   ├── Create{Feature}Result.java
│   │   ├── Update{Feature}Result.java
│   │   ├── Get{Feature}Result.java
│   │   └── {Feature}ListResult.java
│   └── service/
│       └── {Feature}Service.java
└── model/                          ← 도메인 모델 (순수 Java 객체)
    └── {Feature}.java
```
> **DTO 폴더 규칙 (엄격):** **생성·수정·삭제 등 쓰기 유스케이스가 하나라도 있는 모듈**(예: `contract`, `space`, `device`, `admin/space`)은 Web DTO를 **반드시** `adapter/in/web/dto/req/` · `dto/res/` 로 분리한다. **조회 전용 모듈**(목록·상세 GET만, CUD 없음)만 `dto/` 플랫 허용. 경계가 애매하면 **req/res 분리를 기본**으로 한다.
> User-facing 모듈 클래스에는 접두사 없음 (기본).

### 1-3-1. DTO 분리 빠른 판별

| 모듈 유형 | `dto/` 구조 | 예시 |
|-----------|-------------|------|
| CRUD 또는 POST/PUT/PATCH/DELETE 보유 | **`dto/req/` + `dto/res/`** 필수 | Contract, Space, Device, Post(작성·수정 있음) |
| 읽기 전용(View) | `dto/` 플랫 허용 | 단순 조회 전용 리포트 모듈 |
| Admin 동일 도메인 | 동일 규칙 — Admin도 CUD 있으면 **req/res** | `admin/space/adapter/in/web/dto/req` … |

### 1-4. 레이어별 책임

| 레이어 | 패키지 | 책임 |
|--------|--------|------|
| **Adapter In** | `adapter/in/web/` | HTTP 요청 수신, DTO ↔ Command/Result 변환 |
| **Adapter Out (JPA)** | `adapter/out/jpa/` | JPA Entity 정의, Spring Data Repository |
| **Adapter Out (Persistence)** | `adapter/out/persistence/` | RepositoryPort 구현, Entity ↔ Model 변환 |
| **Application (Port In)** | `application/port/in/` | UseCase 인터페이스 정의 |
| **Application (Port Out)** | `application/port/out/` | Repository 인터페이스 (외부 의존 추상화) |
| **Application (Command)** | `application/command/` | Service 입력 VO (불변 객체) |
| **Application (Result)** | `application/result/` | Service 출력 VO (불변 객체) |
| **Application (Service)** | `application/service/` | UseCase 구현, 비즈니스 로직 |
| **Model** | `model/` | 도메인 모델 (순수 Java 객체) |

### 1-5. 데이터 흐름
```
1. Client → Controller : HTTP Request
2. Controller           : RequestDto → Command 변환
3. Controller → UseCase : execute(Command)
4. UseCase → Service    : (구현체 호출)
5. Service → RepositoryPort : findAll / save / etc.
6. RepositoryPort → PersistenceAdapter : (구현체 호출)
7. PersistenceAdapter → JpaRepository  : JPA 쿼리 → DB
8. DB → JpaRepository → PersistenceAdapter : Entity → Model 변환
9. PersistenceAdapter → Service : Model 반환
10. Service → Controller : Result 반환
11. Controller           : Result → ResponseDto 변환
12. Controller → Client  : HTTP Response
```

### 1-6. 폴더 이름 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| Feature 최상위 | **소문자 단수형** | `space`, `device`, `resident`, `contract` |
| Admin 모듈 | `admin/{feature}/` | `admin/space/`, `admin/device/` |
| 하위 패키지 | 고정 이름 사용 | `adapter`, `in`, `out`, `web`, `dto`, `req`, `res`, `jpa`, `persistence`, `application`, `command`, `port`, `result`, `service`, `model` |
| 도메인 모델 폴더 | **`model/`** 으로 통일 | ~~`domain/model/`~~ 사용 금지 |

### 1-7. 파일(클래스) 네이밍 규칙

**Web DTO (Option A — 채택):** 요청·응답 클래스는 **`…RequestDto` / `…ResponseDto` 접미사로 통일**한다. 기존 코드에 `~Request`·`~Response`·`~VO`만 붙은 클래스가 있으면 **리팩터링하여 Option A에 맞출 것**(규칙 완화 Option B는 채택하지 않음).

| 요소 | 접미사 | 금지 |
|------|--------|------|
| Controller | `Controller` | `~Api`, `~Rest` |
| DTO | `RequestDto` / `ResponseDto` | `~Request`, `~Response`, `~VO` |
| Entity | `Entity` | `~Model` (model 패키지와 혼동) |
| JPA Repository | `JpaRepository` | `~Dao`, `~DataRepository` |
| Repository Port | `RepositoryPort` | `~Repository` (JPA와 혼동) |
| Persistence Adapter | `PersistenceAdapter` | `~Adapter` (역할 불명확) |
| UseCase | `UseCase` | `~Port` |
| Command | `Command` | `~Input`, `~Param` |
| Result | `Result` | `~Output`, `~Response` |
| Service | `Service` | `~Impl`, `~ServiceImpl` |
| Domain Model | `{Feature}.java` (접미사 없음) | - |

### 1-8. 새 모듈 추가 체크리스트

새 도메인 `{feature}`를 추가할 때 아래 순서대로 생성합니다:

1. `{feature}/model/` — 도메인 모델 먼저 정의 (`{Feature}.java`)
2. `{feature}/adapter/out/jpa/` — `{Feature}Entity.java`, `{Feature}JpaRepository.java`
3. `{feature}/application/port/out/` — `{Feature}RepositoryPort.java`
4. `{feature}/adapter/out/persistence/` — `{Feature}PersistenceAdapter.java`
5. `{feature}/application/command/` — 필요한 Command VO들
6. `{feature}/application/result/` — 필요한 Result VO들
7. `{feature}/application/port/in/` — UseCase 인터페이스
8. `{feature}/application/service/` — `{Feature}Service.java` (UseCase 구현)
9. `{feature}/adapter/in/web/` — `{Feature}Controller.java`
10. `{feature}/adapter/in/web/dto/req/` · `dto/res/` — Request/Response DTO들 (**CUD 있으면 이 경로 필수**. 조회 전용이면 `dto/` 플랫 가능)
11. Admin이 필요하면 `admin/{feature}/` 동일 구조로 별도 생성

### 1-9. ❌ 금지 사항

1. **`domain/model/` 폴더 사용 금지** → `model/` 로 통일
2. **DTO에 비즈니스 로직 금지** → 변환만 담당
3. **Service에서 Entity 직접 반환 금지** → 반드시 Result로 변환
4. **Controller에서 Repository 직접 접근 금지** → UseCase만 사용
5. **클래스명에 `Impl` 접미사 금지** → `{Feature}Service`가 곧 구현체
6. **패키지명 복수형 금지** → `spaces/` ❌, `space/` ✅

---

