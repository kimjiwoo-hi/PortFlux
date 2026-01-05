-- 'lookup' 게시판을 위한 더미 데이터 (MERGE INTO로 중복 방지)

MERGE INTO POST p
USING (SELECT 'web_programming_team_project.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (10, 'lookup', 1, '웹 프로그래밍 팀 프로젝트', '웹 프로그래밍 팀 프로젝트 발표 자료입니다.', 1200, 'web_programming_team_project.pdf', 15, 3);

MERGE INTO POST p
USING (SELECT 'retro-portfolio.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (11, 'lookup', 2, '레트로 포트폴리오', '개성을 드러내는 레트로 스타일 포트폴리오입니다.', 2500, 'retro-portfolio.pdf', 30, 7);

MERGE INTO POST p
USING (SELECT 'programer-Self_Introduction.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (12, 'lookup', 1, '개발자 자기소개서', '합격률을 높이는 개발자 자기소개서 샘플입니다.', 500, 'programer-Self_Introduction.pdf', 55, 20);

MERGE INTO POST p
USING (SELECT 'gray_symple_ppt.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (13,'lookup', 2, '심플한 회색 PPT', '어디에나 잘 어울리는 심플한 회색 테마의 PPT 템플릿입니다.', 1500, 'gray_symple_ppt.pdf', 25, 6);

MERGE INTO POST p
USING (SELECT '블루 모던 템플릿.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (14, 'lookup', 1, '블루 모던 템플릿', '신뢰감을 주는 블루 모던 스타일의 템플릿입니다.', 1800, '블루 모던 템플릿.pdf', 22, 4);

MERGE INTO POST p
USING (SELECT 'Understanding_AI_at_Work.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (15, 'lookup', 2, '업무에 AI 활용하기', '업무 효율을 높이는 AI 활용법에 대한 자료입니다.', 3000, 'Understanding_AI_at_Work.pdf', 40, 11);

MERGE INTO POST p
USING (SELECT 'The_World_of_Mystery.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (16, 'lookup', 1, '미스터리의 세계', '세계의 불가사의와 미스터리에 대한 흥미로운 이야기입니다.', 1300, 'The_World_of_Mystery.pdf', 18, 5);

MERGE INTO POST p
USING (SELECT 'Strategic_Content_Marketing_Presentation.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (17,'lookup', 2, '전략적 콘텐츠 마케팅', '성공적인 비즈니스를 위한 전략적 콘텐츠 마케팅 프레젠테이션입니다.', 2800, 'Strategic_Content_Marketing_Presentation.pdf', 35, 9);

MERGE INTO POST p
USING (SELECT 'Music_Library.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (18,'lookup', 1, '음악 라이브러리', '저작권 걱정 없는 다양한 음악 라이브러리 목록입니다.', 900, 'Music_Library.pdf', 14, 3);

MERGE INTO POST p
USING (SELECT 'Kings_of_Wrestling.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (19, 'lookup', 2, '레슬링의 제왕', '프로 레슬링의 역사와 위대한 선수들에 대한 자료입니다.', 1100, 'Kings_of_Wrestling.pdf', 16, 2);

MERGE INTO POST p
USING (SELECT 'Fall-themed_Presentations.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (20, 'lookup', 1, '가을 테마 프레젠테이션', '분위기 있는 가을 테마 프레젠테이션 템플릿입니다.', 1600, 'Fall-themed_Presentations.pdf', 28, 8);

MERGE INTO POST p
USING (SELECT 'Cyber_Security.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (21, 'lookup', 2, '사이버 보안', '개인과 기업을 위한 사이버 보안 심층 분석 자료입니다.', 3200, 'Cyber_Security.pdf', 45, 15);

MERGE INTO POST p
USING (SELECT 'Coffee_Presentation.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (22, 'lookup', 1, '커피 프레젠테이션', '커피의 역사와 종류, 추출 방법에 대한 모든 것을 담았습니다.', 1700, 'Coffee_Presentation.pdf', 29, 7);

MERGE INTO POST p
USING (SELECT 'Coding_Plan.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (23, 'lookup', 2, '코딩 계획', '성공적인 코딩 학습을 위한 구체적인 계획서 샘플입니다.', 600, 'Coding_Plan.pdf', 60, 25);

MERGE INTO POST p
USING (SELECT 'AI_literacy_education.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (24, 'lookup', 1, 'AI 리터러시 교육', '인공지능 시대를 살아가는 모두를 위한 AI 리터러시 교육 자료입니다.', 2900, 'AI_literacy_education.pdf', 38, 12);

MERGE INTO POST p
USING (SELECT 'upload.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (25, 'lookup', 2, '업로드 자료 1', '업로드된 문서 자료입니다.', 700, 'upload.pdf', 5, 1);

MERGE INTO POST p
USING (SELECT 'upload2.pdf' AS post_file FROM dual) d
ON (p.post_file = d.post_file AND p.board_type = 'lookup')
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (26, 'lookup', 1, '업로드 자료 2', '업로드된 문서 자료입니다.', 700, 'upload2.pdf', 5, 1);