-- ============================================================
-- 잘못 생성된 인덱스 정리 스크립트
-- 작성일: 2026-01-05
-- 설명: WHERE 절 문법 오류로 생성 실패한 인덱스 정리
-- ============================================================

-- POST_SAVE 테이블의 모든 유니크 인덱스 조회 및 삭제
BEGIN
    FOR idx IN (SELECT index_name FROM user_indexes
                WHERE table_name = 'POST_SAVE'
                AND (index_name LIKE '%UNIQUE%' OR uniqueness = 'UNIQUE'))
    LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP INDEX ' || idx.index_name;
            DBMS_OUTPUT.PUT_LINE('삭제됨: ' || idx.index_name);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('삭제 실패: ' || idx.index_name || ' - ' || SQLERRM);
        END;
    END LOOP;
END;
/

-- 현재 POST_SAVE 테이블의 인덱스 확인
SELECT
    index_name,
    uniqueness,
    index_type,
    status
FROM user_indexes
WHERE table_name = 'POST_SAVE';

COMMIT;
