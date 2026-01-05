-- 'lookup' 게시판 더미 데이터 (post_id 기준 MERGE: 재실행 안전)

MERGE INTO POST p
USING (
  SELECT
    10 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '웹 프로그래밍 팀 프로젝트' AS title,
    '웹 프로그래밍 팀 프로젝트 발표 자료입니다.' AS content,
    1200 AS price,
    'web_programming_team_project.pdf' AS post_file,
    15 AS view_cnt, 3 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    11 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '레트로 포트폴리오' AS title,
    '개성을 드러내는 레트로 스타일 포트폴리오입니다.' AS content,
    2500 AS price,
    'retro-portfolio.pdf' AS post_file,
    30 AS view_cnt, 7 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    12 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '개발자 자기소개서' AS title,
    '합격률을 높이는 개발자 자기소개서 샘플입니다.' AS content,
    500 AS price,
    'programer-Self_Introduction.pdf' AS post_file,
    55 AS view_cnt, 20 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    13 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '심플한 회색 PPT' AS title,
    '어디에나 잘 어울리는 심플한 회색 테마의 PPT 템플릿입니다.' AS content,
    1500 AS price,
    'gray_symple_ppt.pdf' AS post_file,
    25 AS view_cnt, 6 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    14 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '블루 모던 템플릿' AS title,
    '신뢰감을 주는 블루 모던 스타일의 템플릿입니다.' AS content,
    1800 AS price,
    '블루 모던 템플릿.pdf' AS post_file,
    22 AS view_cnt, 4 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    15 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '업무에 AI 활용하기' AS title,
    '업무 효율을 높이는 AI 활용법에 대한 자료입니다.' AS content,
    3000 AS price,
    'Understanding_AI_at_Work.pdf' AS post_file,
    40 AS view_cnt, 11 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    16 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '미스터리의 세계' AS title,
    '세계의 불가사의와 미스터리에 대한 흥미로운 이야기입니다.' AS content,
    1300 AS price,
    'The_World_of_Mystery.pdf' AS post_file,
    18 AS view_cnt, 5 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    17 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '전략적 콘텐츠 마케팅' AS title,
    '성공적인 비즈니스를 위한 전략적 콘텐츠 마케팅 프레젠테이션입니다.' AS content,
    2800 AS price,
    'Strategic_Content_Marketing_Presentation.pdf' AS post_file,
    35 AS view_cnt, 9 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    18 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '음악 라이브러리' AS title,
    '저작권 걱정 없는 다양한 음악 라이브러리 목록입니다.' AS content,
    900 AS price,
    'Music_Library.pdf' AS post_file,
    14 AS view_cnt, 3 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    19 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '레슬링의 제왕' AS title,
    '프로 레슬링의 역사와 위대한 선수들에 대한 자료입니다.' AS content,
    1100 AS price,
    'Kings_of_Wrestling.pdf' AS post_file,
    16 AS view_cnt, 2 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    20 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '가을 테마 프레젠테이션' AS title,
    '분위기 있는 가을 테마 프레젠테이션 템플릿입니다.' AS content,
    1600 AS price,
    'Fall-themed_Presentations.pdf' AS post_file,
    28 AS view_cnt, 8 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    21 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '사이버 보안' AS title,
    '개인과 기업을 위한 사이버 보안 심층 분석 자료입니다.' AS content,
    3200 AS price,
    'Cyber_Security.pdf' AS post_file,
    45 AS view_cnt, 15 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    22 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '커피 프레젠테이션' AS title,
    '커피의 역사와 종류, 추출 방법에 대한 모든 것을 담았습니다.' AS content,
    1700 AS price,
    'Coffee_Presentation.pdf' AS post_file,
    29 AS view_cnt, 7 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    23 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '코딩 계획' AS title,
    '성공적인 코딩 학습을 위한 구체적인 계획서 샘플입니다.' AS content,
    600 AS price,
    'Coding_Plan.pdf' AS post_file,
    60 AS view_cnt, 25 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    24 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    'AI 리터러시 교육' AS title,
    '인공지능 시대를 살아가는 모두를 위한 AI 리터러시 교육 자료입니다.' AS content,
    2900 AS price,
    'AI_literacy_education.pdf' AS post_file,
    38 AS view_cnt, 12 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    25 AS post_id, 'lookup' AS board_type, 2 AS user_num,
    '업로드 자료 1' AS title,
    '업로드된 문서 자료입니다.' AS content,
    700 AS price,
    'upload.pdf' AS post_file,
    5 AS view_cnt, 1 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);

MERGE INTO POST p
USING (
  SELECT
    26 AS post_id, 'lookup' AS board_type, 1 AS user_num,
    '업로드 자료 2' AS title,
    '업로드된 문서 자료입니다.' AS content,
    700 AS price,
    'upload2.pdf' AS post_file,
    5 AS view_cnt, 1 AS download_cnt
  FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt
WHEN NOT MATCHED THEN
  INSERT (post_id, board_type, user_num, title, content, price, post_file, view_cnt, download_cnt)
  VALUES (d.post_id, d.board_type, d.user_num, d.title, d.content, d.price, d.post_file, d.view_cnt, d.download_cnt);
