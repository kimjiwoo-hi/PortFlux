-- ============================================================
-- 커뮤니티 더미데이터 - PortFlux 프로젝트
-- 작성일: 2026-01-07
-- 설명: 커뮤니티(free) 및 공지사항(notice) 게시판 더미데이터
-- 주의: 기존 둘러보기(lookup) 데이터와 충돌 방지를 위해 수정됨
-- ============================================================

-- ============================================================
-- 1. 추가 사용자 데이터 (user_num 3~5)
-- ============================================================
-- 기존 PortFlux.sql에는 user_num 1, 2만 존재하므로 추가 생성

INSERT INTO USERS (user_id, user_password, user_name, user_phone, user_email, user_nickname, user_level)
VALUES ('user003', 'password789!', '박민수', '010-5555-7777', 'parkms@email.com', '민수코딩', 1);

INSERT INTO USERS (user_id, user_password, user_name, user_phone, user_email, user_nickname, user_level)
VALUES ('user004', 'password321!', '최지은', '010-3333-8888', 'choije@email.com', '지은개발', 2);

INSERT INTO USERS (user_id, user_password, user_name, user_phone, user_email, user_nickname, user_level)
VALUES ('user005', 'password999!', '정관리', '010-9999-0000', 'admin2@portflux.com', '관리자2', 3);

-- ============================================================
-- 2. 커뮤니티 더미데이터 - free (POST_ID 2003~)
-- ============================================================
-- 기존 POST_ID 2001, 2002는 PortFlux.sql에 이미 존재하므로 2003부터 시작

-- [PortFlux 관련 글 4개]
INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2003, 'free', 3, 'PortFlux 첫 이용 후기입니다!',
'안녕하세요, 취준생입니다.

PortFlux에서 포트폴리오 템플릿 구매해서 사용해봤는데요.

[장점]
- 다양한 분야의 포트폴리오 템플릿이 있어요
- AI 요약 기능으로 내용 파악이 빠르더라구요
- 가격도 합리적인 편이에요

[아쉬운 점]
- 미리보기가 더 자세했으면 좋겠어요
- 카테고리가 더 세분화되면 좋을 것 같아요

전체적으로 만족합니다! 포트폴리오 준비하시는 분들께 추천드려요~', 234);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2004, 'free', 4, 'PortFlux 포트폴리오 판매 팁 공유',
'안녕하세요, PortFlux에서 포트폴리오 판매 중인 개발자입니다.

3개월 동안 판매하면서 느낀 점 공유드려요.

1. 제목은 간결하게
   - 15자 제한이 있으니 핵심 키워드 위주로!

2. AI 요약 기능 활용하기
   - PDF 업로드 후 AI 요약 버튼 누르면 자동 생성됩니다

3. 태그 꼼꼼히 달기
   - 관련 기술 태그를 다 넣으면 검색 노출이 올라가요

4. 적정 가격 설정
   - 처음엔 저렴하게 시작해서 반응 보고 조정하세요

도움이 되셨으면 좋겠습니다!', 456);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2005, 'free', 2, '기업회원으로 채용 성공한 후기',
'스타트업 CTO입니다.

PortFlux에서 기업회원으로 채용공고 올리고 프론트엔드 개발자 채용에 성공해서 후기 남깁니다.

[좋았던 점]
1. 포트폴리오를 직접 볼 수 있어서 실력 파악이 쉬웠어요
2. 장바구니에 담아두고 비교 분석이 가능했습니다
3. 채용공고와 포트폴리오가 한 플랫폼에 있어 편리해요

[채용 과정]
1. 관심 분야 포트폴리오 검색
2. 마음에 드는 후보자 저장
3. 채용공고 등록
4. 면접 후 채용 완료!

개발자 채용 고민이시라면 PortFlux 추천드립니다.', 321);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2006, 'free', 1, 'PortFlux AI 요약 기능 진짜 좋네요',
'포트폴리오 올리려고 PDF 업로드했는데
AI 요약 버튼 하나로 내용이 자동 생성되네요!

직접 쓰려면 30분은 걸렸을 텐데
AI가 핵심만 쏙쏙 뽑아줘서 편했습니다.

다들 이 기능 활용해보세요~', 178);

-- [개발자 글 8개] - user_num 1,2,3,4 골고루 분배
INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2007, 'free', 3, 'React 18 Concurrent 기능 정리',
'React 18에서 추가된 Concurrent 기능 정리해봤습니다.

1. useTransition
- 긴급하지 않은 상태 업데이트 표시에 사용
- isPending으로 로딩 상태 관리 가능

const [isPending, startTransition] = useTransition();
startTransition(() => {
  setSearchQuery(input);
});

2. useDeferredValue
- 값의 업데이트를 지연시켜 UI 반응성 향상

const deferredValue = useDeferredValue(value);

3. Suspense for Data Fetching
- 서버 컴포넌트와 함께 사용하면 강력함

실제 프로젝트에 적용해보니 체감 성능이 확실히 좋아졌어요!', 567);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2008, 'free', 4, 'Git Flow vs GitHub Flow 실무 경험',
'팀 프로젝트에서 두 가지 브랜치 전략 모두 써본 경험 공유합니다.

[Git Flow]
- main, develop, feature, release, hotfix 브랜치
- 대규모 프로젝트, 정기 배포에 적합
- 복잡하지만 체계적

[GitHub Flow]
- main + feature 브랜치만 사용
- 빠른 배포, 소규모 팀에 적합
- 단순하고 직관적

우리 팀 결론:
- 스타트업/애자일 → GitHub Flow
- 대기업/안정성 중시 → Git Flow

여러분은 어떤 전략 쓰시나요?', 423);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2009, 'free', 1, '신입 프론트엔드 면접 질문 정리',
'최근 면접 다니면서 받은 질문들 정리합니다.

[기술 질문]
1. Virtual DOM이 뭔가요?
2. useEffect와 useLayoutEffect 차이점
3. React에서 상태 관리 방법
4. TypeScript 사용 이유
5. 웹 성능 최적화 경험

[인성 질문]
1. 협업 중 갈등 해결 경험
2. 새로운 기술 학습 방법
3. 프론트엔드를 선택한 이유

[코딩 테스트]
- 배열 중복 제거
- 디바운스/쓰로틀 구현
- API 호출 후 데이터 렌더링

준비 잘 하시고 좋은 결과 있길 바랍니다!', 892);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2010, 'free', 2, 'TypeScript 유틸리티 타입 정리',
'TypeScript 실무에서 자주 쓰는 유틸리티 타입 정리입니다.

1. Partial<T> - 모든 속성을 optional로
interface User { name: string; age: number; }
type PartialUser = Partial<User>;

2. Required<T> - 모든 속성을 필수로

3. Pick<T, K> - 특정 속성만 선택
type UserName = Pick<User, "name">;

4. Omit<T, K> - 특정 속성 제외
type UserWithoutAge = Omit<User, "age">;

5. Record<K, T> - 키-값 매핑 타입

6. ReturnType<T> - 함수 반환 타입 추출

실무에서 정말 많이 씁니다!
특히 API 응답 타입 정의할 때 유용해요.', 345);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2011, 'free', 3, 'Spring Boot 자주 만나는 에러 해결법',
'Spring Boot 개발하면서 자주 만나는 에러 정리합니다.

1. Whitelabel Error Page
원인: 컨트롤러 매핑 안됨 or 뷰 없음
해결: @RestController 확인, 경로 확인

2. No qualifying bean
원인: 빈 등록 안됨
해결: @Component, @Service 등 어노테이션 확인

3. Failed to configure DataSource
원인: DB 설정 오류
해결: application.properties에서 DB 정보 확인

4. CORS 에러
해결: @CrossOrigin 또는 WebMvcConfigurer 설정

5. 403 Forbidden
원인: Spring Security 설정
해결: SecurityConfig에서 permitAll() 설정

도움이 되셨으면 좋겠습니다!', 678);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2012, 'free', 4, '개발자 번아웃 극복기 (1년차)',
'입사 후 1년차에 심한 번아웃을 겪었습니다.
비슷한 분들께 도움이 될까 싶어 공유해요.

[증상]
- 코딩이 재미없어짐
- 출근 전 심한 스트레스
- 집중력 저하
- 주말에도 쉬는 느낌이 안 남

[극복 방법]
1. 연차 사용해서 완전한 휴식
2. 코딩과 무관한 취미 시작 (저는 등산)
3. 업무 시간 엄격하게 지키기
4. 작은 사이드 프로젝트로 재미 찾기
5. 동료들과 솔직하게 대화

지금은 많이 회복됐어요.
번아웃은 누구에게나 올 수 있으니 자책하지 마세요!', 1234);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2013, 'free', 1, 'VSCode 필수 익스텐션 추천',
'제가 사용하는 VSCode 익스텐션 공유합니다.

[필수]
1. ESLint - 코드 린팅
2. Prettier - 코드 포맷팅
3. GitLens - Git 기능 강화
4. Auto Rename Tag - HTML 태그 자동 수정
5. Bracket Pair Colorizer - 괄호 색상 구분

[프론트엔드]
6. ES7+ React Snippets - React 스니펫
7. Tailwind CSS IntelliSense - Tailwind 자동완성

[백엔드]
8. Spring Boot Extension Pack
9. REST Client - API 테스트

[테마]
10. One Dark Pro - 눈이 편한 다크 테마

다른 추천 있으시면 댓글로 알려주세요!', 567);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (2014, 'free', 2, 'JWT vs Session 인증 비교',
'프로젝트에서 인증 방식 고민하시는 분들을 위해 정리했습니다.

[JWT (JSON Web Token)]
장점:
- 서버 무상태(Stateless) 유지
- 확장성 좋음 (서버 여러 대)
- 모바일 앱에 적합

단점:
- 토큰 탈취 시 만료까지 무효화 어려움
- 토큰 크기가 커서 매 요청 부담

[Session]
장점:
- 서버에서 세션 관리로 보안성 높음
- 즉시 무효화 가능

단점:
- 서버 메모리 사용
- 서버 확장 시 세션 공유 필요 (Redis 등)

결론:
- 보안 중요 → Session + Redis
- 확장성/모바일 → JWT + Refresh Token

둘 다 장단점이 있으니 프로젝트에 맞게 선택하세요!', 456);

-- ============================================================
-- 3. 공지사항 - notice (POST_ID 3001~)
-- ============================================================

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (3001, 'notice', 5, 'PortFlux 커뮤니티 이용 규칙',
'안녕하세요, PortFlux 운영팀입니다.

커뮤니티를 이용하시기 전에 아래 규칙을 꼭 읽어주세요.

[필수 준수 사항]
1. 상호 존중: 다른 회원을 비방하거나 욕설을 사용하지 마세요.
2. 광고 금지: 무분별한 홍보나 스팸성 게시글은 삭제됩니다.
3. 저작권 준수: 타인의 저작물을 무단으로 공유하지 마세요.
4. 개인정보 보호: 본인 및 타인의 개인정보를 게시하지 마세요.

[권장 사항]
- 질문 전 검색을 먼저 해주세요.
- 코드 공유 시 마크다운 코드블록을 활용해주세요.
- 해결된 문제는 해결 방법을 공유해주시면 다른 분들께 도움이 됩니다.

규칙 위반 시 경고 없이 게시글이 삭제될 수 있으며, 반복 시 이용이 제한될 수 있습니다.

감사합니다.', 1523);

INSERT INTO POST (post_id, board_type, user_num, title, content, view_cnt)
VALUES (3002, 'notice', 5, 'PortFlux v2.0 업데이트 안내',
'안녕하세요, PortFlux 운영팀입니다.

PortFlux v2.0 업데이트 내용을 안내드립니다.

[신규 기능]
1. AI 포트폴리오 요약 기능 추가
   - PDF 업로드 시 AI가 자동으로 내용을 분석하여 요약해드립니다.

2. 채용공고 게시판 오픈
   - 기업 회원은 채용공고를 등록할 수 있습니다.
   - 다양한 필터로 원하는 공고를 찾아보세요.

3. 팔로우 기능 추가
   - 관심 있는 크리에이터를 팔로우하고 새 게시글 알림을 받으세요.

4. 장바구니 및 결제 시스템 개선
   - 여러 포트폴리오를 한 번에 구매할 수 있습니다.

[버그 수정]
- 파일 업로드 용량 제한 오류 수정
- 모바일 환경에서의 UI 개선
- 검색 기능 성능 최적화

문의사항은 커뮤니티에 남겨주세요!', 892);

-- ============================================================
-- 4. POST_COMMENT - 커뮤니티 게시글에 대한 댓글
-- ============================================================
-- 기존 lookup 게시글(post_id 10번대)에 대한 댓글은 PortFlux.sql에 이미 존재하므로 제외

-- 커뮤니티 게시글(2001~)에 대한 댓글
INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (2, 2001, '오라클 에러 해결법 감사합니다! 저도 같은 문제 있었어요.');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (1, 2001, '다행이네요! 도움이 되셨다니 기쁩니다~');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (3, 2007, 'React 18 정리 잘 봤습니다! Concurrent 기능 유용하네요.');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (4, 2011, 'Spring Boot 에러 해결법 질문있어요! CORS 에러 계속 나는데요...');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (3, 2011, 'WebMvcConfigurer에서 allowedOrigins 설정해보세요!');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (1, 2009, '면접 질문 정리 감사합니다! 저도 곧 면접인데 참고할게요.');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (4, 2012, '번아웃 극복기 공감되네요... 저도 비슷한 시기 겪고 있어요.');

INSERT INTO POST_COMMENT (user_num, post_id, comment_content)
VALUES (2, 2013, 'VSCode 익스텐션 추천 감사합니다! GitLens 설치했어요.');

-- ============================================================
-- 5. POST_SAVE - 커뮤니티 게시글 저장
-- ============================================================
-- lookup 게시글 저장은 PortFlux.sql에 이미 존재

-- 커뮤니티 게시글(2003~) 저장
INSERT INTO POST_SAVE (user_num, post_id) VALUES (1, 2007);
INSERT INTO POST_SAVE (user_num, post_id) VALUES (2, 2009);
INSERT INTO POST_SAVE (user_num, post_id) VALUES (3, 2010);
INSERT INTO POST_SAVE (user_num, post_id) VALUES (4, 2012);
INSERT INTO POST_SAVE (user_num, post_id) VALUES (1, 2003);
INSERT INTO POST_SAVE (user_num, post_id) VALUES (2, 2004);

-- ============================================================
-- 6. FOLLOWS - 추가 팔로우 관계
-- ============================================================
-- 기존 FOLLOWS 데이터는 PortFlux.sql에 이미 존재하므로 추가만 진행

INSERT INTO FOLLOWS (follower_id, following_id) VALUES (3, 1);
INSERT INTO FOLLOWS (follower_id, following_id) VALUES (3, 2);
INSERT INTO FOLLOWS (follower_id, following_id) VALUES (4, 1);
INSERT INTO FOLLOWS (follower_id, following_id) VALUES (4, 3);
INSERT INTO FOLLOWS (follower_id, following_id) VALUES (1, 4);
INSERT INTO FOLLOWS (follower_id, following_id) VALUES (2, 3);

-- ============================================================
-- 7. DIRECT_CHAT_ROOMS - 추가 채팅방
-- ============================================================

INSERT INTO DIRECT_CHAT_ROOMS (user1_num, user2_num, status) VALUES (3, 4, 'ACTIVE');
INSERT INTO DIRECT_CHAT_ROOMS (user1_num, user2_num, status) VALUES (1, 3, 'ACTIVE');

-- ============================================================
-- 8. CHAT_MESSAGES - 추가 채팅 메시지
-- ============================================================

INSERT INTO CHAT_MESSAGES (room_id, user_num, sender_num, content)
VALUES (2, 4, 3, '포트폴리오 잘 봤어요!');

INSERT INTO CHAT_MESSAGES (room_id, user_num, sender_num, content)
VALUES (3, 3, 1, 'React 글 정말 유익하게 봤습니다!');

-- ============================================================
-- 9. CART - 추가 장바구니 항목
-- ============================================================
-- lookup 게시글에 대한 장바구니 항목 추가

INSERT INTO CART (user_num, post_id) VALUES (3, 11);
INSERT INTO CART (user_num, post_id) VALUES (4, 12);
INSERT INTO CART (user_num, post_id) VALUES (1, 13);

-- ============================================================
-- 10. POST_LIKE - 커뮤니티 게시글 좋아요
-- ============================================================
-- lookup 게시글 좋아요는 PortFlux.sql에 이미 존재

-- 커뮤니티 게시글(2001~) 좋아요 (구문 오류 수정)
INSERT INTO POST_LIKE (user_num, post_id) VALUES (1, 2001);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (2, 2001);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (3, 2007);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (4, 2009);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (1, 2012);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (2, 2012);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (3, 2012);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (4, 2013);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (1, 2003);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (2, 2005);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (3, 2008);
INSERT INTO POST_LIKE (user_num, post_id) VALUES (4, 2014);

-- ============================================================
-- 11. COMMENT_LIKE - 커뮤니티 댓글 좋아요
-- ============================================================
-- 기존 lookup 댓글 좋아요는 PortFlux.sql에 이미 존재

-- 커뮤니티 댓글(comment_id 3~)에 대한 좋아요
-- 주의: comment_id는 자동 생성되므로 실제 DB의 ID를 확인 후 사용해야 함
-- 아래는 예시로 작성 (실제 환경에서는 SELECT로 comment_id 확인 후 사용)

INSERT INTO COMMENT_LIKE (user_num, comment_id) VALUES (1, 3);
INSERT INTO COMMENT_LIKE (user_num, comment_id) VALUES (2, 4);
INSERT INTO COMMENT_LIKE (user_num, comment_id) VALUES (3, 5);
INSERT INTO COMMENT_LIKE (user_num, comment_id) VALUES (4, 6);

COMMIT;

-- ============================================================
-- 데이터 확인 쿼리
-- ============================================================

SELECT 'POST (free)' AS 구분, COUNT(*) AS 개수 FROM POST WHERE board_type = 'free'
UNION ALL
SELECT 'POST (notice)', COUNT(*) FROM POST WHERE board_type = 'notice'
UNION ALL
SELECT 'POST (lookup)', COUNT(*) FROM POST WHERE board_type = 'lookup'
UNION ALL
SELECT 'POST (job)', COUNT(*) FROM POST WHERE board_type = 'job'
UNION ALL
SELECT 'USERS', COUNT(*) FROM USERS
UNION ALL
SELECT 'POST_COMMENT', COUNT(*) FROM POST_COMMENT
UNION ALL
SELECT 'POST_LIKE', COUNT(*) FROM POST_LIKE
UNION ALL
SELECT 'POST_SAVE', COUNT(*) FROM POST_SAVE
UNION ALL
SELECT 'FOLLOWS', COUNT(*) FROM FOLLOWS;
