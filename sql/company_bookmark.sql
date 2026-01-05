-- ============================================================
-- POST_SAVE 테이블 마이그레이션 (기업 회원 북마크 지원)
-- 작성일: 2026-01-05
-- 설명: POST_SAVE 테이블에 company_num 컬럼 추가하여
--       일반 사용자와 기업 회원 모두 북마크 가능하도록 수정
-- ============================================================

-- 1단계: company_num 컬럼 추가
ALTER TABLE POST_SAVE ADD (
    company_num NUMBER(20)
);

-- 2단계: COMPANY 테이블 참조 외래키 추가
ALTER TABLE POST_SAVE ADD CONSTRAINT fk_save_company
    FOREIGN KEY (company_num) REFERENCES COMPANY(company_num) ON DELETE CASCADE;

-- 3단계: 기존 NOT NULL 제약조건 제거 (user_num)
ALTER TABLE POST_SAVE MODIFY user_num NUMBER(20) NULL;

-- 4단계: user_num과 company_num 중 하나는 반드시 있어야 함 체크 제약조건 추가
ALTER TABLE POST_SAVE ADD CONSTRAINT ck_save_author
    CHECK (user_num IS NOT NULL OR company_num IS NOT NULL);

-- 5단계: 중복 북마크 방지를 위한 유니크 인덱스 추가
-- Oracle에서는 함수 기반 인덱스를 사용하여 부분 유니크 제약 구현

-- 기존 인덱스가 있으면 삭제
BEGIN
    FOR idx IN (SELECT index_name FROM user_indexes
                WHERE table_name = 'POST_SAVE'
                AND index_name IN ('IDX_POST_SAVE_USER_UNIQUE', 'IDX_POST_SAVE_COMPANY_UNIQUE'))
    LOOP
        EXECUTE IMMEDIATE 'DROP INDEX ' || idx.index_name;
    END LOOP;
END;
/

-- user_num이 있는 경우의 유니크 인덱스 (함수 기반)
CREATE UNIQUE INDEX idx_post_save_user_unique
    ON POST_SAVE(
        CASE WHEN user_num IS NOT NULL THEN user_num END,
        CASE WHEN user_num IS NOT NULL THEN post_id END
    );

-- company_num이 있는 경우의 유니크 인덱스 (함수 기반)
CREATE UNIQUE INDEX idx_post_save_company_unique
    ON POST_SAVE(
        CASE WHEN company_num IS NOT NULL THEN company_num END,
        CASE WHEN company_num IS NOT NULL THEN post_id END
    );

COMMIT;

-- ============================================================
-- 변경사항 확인
-- ============================================================
SELECT
    column_name,
    data_type,
    nullable,
    data_default
FROM user_tab_columns
WHERE table_name = 'POST_SAVE'
ORDER BY column_id;

-- 제약조건 확인
SELECT
    constraint_name,
    constraint_type,
    search_condition
FROM user_constraints
WHERE table_name = 'POST_SAVE';

-- 인덱스 확인
SELECT
    index_name,
    uniqueness,
    index_type
FROM user_indexes
WHERE table_name = 'POST_SAVE';

COMMIT;
