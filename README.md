<img width="453" height="171" alt="PortFlux_logo_background" src="https://github.com/user-attachments/assets/bc41a304-33ba-460c-8541-a8477d60f185" />

# 📁 포트폴리오를 사고파는 SNS형 마켓플레이스 + 채용공고 플랫폼 (PortFlux)

- 사용자는 다른 개발자들이 취업·이직 준비 과정에서 어떤 기술 스택을 활용하고, 어떤 프로젝트를 구현했는지 참고할 수 있습니다.

- 양질의 포트폴리오 자료는 결제를 통해 구매할 수 있으며, 커뮤니티 게시판을 통해 개발자 간 정보 공유가 가능합니다.

- 또한 기업 회원이 등록한 채용 공고를 확인하여 취업 기회를 탐색할 수 있습니다.

## 📅 프로젝트 기간

- 2025년 11월 18일 ~ 2026년 1월 9일

## 🙋 팀 소개

| 프로필 | <img height="200" src="https://github.com/user-attachments/assets/761f4776-1d5b-4af2-af34-7d54c5d4e316" /> | <img height="200" src="https://github.com/user-attachments/assets/59800ac5-cafa-4530-a510-5e935eba152f" /> | <img height="200" src="https://github.com/user-attachments/assets/a01bf328-9e92-4aa0-8009-aa8878448c14" /> |
| :---: | :---: | :---: | :---: |
| | <img width="200" height="1"> | <img width="200" height="1"> | <img width="200" height="1"> |
| 이름 | **(팀장)김상훈** | **김동후** | **김지우** |
| GitHub | [@sanghunKim-964](https://github.com/sanghunKim-964) | [@donghoo80](https://github.com/donghoo80) | [@kimjiwoo-hi](https://github.com/kimjiwoo-hi) |
| 이메일 | kim199603330@gmail.com | rlaehdgn80@gmail.com | rlawldn1015@gmail.com |
| 역할 | 팔로우, 팔로워 | 로그인, 회원가입<br>커뮤니티 게시판 | 둘러보기 게시판 |

| 프로필 | <img height="200" src="https://github.com/user-attachments/assets/bd83f747-61ad-4bb9-b601-32d7ed1553d3" /> | <img height="200" src="https://github.com/user-attachments/assets/a9366efc-a88d-4b87-a027-28d11da4d559" /> | <img height="200" src="https://github.com/user-attachments/assets/b0c4ec36-fcd7-4cca-ad2c-2b3d173834c4" /> |
| :---: | :---: | :---: | :---: |
| | <img width="200" height="1"> | <img width="200" height="1"> | <img width="200" height="1"> |
| 이름 | **양재명** | **최현규** | **홍성훈** |
| GitHub | [@toyj903](https://github.com/toyj903) | [@FillDDak](https://github.com/FillDDak) | [@HoRivest](https://github.com/HoRivest) |
| 이메일 | toyj903@naver.com | cgr456@naver.com | ghdtjdgns536@gmail.com |
| 역할 | 장바구니, 결제 | 마이페이지<br>PPT 제작 | 채용 게시판 |

---

# 📋 목차

- [프로젝트 구성](#-프로젝트-구성)
- [기술 스택 및 버전](#-기술-스택-및-버전)
- [주요 기능](#-주요-기능)
- [시스템 요구사항](#-시스템-요구사항)
- [설치 및 실행 방법](#-설치-및-실행-방법)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [문제 해결](#-문제-해결)
- [개발 가이드](#-개발-가이드)
- [발표 PPT 이미지](#-발표-ppt-이미지)

---

## 💻 프로젝트 구성

### 📌 Database ERD

<img width="2063" height="2258" alt="PortFlux_ERD" src="https://github.com/user-attachments/assets/4efe5048-991d-4d94-850f-2bc4be24b3ed" />

---

## 🛠 기술 스택 및 버전

### Frontend
- **React** 18.3.1
- **Vite** 7.2.4
- **React Router DOM** 7.9.6
- **Axios** 1.13.2
- **HTML + CSS + JavaScript**
- **Node.js** 24.11.1
- **npm** 11.6.2

### Backend
- **Java** 17.0.9
- **Spring Boot** 3.5.8
- **Spring Security** (JWT 인증)
- **Spring Data JPA** / **MyBatis** 3.0.3
- **Spring AI** (OpenAI 연동)

### Database
- **Oracle Database 18c** (ojdbc11)

### 주요 라이브러리
- **PDF 처리**: Apache PDFBox 2.0.30
- **결제**: 아임포트 REST Client 0.2.23
- **이메일**: Spring Boot Mail
- **OAuth**: Google OAuth 2.0

### 기타 툴
- **VS Code**
- **SQL Developer** 21.4.3
- **Git**
- **GitHub**
- **Sourcetree**
- **Notion**
- **Figma**

---

## ✨ 주요 기능

### 1. 자료 관리
- 포트폴리오 PDF 파일 업로드 및 미리보기
- 태그 기반 검색 및 필터링
- 조회수 및 다운로드 통계

### 2. 거래 시스템
- 장바구니 기능
- 주문 및 결제 내역 관리
- 아임포트 결제 연동 (신용카드 or 카카오페이)

### 3. 소셜 기능
- 게시물 좋아요 및 댓글
- 사용자 팔로우

### 4. AI 기능
- OpenAI를 활용한 자료 요약

### 5. 채용 게시판
- 구인 구직 기능

### 6. 인증 및 보안
- JWT 기반 인증
- Google OAuth 2.0 로그인
- Spring Security 통합

---

## 💻 시스템 요구사항

### 필수 소프트웨어

| 소프트웨어 | 버전 | 다운로드 링크 |
|-----------|------|--------------|
| **Java JDK** | 17 이상 | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) |
| **Node.js** | 24 이상 | [Node.js](https://nodejs.org/) |
| **Oracle Database** | 11g XE 이상 | [Oracle Database XE](https://www.oracle.com/database/technologies/xe-downloads.html) |
| **Git** | 최신 버전 | [Git](https://git-scm.com/) |

### 권장 환경
- **OS**: Windows 10/11, macOS
- **디스크**: 2GB 이상 여유 공간

---

## 🚀 설치 및 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/PortFlux.git
cd PortFlux
```

---

### 2. 데이터베이스 설정

#### 2.1 Oracle Database 설치 및 계정 생성

1. Oracle Database 11g XE 이상 설치
2. SQL Developer 또는 SQL*Plus 실행
3. PortFlux\sql\계정_생성.sql 전체 스크립트 실행:

```sql
-- 관리자 계정으로 로그인 후

-- 1. 스크립트 실행 모드 활성화 
-- 일반 사용자(C## 접두어 없는 계정) 생성을 가능하게 설정합니다.
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- 2. 사용자(jh) 생성 및 비밀번호 설정
-- 아이디: jh, 비밀번호: 12345
CREATE USER jh IDENTIFIED BY 12345;

-- 3. 기본 시스템 권한 부여
-- CONNECT: 데이터베이스 접속 권한
-- RESOURCE: 테이블, 인덱스 등의 리소스 생성 권한
GRANT CONNECT, RESOURCE TO jh;

-- 4. 추가 개체 생성 권한 부여
-- 뷰(View), 시퀀스(Sequence), 프로시저(Procedure)를 생성할 수 있는 권한을 줍니다.
GRANT CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO jh;

-- 5. 테이블스페이스 할당량 설정
-- jh 사용자가 USERS 테이블스페이스에서 용량 제한 없이 데이터를 사용할 수 있도록 설정합니다.
ALTER USER jh DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- 6. (선택사항) 사용자 삭제
-- 계정을 삭제해야 할 때 주석을 해제하고 실행합니다.
-- DROP USER jh CASCADE;
```

#### 2.2 새 접속 생성

1. SQL Developer에서 새 접속... 버튼 클릭
2. Name에 JH 작성
3. 사용자 이름에 jh, 비밀번호에 12345 작성
4. 테스트 버튼 클릭 후 성공 시 접속 버튼 클릭
5. 새로 만든 JH 접속으로 선택

#### 2.3 테이블 생성

1. `sql/PortFlux.sql` 파일을 SQL Developer에서 열기
2. **스크립트 전체 실행** (F5 또는 "스크립트 실행" 버튼)
3. 다음 테이블들이 생성됩니다:
   - `USERS` - 사용자 정보
   - `POST` - 게시물
   - `COMMENT` - 댓글
   - `CART` - 장바구니
   - `CART_ITEM` - 장바구니 아이템
   - `ORDERS` - 주문
   - `ORDER_ITEMS` - 주문 아이템
   - `POST_LIKE` - 게시물 좋아요
   - `COMMENT_LIKE` - 댓글 좋아요
   - 기타 관계 테이블

#### 2.3 테이블 확인

```sql
-- jh 계정으로 로그인 후
SELECT table_name FROM user_tables;
```

---

### 3. 백엔드 설정 및 실행

#### 3.1 환경 변수 설정

`backend/src/main/resources/application.properties` 파일을 수정하거나 환경변수로 설정:

```properties
# 데이터베이스 설정
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/xe
spring.datasource.username=jh
spring.datasource.password=12345

# 파일 업로드 경로
file.upload-dir=uploads

# JWT 설정 (개발용 - 실제로는 환경변수 사용 권장)
jwt.secret=your-secret-key-here-minimum-256-bits-required

# Google OAuth (선택사항)
google.client.id=your-google-client-id
google.client.secret=your-google-client-secret

# 이메일 설정 (선택사항)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# OpenAI API (선택사항)
# backend/.env 파일에 설정
# OPENAI_API_KEY=your-openai-api-key
```

> ⚠️ **보안 주의**: 실제 배포 시에는 민감한 정보를 환경변수나 외부 설정 파일로 관리하세요.

#### 3.2 백엔드 빌드 및 실행

**Windows:**
```bash
cd backend
.\gradlew clean build
.\gradlew bootRun
```

**macOS/Linux:**
```bash
cd backend
./gradlew clean build
./gradlew bootRun
```

백엔드 서버가 `http://localhost:8080`에서 실행됩니다.

---

### 4. 프론트엔드 설정 및 실행

#### 4.1 의존성 설치

```bash
cd frontend
npm install
```

#### 4.2 개발 서버 실행

```bash
npm run dev
```

프론트엔드 서버가 `http://localhost:5173`에서 실행됩니다.

---

### 5. 실행 확인

1. 브라우저에서 `http://localhost:5173` 접속
2. 회원가입 또는 로그인
3. 자료 업로드 및 검색 테스트

---

## 📁 프로젝트 구조

```
PortFlux/
├── backend/                      # Spring Boot 백엔드
│   ├── src/main/java/com/portflux/backend/
│   │   ├── config/              # 설정 (Security, CORS, WebSocket)
│   │   ├── controller/          # REST API 컨트롤러
│   │   ├── service/             # 비즈니스 로직
│   │   ├── repository/          # JPA Repository
│   │   ├── model/               # Entity 클래스
│   │   ├── security/            # JWT, 인증/인가
│   │   └── BackendApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── mapper/              # MyBatis XML
│   └── build.gradle
│
├── frontend/                     # React 프론트엔드
│   ├── src/
│   │   ├── api/                 # API 호출 함수
│   │   ├── components/          # 재사용 컴포넌트
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── database/            # 태그 데이터 등
│   │   ├── assets/              # 이미지, 아이콘
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── sql/                          # SQL 스크립트
│   └── PortFlux.sql             # 테이블 생성 스크립트
│
├── uploads/                      # 업로드된 파일 (자동 생성)
│
└── README.md                     # 이 파일
```

---

## 🔌 API 문서

### 인증 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | `/api/users/signup` | 회원가입 | ❌ |
| POST | `/api/users/signin` | 로그인 | ❌ |
| GET | `/user/info/{userNum}` | 사용자 정보 조회 | ✅ |
| PUT | `/user/info/{userNum}` | 사용자 정보 수정 | ✅ |

### 게시물 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | `/api/boardlookup/posts` | 게시물 목록 조회 | ❌ |
| GET | `/api/boardlookup/{postId}` | 게시물 상세 조회 | ❌ |
| POST | `/api/boardlookup/upload` | 게시물 작성 | ✅ |
| POST | `/api/boardlookup/{postId}/like` | 좋아요 토글 | ✅ |
| GET | `/api/boardlookup/{postId}/like/check` | 좋아요 상태 확인 | ✅ |

### 장바구니 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | `/api/cart/{userId}` | 장바구니 조회 | ✅ |
| POST | `/api/cart/{userId}/items` | 장바구니 추가 | ✅ |
| DELETE | `/api/cart/{userId}/items/{itemId}` | 장바구니 삭제 | ✅ |

### 주문 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | `/api/orders` | 주문 생성 | ✅ |
| GET | `/api/orders/user/{userId}` | 주문 내역 조회 | ✅ |
| GET | `/api/payments/result` | 주문 결과 조회 | ❌ |

### 댓글 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | `/api/boardlookup/{postId}/comments` | 댓글 작성 | ✅ |
| DELETE | `/api/boardlookup/comments/{commentId}` | 댓글 삭제 | ✅ |

> 📌 **인증 방식**: JWT Bearer Token을 `Authorization` 헤더에 포함
> ```
> Authorization: Bearer {your-jwt-token}
> ```

---

## 🔧 문제 해결

### 1. 백엔드가 시작되지 않을 때

**증상**: `java.sql.SQLException: ORA-01017: invalid username/password`

**해결**:
```bash
# Oracle DB 연결 정보 확인
# application.properties의 username/password가 올바른지 확인
spring.datasource.username=jh
spring.datasource.password=12345
```

---

### 2. 테이블이 생성되지 않았을 때

**증상**: `ORA-00942: table or view does not exist`

**해결**:
```bash
# sql/PortFlux.sql 파일을 다시 실행
# SQL Developer에서 스크립트 실행 (F5)
```

---

### 3. JWT 토큰이 재시작 시 무효화될 때

**증상**: 서버 재시작 후 모든 사용자가 로그아웃됨

**원인**: JWT 시크릿 키가 매번 랜덤 생성됨

**해결**:
```properties
# application.properties에 고정 키 추가
jwt.secret=your-very-long-secret-key-at-least-256-bits-required-for-hs512-algorithm
```

---

### 4. 파일 업로드 실패

**증상**: `FileNotFoundException` 또는 업로드된 파일이 보이지 않음

**해결**:
```bash
# uploads 폴더 생성
mkdir uploads

# 또는 절대 경로 사용
# application.properties
file.upload-dir=C:/Projects/PortFlux/uploads
```

---

### 5. CORS 오류

**증상**: `Access to XMLHttpRequest has been blocked by CORS policy`

**해결**:
```java
// backend/config/WebConfig.java 확인
.allowedOrigins("http://localhost:5173", "http://localhost:3000")
// 프론트엔드 URL이 포함되어 있는지 확인
```

---

### 6. Oracle Database 연결 실패

**증상**: `The Network Adapter could not establish the connection`

**해결**:
```bash
# 1. Oracle 서비스 실행 확인 (Windows)
services.msc → OracleServiceXE 시작

# 2. 리스너 확인
lsnrctl status

# 3. 포트 확인
netstat -an | findstr 1521
```

---

### 7. 프론트엔드 빌드 오류

**증상**: `Module not found` 또는 의존성 오류

**해결**:
```bash
# node_modules 삭제 후 재설치
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📝 개발 가이드

### 새로운 API 추가하기

1. **Controller 작성**
```java
@RestController
@RequestMapping("/api/example")
public class ExampleController {
    @GetMapping
    public ResponseEntity<?> getExample() {
        return ResponseEntity.ok("Example");
    }
}
```

2. **SecurityConfig에 권한 설정**
```java
.requestMatchers("/api/example/**").permitAll()
// 또는
.requestMatchers("/api/example/**").authenticated()
```

3. **프론트엔드에서 호출**
```javascript
import axios from 'axios';

const response = await axios.get('/api/example', {
  withCredentials: true,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📽️ 발표 PPT 이미지

<img width="4000" height="2250" alt="PPT(2차PPT_JH)_1" src="https://github.com/user-attachments/assets/e3e2007a-c367-49bc-9772-8d1ba40c4f8c" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_2" src="https://github.com/user-attachments/assets/89b20b35-1c24-44ad-863b-1542d637f5ca" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_3" src="https://github.com/user-attachments/assets/40ee8e2e-0c42-4833-8fc6-d90c1b2ac59f" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_4" src="https://github.com/user-attachments/assets/b2a4cd90-976a-40a9-8418-94c359039b22" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_5" src="https://github.com/user-attachments/assets/affadf11-2fb5-4bc6-84db-6114605cf685" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_6" src="https://github.com/user-attachments/assets/01cd297f-03bf-4ff5-8169-e07897c067b8" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_7" src="https://github.com/user-attachments/assets/3edc24e3-3524-40fe-8357-3c563d9a31f0" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_8" src="https://github.com/user-attachments/assets/43e10cfa-d4de-4100-b71b-8bb48d7ab1a9" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_9" src="https://github.com/user-attachments/assets/585475e6-53e3-4d02-8719-1518f087d8d1" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_10" src="https://github.com/user-attachments/assets/0235a0a1-7ee7-4c64-a5cf-e09c1aaf1c15" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_11" src="https://github.com/user-attachments/assets/e8b872ec-ee8c-48b3-82e5-bef9980794da" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_12" src="https://github.com/user-attachments/assets/640f7eb4-6bf5-4c3f-8fe9-a5b6f8251839" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_13" src="https://github.com/user-attachments/assets/c27fd936-df8b-4dff-b1f9-601cadf442fa" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_14" src="https://github.com/user-attachments/assets/7383e17d-a989-4079-a99e-29f5f147b4c5" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_15" src="https://github.com/user-attachments/assets/1babc839-5f13-4842-919c-c23e2af0bb26" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_16" src="https://github.com/user-attachments/assets/af16e7df-38b1-478c-8b49-8b8cdd6aadb9" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_17" src="https://github.com/user-attachments/assets/0fed5690-8727-449f-ae59-baef4e29f187" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_18" src="https://github.com/user-attachments/assets/736e019e-cfce-4359-8a4a-66cc5a4f038a" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_19" src="https://github.com/user-attachments/assets/0cbaf0bb-0cd5-4d61-a260-64439af892e6" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_20" src="https://github.com/user-attachments/assets/033c3586-526e-4262-aa27-cc0ae7469fc7" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_21" src="https://github.com/user-attachments/assets/ae33c83b-d581-4d18-948d-4077529df010" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_22" src="https://github.com/user-attachments/assets/cdf2081a-dde2-4bc0-8828-469122dbba9d" />
<img width="4000" height="2250" alt="PPT(2차PPT_JH)_23" src="https://github.com/user-attachments/assets/4b3b591e-5811-4ef1-8908-48dbd2195357" />

---

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 Issue를 생성해주세요.

---

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**
