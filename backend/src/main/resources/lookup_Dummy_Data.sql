MERGE INTO POST p
USING (
    SELECT 10 post_id, 'lookup' board_type, 1 user_num,
           '웹 프로그래밍 팀 프로젝트' title,
           '웹 프로그래밍 팀 프로젝트 발표 자료입니다.' content,
           3000 price,
           'web_programming_team_project.pdf' post_file,
           15 view_cnt, 3 download_cnt,
           '["웹","프로젝트","발표"]' tags
    FROM dual

    UNION ALL
    SELECT 11, 'lookup', 2,
           '레트로 포트폴리오',
           '개성을 드러내는 레트로 스타일 포트폴리오입니다.',
           4500,
           'retro-portfolio.pdf',
           30, 7,
           '["포트폴리오","디자인","레트로"]'
    FROM dual

    UNION ALL
    SELECT 12, 'lookup', 1,
           '개발자 자기소개서',
           '합격률을 높이는 개발자 자기소개서 샘플입니다.',
           2000,
           'programer-Self_Introduction.pdf',
           55, 20,
           '["자기소개서","개발자","취업"]'
    FROM dual

    UNION ALL
    SELECT 13, 'lookup', 2,
           '심플한 회색 PPT',
           '어디에나 잘 어울리는 심플한 회색 테마 PPT입니다.',
           2500,
           'gray_symple_ppt.pdf',
           25, 6,
           '["PPT","디자인","심플"]'
    FROM dual

    UNION ALL
    SELECT 14, 'lookup', 1,
           '블루 모던 템플릿',
           '신뢰감을 주는 블루 모던 스타일 템플릿입니다.',
           3500,
           'blue_modern_template.pdf',
           22, 4,
           '["PPT","비즈니스","블루"]'
    FROM dual

    UNION ALL
    SELECT 15, 'lookup', 2,
           '업무에 AI 활용하기',
           '업무 효율을 높이는 AI 활용 자료입니다.',
           5000,
           'Understanding_AI_at_Work.pdf',
           40, 11,
           '["AI","업무","자동화"]'
    FROM dual

    UNION ALL
    SELECT 16, 'lookup', 1,
           '미스터리의 세계',
           '세계의 불가사의와 미스터리에 대한 이야기입니다.',
           1500,
           'The_World_of_Mystery.pdf',
           18, 5,
           '["미스터리","인문","스토리"]'
    FROM dual

    UNION ALL
    SELECT 17, 'lookup', 2,
           '전략적 콘텐츠 마케팅',
           '콘텐츠 마케팅 전략 프레젠테이션입니다.',
           4000,
           'Strategic_Content_Marketing_Presentation.pdf',
           35, 9,
           '["마케팅","콘텐츠","전략"]'
    FROM dual

    UNION ALL
    SELECT 18, 'lookup', 1,
           '음악 라이브러리',
           '저작권 걱정 없는 음악 라이브러리입니다.',
           1000,
           'Music_Library.pdf',
           14, 3,
           '["음악","라이브러리","저작권"]'
    FROM dual

    UNION ALL
    SELECT 19, 'lookup', 2,
           '레슬링의 제왕',
           '프로 레슬링의 역사 자료입니다.',
           1500,
           'Kings_of_Wrestling.pdf',
           16, 2,
           '["스포츠","레슬링","역사"]'
    FROM dual

    UNION ALL
    SELECT 20, 'lookup', 1,
           '가을 테마 프레젠테이션',
           '분위기 있는 가을 테마 PPT입니다.',
           3000,
           'Fall-themed_Presentations.pdf',
           28, 8,
           '["PPT","가을","테마"]'
    FROM dual

    UNION ALL
    SELECT 21, 'lookup', 2,
           '사이버 보안',
           '개인과 기업을 위한 사이버 보안 자료입니다.',
           5000,
           'Cyber_Security.pdf',
           45, 15,
           '["보안","해킹","IT"]'
    FROM dual

    UNION ALL
    SELECT 22, 'lookup', 1,
           '커피 프레젠테이션',
           '커피의 역사와 추출 방법 자료입니다.',
           2000,
           'Coffee_Presentation.pdf',
           29, 7,
           '["커피","프레젠테이션","라이프"]'
    FROM dual

    UNION ALL
    SELECT 23, 'lookup', 2,
           '코딩 계획',
           '성공적인 코딩 학습 계획서입니다.',
           1500,
           'Coding_Plan.pdf',
           60, 25,
           '["코딩","학습","계획"]'
    FROM dual

    UNION ALL
    SELECT 24, 'lookup', 1,
           'AI 리터러시 교육',
           'AI 시대를 위한 기초 교육 자료입니다.',
           4500,
           'AI_literacy_education.pdf',
           38, 12,
           '["AI","교육","리터러시"]'
    FROM dual

    UNION ALL
    SELECT 25, 'lookup', 2,
           '업로드 자료 1',
           '업로드된 문서 자료입니다.',
           1000,
           'upload.pdf',
           5, 1,
           '["자료","문서","업로드"]'
    FROM dual

    UNION ALL
    SELECT 26, 'lookup', 1,
           '업로드 자료 2',
           '업로드된 문서 자료입니다.',
           1000,
           'upload2.pdf',
           5, 1,
           '["자료","문서","업로드"]'
    FROM dual
) d
ON (p.post_id = d.post_id)
WHEN MATCHED THEN
  UPDATE SET
    p.board_type   = d.board_type,
    p.user_num     = d.user_num,
    p.company_num  = NULL,
    p.title        = d.title,
    p.content      = d.content,
    p.price        = d.price,
    p.post_file    = d.post_file,
    p.view_cnt     = d.view_cnt,
    p.download_cnt = d.download_cnt,
    p.tags         = d.tags
WHEN NOT MATCHED THEN
  INSERT (
    post_id, board_type, user_num, company_num,
    title, content, price, post_file,
    view_cnt, download_cnt, tags
  )
  VALUES (
    d.post_id, d.board_type, d.user_num, NULL,
    d.title, d.content, d.price, d.post_file,
    d.view_cnt, d.download_cnt, d.tags
  );
