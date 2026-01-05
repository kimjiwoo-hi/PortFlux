INSERT INTO POST (
    board_type,
    user_num,
    title,
    content,
    created_at,
    updated_at,
    view_cnt,
    price,
    ai_summary,
    download_cnt,
    post_file,
    tags
) VALUES (
    'lookup',
    1,
    '브랜드 아이덴티티에 대한 고찰',
    '이 문서는 파란배경의 모던한 느낌을 주는 템플릿 입니다',
    SYSDATE,
    SYSDATE,
    0,
    5000,
    '',
    0,
    '블루 모던 템플릿.pdf',
    '["모던","미니멀","UI/UX 디자이너"]'
);
