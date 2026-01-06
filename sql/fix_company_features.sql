-- ============================================================
-- 기업 회원(COMPANY) 기능 지원을 위한 DB 수정
-- 작성일: 2026-01-06
-- 설명: 기업 회원이 게시글 등록, 좋아요, 저장, 댓글, 장바구니, 팔로우 기능을
--       사용할 수 있도록 외래키 제약조건 제거
-- ============================================================

-- 0) POST - user_num 외래키 제거 (기업회원도 게시글 등록 가능하도록) ★ 중요 ★
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE POST DROP CONSTRAINT fk_post_user';
    DBMS_OUTPUT.PUT_LINE('POST fk_post_user 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('POST fk_post_user 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('POST 오류: ' || SQLERRM);
        END IF;
END;
/

-- 1) POST_SAVE - user_num 외래키 제거 (기업회원도 저장 가능하도록)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE POST_SAVE DROP CONSTRAINT fk_save_user';
    DBMS_OUTPUT.PUT_LINE('POST_SAVE fk_save_user 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('POST_SAVE fk_save_user 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('POST_SAVE 오류: ' || SQLERRM);
        END IF;
END;
/

-- 2) COMMENT_LIKE - user_num 외래키 제거 (기업회원도 댓글 좋아요 가능하도록)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE COMMENT_LIKE DROP CONSTRAINT fk_commentlike_user';
    DBMS_OUTPUT.PUT_LINE('COMMENT_LIKE fk_commentlike_user 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('COMMENT_LIKE fk_commentlike_user 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('COMMENT_LIKE 오류: ' || SQLERRM);
        END IF;
END;
/

-- 3) POST_LIKE - user_num 외래키 제거 (기업회원도 좋아요 가능하도록)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE POST_LIKE DROP CONSTRAINT fk_postlike_user';
    DBMS_OUTPUT.PUT_LINE('POST_LIKE fk_postlike_user 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('POST_LIKE fk_postlike_user 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('POST_LIKE 오류: ' || SQLERRM);
        END IF;
END;
/

-- 4) POST_COMMENT - user_num 외래키 제거 (기업회원도 댓글 가능하도록)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE POST_COMMENT DROP CONSTRAINT fk_comment_user';
    DBMS_OUTPUT.PUT_LINE('POST_COMMENT fk_comment_user 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('POST_COMMENT fk_comment_user 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('POST_COMMENT 오류: ' || SQLERRM);
        END IF;
END;
/

-- 5) FOLLOWS - follower_id, following_id 외래키 제거 (기업회원도 팔로우 가능하도록)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE FOLLOWS DROP CONSTRAINT fk_follows_follower';
    DBMS_OUTPUT.PUT_LINE('FOLLOWS fk_follows_follower 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('FOLLOWS fk_follows_follower 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('FOLLOWS 오류: ' || SQLERRM);
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE FOLLOWS DROP CONSTRAINT fk_follows_following';
    DBMS_OUTPUT.PUT_LINE('FOLLOWS fk_follows_following 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('FOLLOWS fk_follows_following 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('FOLLOWS 오류: ' || SQLERRM);
        END IF;
END;
/

-- 6) CART - user_num 외래키 제거 (기업회원도 장바구니 가능하도록)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE CART DROP CONSTRAINT fk_cart_user';
    DBMS_OUTPUT.PUT_LINE('CART fk_cart_user 제약조건이 제거되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2443 THEN
            DBMS_OUTPUT.PUT_LINE('CART fk_cart_user 제약조건이 이미 존재하지 않습니다.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('CART 오류: ' || SQLERRM);
        END IF;
END;
/

COMMIT;

-- 제약조건 확인
SELECT 'Remaining FK Constraints:' AS info FROM DUAL;
SELECT table_name, constraint_name, constraint_type
FROM user_constraints
WHERE table_name IN ('POST_LIKE', 'POST_SAVE', 'POST_COMMENT', 'FOLLOWS', 'COMMENT_LIKE', 'CART')
AND constraint_type = 'R'
ORDER BY table_name;

SELECT '기업 회원 기능 지원을 위한 제약조건 제거 완료!' AS result FROM DUAL;
