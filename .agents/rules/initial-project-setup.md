---
trigger: always_on
---

# 프로젝트 초기 세팅 (압축본)
기획안·기능명세서·ERD(v2.0) 기반 백엔드+프론트엔드 초기 세팅 명세

## 1. 기술 스택

**백엔드:** Java21, SpringBoot3.3.x, Gradle8.10(Groovy), PostgreSQL16(alpine), DockerCompose v2, jjwt0.12.6, springdoc-openapi2.6.0, WireMock3.5.4
**프론트엔드:** Node20, Next.js15(AppRouter), React19, TypeScript5, TailwindCSS4(@tailwindcss/postcss), shadcn/ui+Radix, framer-motion, ESLint9

## 2. 디렉토리 구조

### 2.1 전체
```
ibm_cokkiri/
├── .gitattributes, .env.example, docker-compose.yml, docs/
├── backend/    # Spring Boot (§2.2)
└── frontend/   # Next.js (§2.3)
```

### 2.2 백엔드
```
backend/src/main/java/com/coliving/
├── CoLivingApplication.java
├── global/                    # 횡단관심사
│   ├── config/   (Security, Jpa, Web, Swagger)
│   ├── security/ (JwtTokenProvider, JwtAuthFilter, CustomUserDetailsService)
│   ├── error/    (ErrorCode, BusinessException, GlobalExceptionHandler)
│   ├── dto/      (ApiResponse)
│   ├── entity/   (BaseEntity)
│   └── filter/   (CorrelationIdFilter)
├── admin/        # 관리자 유스케이스
│   ├── contract/ space/ device/ reservation/ payment/ monitoring/ dashboard/ voc/
├── user/         # 유저 유스케이스
│   ├── room/ contract/ history/
├── resident/     # 입주자 유스케이스
│   ├── device/ booking/ log/
├── common/       # 공통 (전역할)
│   ├── auth/ profile/ community/ vocs/ notification/
└── infra/        # 외부연동
    ├── iot/MockIotClient.java
    └── persistence/
```
각 유스케이스 패키지 내부 = 헥사고날 구조 (adapter/in/web, application, adapter/out). 상세→`03-backend-architecture.md`

### 2.3 프론트엔드
```
frontend/src/
├── app/                        # App Router 콜로케이션
│   ├── layout.tsx, page.tsx   # 루트
│   ├── (auth)/                # 🔓 login,register,find-id,reset-password
│   ├── (public)/rooms/        # 🌐 방목록,[id]상세
│   ├── (resident-app)/        # 📱 모바일지향: my-devices,facilities,my-contract,device-history,reservation-history
│   ├── (user)/                # 👤 contract-apply,my-contracts,my-contract-info,my-history
│   ├── (admin)/               # 🏢 dashboard,spaces,devices,contracts,reservations,billing,vocs
│   └── (common)/              # 💬 community,profile,vocs
├── middleware.ts               # 프록시 및 JWT 인가 미들웨어
├── components/                 # 전역UI
│   ├── ui/ (Button,Input,Modal,shadcn)
│   └── layout/ (Header,Sidebar,Footer,NavBar,ScrollToTop,PageLayout)
├── lib/ (api.ts, auth.ts, constants.ts)
└── styles/ (index.css, tailwind.css, theme.css, fonts.css)
```
- RouteGroup `(괄호)`로 역할별 페이지 그룹화. URL무관, 레이아웃/인증 미들웨어 분리
- TailwindCSS v4: `tailwind.config.js`폐기→CSS인라인변수기반. `theme.css`에 `:root`+`@theme inline`으로 컬러칩매핑. Hex하드코딩금지→유틸리티클래스만 사용
- `(resident-app)` = 모바일지향 UI. 하단NavBar, 터치인터랙션우선, 반응형(50%여백삭감,VW폰트,2열그리드)

## 3. 의존성

### 3.1 백엔드 (build.gradle 핵심)
```groovy
plugins { id 'org.springframework.boot' version '3.3.10'; id 'io.spring.dependency-management' version '1.1.7' }
java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }
dependencies {
    implementation 'spring-boot-starter-web', 'starter-data-jpa', 'starter-security', 'starter-validation'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6' // runtimeOnly: jjwt-impl, jjwt-jackson
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'
    runtimeOnly 'org.postgresql:postgresql'
    compileOnly 'org.projectlombok:lombok' // annotationProcessor
}
```

### 3.2 프론트엔드 (핵심)
next^15, react^19, react-dom^19, typescript^5, eslint^9, eslint-config-next^15
scripts: dev→port3000, start→port3111

## 4. 환경변수

### application.yml (공통)
`spring.jpa.hibernate.ddl-auto:update` (마이그레이션 도구 미사용 → JPA Entity가 스키마를 직접 관리. 마이그레이션 도구 도입 시 validate로 전환), `open-in-view:false`, `jackson.time-zone:Asia/Seoul` — REST JSON은 **camelCase 기본**(snake_case 네이밍 전략 설정 금지, `03-backend-architecture.md` §4와 동일)
`multipart: max-file-size:15MB, max-request-size:50MB` | `server.port:8080` | swagger-ui:`/swagger-ui.html`

### application-dev.yml
DB: `jdbc:postgresql://db:5432/coliving` (username/password=`.env`에서 주입) | jpa: `show-sql:true, ddl-auto:update, sql.init.mode:never`
JWT: secret=dev용32자+, access=30분(1800000ms), refresh=7일(604800000ms) | mock-iot: `http://mock-iot:8000`
logging: com.coliving=DEBUG, org.hibernate.SQL=DEBUG

### application-prod.yml
DB/JWT/mock-iot=환경변수참조(기본값 포함), show-sql:false, logging=INFO
`demo-data.enabled:true` — 데모/발표용 배포 서버이므로 시드 활성화 (DataInitializer 중복 방지 적용됨). 실제 운영 환경에서는 `false`로 전환하여 시드 데이터 적재 방지
JWT: `access-expiration:${JWT_ACCESS_EXP:1800000}`, `refresh-expiration:${JWT_REFRESH_EXP:604800000}`
mock-iot: `base-url:${MOCK_IOT_URL:http://mock-iot:8000}`

### .env.example
`DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, MOCK_IOT_URL`

### 프론트엔드 .env.local
`NEXT_PUBLIC_API_URL=/api` (브라우저노출용) | `INTERNAL_BACKEND_URL=http://backend:8080` (서버사이드전용,브라우저비노출)
⚠️ `NEXT_PUBLIC_`=브라우저노출→비밀키절대금지. JWT=httpOnly쿠키로 BFF서버사이드에서만 처리

## 5. Docker Compose
```yaml
services:
  frontend: build:./frontend, ports:3111:3000, env:[NEXT_PUBLIC_API_URL=/api, INTERNAL_BACKEND_URL=http://backend:8080]
  backend: build:./backend, ports미노출(BFF전용), env:[SPRING_PROFILES_ACTIVE=dev, DB_*, JWT_SECRET, MOCK_IOT_URL], depends_on:db(healthy)
  db: postgres:16-alpine, POSTGRES_DB:coliving, volume:postgres-data, healthcheck:pg_isready, ports미노출(내부전용)
  mock-iot: wiremock/wiremock:3.5.4, volume:./mock-iot/mappings, ports미노출
volumes: postgres-data
```

## 6. 프론트엔드 설정

### 6.0 API 경로 역할 분담 (api-specification.md 와의 관계)
- **`api-specification.md`:** 백엔드의 1:1 대응되는 실제 엔드포인트 **`/api/...`** 만 정의한다.
- **프론트엔드:** 브라우저·클라이언트는 백엔드와 완전히 동일하게 **`/api/...`** 경로를 직접 호출한다.
- **`02-frontend-architecture.md` §3:** 클라이언트에서 백엔드 호스트 호스트를 직접 적어 `fetch` 하면 규칙 위반. 선행 도메인 없이 `/api/...` 를 찌른다.

### next.config.ts
images.remotePatterns: localhost:8080 | output:'standalone'

### API 프록시 (middleware.ts)
클라이언트의 `/api/...` 호출 → Middleware가 가로채어 Spring **`INTERNAL_BACKEND_URL/api/...`** 로 포워딩. httpOnly쿠키에서 access_token을 추출해 `Authorization: Bearer` 헤더 추가. 내부 통신.

### 공통타입
```typescript
interface ApiResponse<T> { success:boolean; data:T|null; message:string|null; error_code?:string }
```

### fetch래퍼 (api.ts)
`apiFetch<T>(path, options)` → `BASE_URL${path}` + credentials:'include'(httpOnly쿠키자동전달) → ApiResponse<T> 반환, 실패시 ApiError throw

## 7. 백엔드 공통처리

### 7.1 ApiResponse<T>
`ok(data)`, `ok(data,message)`, `error(ErrorCode)` | 성공:`{success:true,data:{...}}` | 실패:`{success:false,message:"...",error_code:"..."}`

### 7.2 GlobalExceptionHandler
BusinessException→ErrorCode정의값 | MethodArgumentNotValid→400 | AccessDenied→403 | MethodNotSupported→405 | 기타→500

### 7.3 ErrorCode (주요)
**인증:** INVALID_CREDENTIALS(401), ACCOUNT_DEACTIVATED(401), INVALID_PASSWORD(401), TOKEN_EXPIRED(401), FORBIDDEN(403), SAME_PASSWORD(400), DUPLICATE_LOGIN_ID(409), ACCOUNT_NOT_FOUND(404), EMAIL_SEND_FAILED(500), TOO_MANY_REQUESTS(429)
**계약:** ACTIVE_CONTRACT_EXISTS(409), UNPAID_PAYMENT_EXISTS(409), SPACE_NOT_AVAILABLE(409), APPLICATION_EXISTS(409), NO_ACTIVE_CONTRACT(409), TIME_SLOT_CONFLICT(409), INVALID_STATUS(409)
**기기:** DEVICE_OFFLINE(422), DEVICE_INACTIVE(422), SPACE_MISMATCH(403), NO_ACTIVE_RESERVATION(403), CCTV_ADMIN_ONLY(403), IOT_COMMUNICATION_FAIL(502), CONTROL_LOG_EXISTS(409), DEVICE_ACTIVE(409)
**공통:** VALIDATION_ERROR(400), NOT_FOUND(404)

### 7.4 CORS
`/api/**` → allowedOrigins:localhost:3000, methods:GET/POST/PUT/PATCH/DELETE, credentials:true

### 7.5 BaseEntity
`@MappedSuperclass` + `@EntityListeners(AuditingEntityListener)` | `createdAt(OffsetDateTime), updatedAt, deletedAt` — ERD TIMESTAMPTZ매핑

### 7.6 Entity 작성 철칙
```java
@Entity @Table(name="users", uniqueConstraints={@UniqueConstraint(columnNames="login_id")})
@SQLDelete(sql="UPDATE users SET deleted_at=CURRENT_TIMESTAMP WHERE user_id=?")
@Where(clause="deleted_at IS NULL") // Hibernate6.3+: @SQLRestriction
@Check(constraints="length(phone)>=10")
public class User extends BaseEntity { ... }
```

## 8. 로깅 및 보안

### 8.1 접근제어
permitAll: POST auth/(register,login,refresh,find-id,reset-password), GET rooms/**, swagger
hasRole(ADMIN): /api/admin/**
hasAnyRole(RESIDENT,ADMIN): /api/devices/**, facilities/**, reservations/**, control-logs/**
authenticated: 그외 /api/**

### 8.2 JWT 인증흐름
요청→CorrelationIdFilter(UUID추적ID,MDC)→JwtAuthFilter(토큰검증→SecurityContext)→Controller
**JWT Payload(RESIDENT):** `{sub:"1", role:"RESIDENT", contract_id:5, space_id:3, exp, iat}`

### 8.3 요청추적
UUID `X-Correlation-Id` → SLF4J MDC → 모든로그+CONTROL_LOG.correlation_id

### 8.4 MockIoT
RestTemplate→MockIoT HTTP POST. 명령JSON전달→SUCCESS/FAILURE반환. `mock-iot.base-url`설정. 실제IoT교체시 이 클래스만 수정

---

## 9. 생성 파일 목록

### 9.1 공통 (3개)

| # | 파일 | 역할 |
|---|---|---|
| 1 | `.gitattributes` | 줄바꿈 통일 |
| 2 | `.env.example` | 환경변수 템플릿 |
| 3 | `docker-compose.yml` | 컨테이너 구성 |

### 9.2 백엔드 (24개)

| # | 파일 | 역할 |
|---|---|---|
| 4 | `backend/build.gradle` | 의존성 |
| 5 | `backend/settings.gradle` | 프로젝트명 |
| 6 | `backend/Dockerfile` | 컨테이너 빌드 |
| 7 | `backend/.gitignore` | 빌드 산출물 제외 |
| 8 | `backend/gradle/wrapper/gradle-wrapper.properties` | Wrapper 버전 |
| 9 | `CoLivingApplication.java` | 메인 클래스 |
| 10 | `application.yml` | 공통 설정 |
| 11 | `application-dev.yml` | 개발 설정 |
| 12 | `application-prod.yml` | 운영 설정 |
| 13 | `SecurityConfig.java` | 보안 설정 |
| 14 | `JpaConfig.java` | JPA 감사 |
| 15 | `WebConfig.java` | CORS |
| 16 | `SwaggerConfig.java` | API 문서 |
| 17 | `JwtTokenProvider.java` | JWT 생성/검증 |
| 18 | `JwtAuthenticationFilter.java` | 요청별 토큰 검증 |
| 19 | `CustomUserDetailsService.java` | 사용자 조회 |
| 20 | `ErrorCode.java` | 에러 코드 Enum |
| 21 | `BusinessException.java` | 비즈니스 예외 |
| 22 | `GlobalExceptionHandler.java` | 전역 예외 처리 |
| 23 | `ApiResponse.java` | 통일 응답 포맷 |
| 24 | `BaseEntity.java` | 공통 엔터티 |
| 25 | `CorrelationIdFilter.java` | 요청 추적 |
| 26 | `MockIotClient.java` | Mock IoT 연동 |
| 27 | `CoLivingApplicationTest.java` | 기동 테스트 |

### 9.3 프론트엔드 (12개)

| # | 파일 | 역할 |
|---|---|---|
| 28 | `frontend/package.json` | 의존성 및 스크립트 |
| 29 | `frontend/tsconfig.json` | TypeScript 설정 |
| 30 | `frontend/next.config.ts` | Next.js 설정 |
| 31 | `frontend/Dockerfile` | 컨테이너 빌드 (multi-stage) |
| 32 | `frontend/.gitignore` | 빌드 산출물 제외 |
| 33 | `frontend/.env.local.example` | 환경변수 템플릿 |
| 34 | `frontend/src/app/layout.tsx` | 루트 레이아웃 |
| 35 | `frontend/src/app/page.tsx` | 랜딩(리다이렉트) 페이지 |
| 36 | `frontend/src/app/globals.css` | 전역 스타일 (CSS 변수) |
| 37 | `frontend/src/middleware.ts` | 프록시 미들웨어 (JWT 쿠키 → 헤더) |
| 38 | `frontend/src/lib/api.ts` | API fetch 래퍼 |
| 39 | `frontend/src/types/api.ts` | `ApiResponse<T>` 공통 타입 |
