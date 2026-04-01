# ⚙️ [백엔드] 아키텍처 및 서버 룰 (Spring Boot 3.3)

백엔드 로직 작성 및 기능 구현 시 AI가 항상 기반으로 삼아야 하는 규칙입니다.

### 1. Application Layering (육각형 아키텍처 지향형 패키지)
- 모듈 분리 기준: 철저하게 도메인 중심(예: `admin/contract`, `resident/device`)으로 패키지를 나눕니다. 기술 중심(예: `controllers/`, `services/` 한 곳에 전부 몰아넣기) 구조를 지양합니다.
- 하위 패키지 구조: 각 도메인 내부는 `in` (Controller), `application` (Service, Interface), `out` (Persistence Repository) 레이어로 경계를 두어 외부 의존성을 낮춥니다.

### 2. Global Response Standard (전역 응답 규격 정규화)
- **API 응답 통합:** 클라이언트(Next.js)에게 전달되는 모든 JSON 응답값은 성공과 실패를 막론하고 `ApiResponse<T>` 객체로 통일해야 합니다.
  - `status`: "SUCCESS", "FAIL", "ERROR"
  - `message`: 클라이언트 지향적인 문자열 정보
  - `data`: 실제 데이터(T) 페이로드 또는 Null
- **Global Error Handling:** 각각의 Service 계층 안에서 `try-catch`로 HTTP 응답을 뱉지 않습니다. 도메인 예외를 던지면(`BusinessException`) 전역 계층인 `GlobalExceptionHandler`가 이를 낚아채서 일관된 Error 형태의 `ApiResponse`와 올바른 HTTP Status 코드로 자동 포장해야 합니다.

### 3. Mock IoT Server 연동 (매우 중요)
- 기기 제어 요청을 보낼 때는, 외부 목업 서버인 `http://mock-iot:8080` (도커 컨테이너) 주소로 `RestTemplate` 또는 `WebClient`를 이용해 HTTP 통신을 시도해야 합니다. 백엔드 자체 서버 메모리에 가짜 데이터를 만들거나 제어 상태를 저장하지 않습니다.
- **확장성:** 현시점은 Mock 서버와 통신하지만, 추후 진짜 '삼성 SmartThings API'로 교체될 것을 염두에 두고 반드시 `IotAdapter` 라는 추상 인터페이스를 두고, `MockIotAdapter` 구현체 내부에서만 HTTP 통신 로직을 구현하는 OCP(개방 폐쇄 원칙)를 지킵니다.
- **내결함성(Resilience):** Mock 서버가 느려도 백엔드가 터지지 않도록 Timeout 설정을 반드시 짧게 (예: 5초) 제어합니다.
