# 📊 PortFlux 프로젝트 발표 자료

---

## 🎯 프로젝트 개요

**PortFlux**는 PDF 기반 학습 자료 및 전문 콘텐츠를 공유하고 거래하는 통합 플랫폼입니다.

**개발 기간**: 2024년 (진행 중)
**팀 구성**: Full-stack 개발
**기술 스택**: React + Spring Boot + Oracle DB

---

## 📌 핵심 주제 3가지

---

# 1️⃣ **AI 기반 자료 거래 마켓플레이스**

## 🎓 학습 자료 공유 및 판매 플랫폼

### 주요 기능
- **PDF/PPT 파일 업로드 및 미리보기**
  - 첫 페이지 무료 열람, 나머지 블러 처리
  - 구매 후 전체 내용 열람 가능

- **AI 기반 콘텐츠 분석**
  - OpenAI API를 활용한 PDF 텍스트 추출
  - 자동 요약 및 문서 분석
  - 문서 유형 감지 (학술, 비즈니스 등)

- **태그 기반 검색 시스템**
  - 카테고리별 분류
  - 조회수, 다운로드 수 추적
  - 가격별 필터링

### 기술 구현
```java
// AI 서비스 통합
@Service
public class PdfAiService {
    private final OpenAI openAI;

    public String summarizePdf(String pdfText) {
        // OpenAI API 호출로 문서 요약
        return openAI.chat()
            .complete("Summarize: " + pdfText);
    }
}
```

### 비즈니스 모델
- 개인/기업이 자료를 업로드하고 가격 책정
- 구매자는 장바구니에 담아 일괄 결제
- 구매 이력 관리 및 다운로드 제한

---

# 2️⃣ **완전한 전자상거래 결제 시스템**

## 💳 장바구니부터 결제까지 풀 스택 구현

### 주요 기능

#### A. 장바구니 시스템
- 여러 상품을 장바구니에 추가
- 중복 방지 (이미 구매한 상품 차단)
- 실시간 가격 계산

#### B. 주문 관리
- Merchant UID 기반 주문 추적
- 주문 상태 관리 (CREATED → PAID → COMPLETED)
- 주문 내역 조회 및 영수증

#### C. 결제 게이트웨이 통합
- **포트원(아임포트)** 연동
- 다양한 결제 수단 지원
  - 신용카드
  - 카카오페이
  - 토스페이, 네이버페이, 페이코
- 웹훅을 통한 결제 검증

### 결제 플로우
```
1. 사용자: 장바구니 담기
   ↓
2. 시스템: 주문 생성 (ORDERS 테이블)
   ↓
3. 사용자: 결제 수단 선택
   ↓
4. 포트원: 결제 처리
   ↓
5. 백엔드: 결제 검증 (웹훅 + 클라이언트 확인)
   ↓
6. DB: 주문 상태 PAID 업데이트
   ↓
7. 프론트: 구매 확인 → 블러 해제
```

### 보안 기능
- **이중 검증**: 웹훅 + 클라이언트 콜백
- **금액 대조**: 주문 금액 vs 실제 결제 금액 비교
- **중복 결제 방지**: imp_uid, merchant_uid unique 제약
- **본인 확인**: JWT 토큰 기반 사용자 인증

### 데이터베이스 설계
```sql
-- 주문 테이블
ORDERS (id, user_id, merchant_uid, total_amount, status)

-- 주문 상품 테이블
ORDER_ITEMS (id, order_id, product_id, unit_price, qty)

-- 결제 기록 테이블
PAYMENTS (id, order_id, imp_uid, merchant_uid, amount, status)
```

---

# 3️⃣ **소셜 네트워킹 & 실시간 커뮤니케이션**

## 👥 커뮤니티 중심의 사용자 경험

### A. 소셜 기능

#### 1. 팔로우 시스템
- 사용자 간 팔로우/언팔로우
- 팔로워 수 추적
- 팔로우한 사용자의 게시글 피드

#### 2. 좋아요 & 북마크
- 게시글/댓글 좋아요
- 관심 게시글 저장 (북마크)
- 좋아요 수 기반 인기 게시물 정렬

#### 3. 댓글 시스템
- 중첩 댓글 (대댓글) 지원
- 댓글 작성자 확인
- 댓글 삭제 권한 관리

#### 4. 사용자 프로필
- 프로필 이미지 & 배너 커스터마이징
- 닉네임 중복 검사
- 작성한 게시글/저장한 게시글 조회
- 팔로워/팔로잉 관리

### B. 실시간 채팅 (Socket.io)

#### 기능
- **1:1 다이렉트 메시징**
  - 실시간 메시지 송수신
  - 읽음/안읽음 상태 표시
  - 파일 첨부 및 공유

#### 기술 구현
```javascript
// Socket.io 클라이언트
socket.on('receiveMessage', (message) => {
  setMessages(prev => [...prev, message]);
  updateUnreadCount(chatRoomId);
});

socket.emit('sendMessage', {
  roomId: chatRoomId,
  content: messageText,
  senderId: currentUser.id
});
```

#### 채팅방 관리
- 중복 채팅방 방지 (사용자 ID 정렬)
- 메시지 영구 저장
- 안읽은 메시지 카운터
- 채팅방 목록 조회

### C. 다양한 게시판

#### 1. 둘러보기 게시판 (Lookup Board)
- PDF 자료 거래 마켓플레이스
- 가격별 필터링
- 구매 이력 기반 블러 처리

#### 2. 채용 게시판 (Job Board)
- 기업 회원 전용 채용 공고 등록
- 필터링 옵션:
  - 지역, 경력, 학력, 연봉, 산업군
- 마감일 관리

#### 3. 자유 게시판 (Free Board)
- 일반 사용자 토론 및 공유
- 파일 첨부 기능

#### 4. 공지사항 (Notice Board)
- 관리자 전용 공지

### D. 회원 유형

#### 1. 일반 사용자 (USERS)
- 개인 학습자/구매자
- 자료 구매 및 판매
- 커뮤니티 참여

#### 2. 기업 회원 (COMPANY)
- 채용 공고 등록
- 기업 전용 자료 공유
- 둘러보기 기능 (구매 없이 자료 확인)

#### 3. 관리자 (ADMIN)
- 전체 콘텐츠 관리
- 사용자 관리
- 공지사항 작성

---

## 🛠️ 기술 스택 상세

### Frontend
```json
{
  "framework": "React 18.3.1",
  "build": "Vite 7.2.4",
  "routing": "React Router DOM 7.9.6",
  "http": "Axios",
  "realtime": "Socket.io Client 4.8.1",
  "ui": "Lucide React"
}
```

### Backend
```java
// Spring Boot 3.5.8
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
    implementation 'org.springframework.ai:spring-ai-openai'
    implementation 'com.oracle.database.jdbc:ojdbc11:23.3.0.23.09'
    implementation 'com.github.iamport:iamport-rest-client-java:0.2.23'
    implementation 'org.apache.pdfbox:pdfbox:2.0.30'
    implementation 'org.apache.poi:poi-ooxml:5.2.3'
}
```

### Database
- **Oracle Database 11g XE**
- **MyBatis XML 매핑** + **JPA 엔티티**
- 주요 테이블: USERS, COMPANY, POST, ORDERS, PAYMENTS, CHAT_MESSAGES

---

## 📊 시스템 아키텍처

```
┌─────────────────┐
│   React SPA     │  ← 사용자 인터페이스
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP/REST API
         │ WebSocket (Socket.io)
┌────────▼────────┐
│  Spring Boot    │  ← 비즈니스 로직
│   (Port 8080)   │
└────────┬────────┘
         │ JDBC/MyBatis/JPA
┌────────▼────────┐
│  Oracle DB      │  ← 데이터 저장
│   (Port 1521)   │
└─────────────────┘

┌─────────────────┐
│  External APIs  │
├─────────────────┤
│ • 포트원 결제    │
│ • OpenAI API    │
│ • Google OAuth  │
└─────────────────┘
```

---

## 💡 핵심 기술적 도전과제 및 해결

### 1. 블러 처리 & 구매 검증
**문제**: 결제 후에도 블러가 풀리지 않음
**원인**: Order 상태가 DB에 저장되지 않음
**해결**:
```java
// PaymentService.java
order.setStatus("PAID");
orderService.updateOrderStatus(order); // ✅ DB 저장 활성화
```

### 2. 중복 결제 방지
**문제**: 웹훅과 클라이언트 콜백 동시 호출 시 중복 저장
**해결**:
```java
// imp_uid 우선 체크
PaymentRecord existing = paymentRepository.findByImpUid(impUid);
if (existing != null) return existing;

// DB 제약 조건 추가
@Column(unique = true, nullable = false)
private String impUid;
```

### 3. 파일 미리보기 최적화
**문제**: PDF/PPT 전체 로딩으로 속도 저하
**해결**:
- Apache PDFBox로 페이지별 이미지 변환
- 첫 페이지만 미리 로드
- 나머지는 Lazy Loading

### 4. 실시간 채팅 읽음 상태
**문제**: 읽음 상태 동기화
**해결**:
```javascript
// 양방향 메시지 저장 (발신자, 수신자)
// read_status 컬럼으로 읽음 여부 추적
socket.on('messageRead', ({ messageId }) => {
  updateReadStatus(messageId);
});
```

---

## 📈 프로젝트 성과

### 구현 완료 기능
- ✅ 회원가입/로그인 (JWT + OAuth)
- ✅ PDF/PPT 업로드 및 미리보기
- ✅ AI 기반 문서 요약
- ✅ 장바구니 → 주문 → 결제 전체 플로우
- ✅ 포트원 결제 연동 (카드, 카카오페이)
- ✅ 실시간 1:1 채팅
- ✅ 팔로우/좋아요/댓글 시스템
- ✅ 채용 공고 게시판
- ✅ 사용자/기업 회원 관리

### 코드 통계
- Frontend: ~30개 페이지, ~50개 컴포넌트
- Backend: ~20개 Controller, ~25개 Service
- Database: ~20개 테이블

---

## 🚀 향후 계획

### 단기 목표
1. **결제 시스템 안정화**
   - 중복 결제 완전 차단
   - 환불 기능 구현

2. **AI 기능 강화**
   - 문서 품질 평가
   - 자동 태그 추천
   - 유사 문서 추천

3. **UX/UI 개선**
   - 반응형 디자인 완성
   - 로딩 속도 최적화
   - 다크 모드 지원

### 장기 목표
1. **모바일 앱 개발**
   - React Native로 크로스플랫폼 앱 제작

2. **결제 수단 확대**
   - 네이버페이, 토스페이 활성화
   - 해외 결제 지원 (PayPal, Stripe)

3. **기업 회원 기능 확대**
   - 기업 대시보드
   - 채용 지원자 관리
   - 자료 다운로드 통계

4. **커뮤니티 기능 강화**
   - 그룹 채팅
   - 멘토링 매칭
   - 스터디 그룹 생성

---

## 🎓 배운 점 & 경험

### 기술적 성장
- **Full-Stack 개발 경험**: React + Spring Boot 통합
- **결제 시스템 구현**: 실제 PG사 연동 경험
- **실시간 통신**: Socket.io 활용
- **AI API 통합**: OpenAI API 실전 활용
- **복잡한 DB 설계**: 정규화와 성능 균형

### 문제 해결 능력
- 트랜잭션 관리 및 동시성 제어
- RESTful API 설계 원칙
- 보안 취약점 대응 (XSS, CSRF, SQL Injection)
- 파일 업로드 최적화

### 협업 & 프로젝트 관리
- Git을 통한 버전 관리
- 이슈 트래킹 및 디버깅
- 코드 리뷰 및 리팩토링

---

## 📞 프로젝트 정보

**프로젝트명**: PortFlux
**유형**: Full-Stack Web Application
**목적**: 학습 자료 공유 및 거래 플랫폼
**주요 기능**: AI 분석, 전자상거래, 소셜 네트워킹

**핵심 주제 3가지**:
1. 🤖 AI 기반 자료 거래 마켓플레이스
2. 💳 완전한 전자상거래 결제 시스템
3. 👥 소셜 네트워킹 & 실시간 커뮤니케이션

**기술 스택**:
- Frontend: React 18 + Vite
- Backend: Spring Boot 3 + Spring Security
- Database: Oracle 11g + MyBatis/JPA
- AI: OpenAI API
- Payment: 포트원(아임포트)
- Real-time: Socket.io

---

## 감사합니다! 🙏

**Q&A 시간**

---
