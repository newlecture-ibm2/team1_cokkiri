# 🐘 cokkiri | Co-living Platform (ibm_cokkiri)

**co-kkiri**는 입주민과 운영자 모두에게 최상의 경험을 제공하는 **프리미엄 코리빙 관리 플랫폼**입니다. 
세련된 디자인 시스템과 더불어, IoT 연동, 실시간 알림, 커뮤니티 및 VOC 통합 관리 등 최신 기술이 집약된 주거 관리 솔루션을 지향합니다.

---

## ✨ Key Features

### 🏘️ Resident Application
- **Smart Room Control**: 조명, 온도, 보안 등 IoT 기기를 모바일 앱에서 실시간 제어 및 모니터링
- **Community Hub**: 입주민 간 소통을 위한 게시판 및 댓글 시스템 (Rich Text Editor 지원)
- **VOC System**: 불편 사항 접수 및 처리 현황 실시간 조회
- **Real-time Notifications**: SSE 기반의 개인화된 실시간 알림 서비스
- **Facility Reservation**: 공용 공간 및 편의 시설 예약 시스템

### 🛠️ Admin Dashboard
- **High-Density Monitoring**: 입주 현황, 수익성 지표, 시스템 상태를 한눈에 파악하는 대시보드
- **Space Management**: 공간 및 유닛(방) 단위의 계약/배정 관리
- **Contract & Payment**: 전자 계약 관리 및 포트원(PortOne) 연동을 통한 결제 자동화
- **IoT Device Mgmt**: 입주민 기기 상태 모니터링 및 원격 제어 지원
- **Content Moderation**: 커뮤니티 게시물 및 고객의 소리(VOC) 통합 관리

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router), TypeScript
- **UI/Styling**: Vanilla CSS & Tailwind CSS 4.0 (Moss & Aloe Design System)
- **State**: Zustand (Local), React Query (Server)
- **Motion**: Framer Motion (Micro-interactions)
- **Editor**: Quill.js

### Backend
- **Core**: Java 21, Spring Boot 3.3
- **Data**: Spring Data JPA, PostgreSQL, Redis (Caching & Pub/Sub)
- **Messaging**: SSE (Server-Sent Events) for real-time delivery
- **Security**: Spring Security, OAuth2, JWT
- **API**: OpenAPI (Swagger)

### Infrastructure
- **Container**: Docker & Docker Compose
- **IoT Logic**: WebFlux 기반의 Non-blocking IoT 통신 (Mock-IoT 연동)

---

## 🏗️ Architecture Architecture

- **Event-Driven Non-blocking Design**: 메인 비즈니스 로직과 알림 도메인을 이벤트 기반으로 분리하여 트랜잭션 무결성 및 시스템 성능 최적화.
- **Decoupled Notification Layer**: SSE 기능을 독립적으로 관리하여 입주민 앱의 실시간 응답성 확보.
- **BFF (Backend For Frontend) Pattern**: 프론트엔드 최적화를 위한 BFF 레이어 운영으로 복잡한 도메인 데이터 재조합.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Java 21 (JDK)
- Docker & Docker Compose

### Installation & Launch

1. **Repository Clone**
   ```bash
   git clone https://github.com/your-repo/ibm_cokkiri.git
   cd ibm_cokkiri
   ```

2. **Environment Setup**
   - 루트 디렉토리 및 각 모듈(`frontend`, `backend`)의 `.env.example`을 참고하여 `.env` 파일을 생성합니다.

3. **Run with Docker (Total Infrastructure)**
   ```bash
   docker-compose up -d
   ```

4. **Local Development**
   - **Backend**: `./backend/gradlew bootRun`
   - **Frontend**: `cd frontend && npm install && npm run dev`

---

## 🎨 Design Reference
- **Figma Original Design**: [Co-living platform Design](https://www.figma.com/design/TYrOEvCVujXZoTUe1FMl7A/Co-living-platform)
- **Design Theme**: Moss & Aloe (High contrast, Modern typography, Glassmorphism)
