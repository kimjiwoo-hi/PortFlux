-- ============================================================
-- POST_SAVE 유니크 인덱스만 생성 (함수 기반)
-- 작성일: 2026-01-05
-- 설명: 이미 컬럼이 추가된 경우 인덱스만 생성
-- ============================================================

-- 기존 인덱스가 있으면 삭제
BEGIN
    FOR idx IN (SELECT index_name FROM user_indexes
                WHERE table_name = 'POST_SAVE'
                AND index_name IN ('IDX_POST_SAVE_USER_UNIQUE', 'IDX_POST_SAVE_COMPANY_UNIQUE'))
    LOOP
        EXECUTE IMMEDIATE 'DROP INDEX ' || idx.index_name;
        DBMS_OUTPUT.PUT_LINE('삭제됨: ' || idx.index_name);
    END LOOP;
END;
/

-- user_num이 있는 경우의 유니크 인덱스 (함수 기반)
CREATE UNIQUE INDEX idx_post_save_user_unique
    ON POST_SAVE(
        CASE WHEN user_num IS NOT NULL THEN user_num END,
        CASE WHEN user_num IS NOT NULL THEN post_id END
    );

DBMS_OUTPUT.PUT_LINE('생성됨: idx_post_save_user_unique');

-- company_num이 있는 경우의 유니크 인덱스 (함수 기반)
CREATE UNIQUE INDEX idx_post_save_company_unique
    ON POST_SAVE(
        CASE WHEN company_num IS NOT NULL THEN company_num END,
        CASE WHEN company_num IS NOT NULL THEN post_id END
    );

DBMS_OUTPUT.PUT_LINE('생성됨: idx_post_save_company_unique');

-- 인덱스 확인
SELECT
    index_name,
    uniqueness,
    index_type,
    status
FROM user_indexes
WHERE table_name = 'POST_SAVE';

COMMIT;
