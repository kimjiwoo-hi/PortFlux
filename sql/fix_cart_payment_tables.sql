-- ============================================================
-- 장바구니 및 결제 테이블 수정 스크립트
-- 작성일: 2026-01-04
-- 목적: PAY 테이블 제거, ORDERS/PAYMENTS 통합 사용, 제약조건 개선
-- ============================================================

-- ============================================================
-- 1단계: PAY 테이블 제거 (옵션 A)
-- ============================================================

-- PAY 테이블 삭제 (CASCADE로 FK 제약조건도 함께 삭제)
DROP TABLE PAY CASCADE CONSTRAINTS;

COMMIT;

-- ============================================================
-- 2단계: ORDERS 테이블 제약조건 개선
-- ============================================================

-- 2-1. ORDERS 외래키 수정 (CASCADE → SET NULL)
-- 회원 탈퇴 시 주문 기록은 보존 (전자상거래법 5년 보관 의무)
ALTER TABLE ORDERS DROP CONSTRAINT fk_orders_user;

ALTER TABLE ORDERS ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES USERS(user_num) ON DELETE SET NULL;

-- 2-2. ORDERS 금액 CHECK 제약조건 추가 (음수 방지)
ALTER TABLE ORDERS ADD CONSTRAINT ck_orders_total_amount_positive
    CHECK (total_amount > 0);

-- 2-3. ORDERS 상태 값 제약조건 추가
ALTER TABLE ORDERS ADD CONSTRAINT ck_orders_status
    CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'));

COMMIT;

-- ============================================================
-- 3단계: ORDER_ITEMS 테이블 제약조건 개선
-- ============================================================

-- 3-1. ORDER_ITEMS 수량 CHECK 제약조건 추가 (0 이하 방지)
ALTER TABLE ORDER_ITEMS ADD CONSTRAINT ck_order_items_qty_positive
    CHECK (qty > 0);

-- 3-2. ORDER_ITEMS 단가 CHECK 제약조건 추가 (음수 방지)
ALTER TABLE ORDER_ITEMS ADD CONSTRAINT ck_order_items_unit_price_nonnegative
    CHECK (unit_price >= 0);

COMMIT;

-- ============================================================
-- 4단계: PAYMENTS 테이블 존재 여부 확인 및 수정
-- ============================================================

-- PAYMENTS 테이블이 존재하는 경우에만 실행
DECLARE
    v_table_exists NUMBER;
BEGIN
    -- PAYMENTS 테이블 존재 여부 확인
    SELECT COUNT(*)
    INTO v_table_exists
    FROM user_tables
    WHERE table_name = 'PAYMENT_RECORD';

    -- PAYMENT_RECORD 테이블이 존재하면 merchant_uid 제거
    IF v_table_exists > 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE PAYMENT_RECORD DROP COLUMN merchant_uid';
        DBMS_OUTPUT.PUT_LINE('PAYMENT_RECORD 테이블에서 merchant_uid 컬럼 제거 완료');
    ELSE
        DBMS_OUTPUT.PUT_LINE('PAYMENT_RECORD 테이블이 존재하지 않습니다. 스킵합니다.');
    END IF;
END;
/

COMMIT;

-- ============================================================
-- 5단계: CART 테이블 UNIQUE 제약조건 추가
-- ============================================================

-- 동일 사용자가 동일 상품을 장바구니에 중복 추가 방지
ALTER TABLE CART ADD CONSTRAINT uq_cart_user_post
    UNIQUE (user_num, post_id);

COMMIT;

-- ============================================================
-- 6단계: 인덱스 최적화
-- ============================================================

-- 6-1. 중복 인덱스 제거 (merchant_uid는 이미 UNIQUE 제약으로 인덱스 생성됨)
DECLARE
    v_index_exists NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_index_exists
    FROM user_indexes
    WHERE index_name = 'IDX_ORDERS_MERCHANT_UID';

    IF v_index_exists > 0 THEN
        EXECUTE IMMEDIATE 'DROP INDEX idx_orders_merchant_uid';
        DBMS_OUTPUT.PUT_LINE('중복 인덱스 idx_orders_merchant_uid 제거 완료');
    END IF;
END;
/

-- 6-2. CART 테이블 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_cart_user_num ON CART(user_num);
CREATE INDEX idx_cart_created_at ON CART(created_at);

COMMIT;

-- ============================================================
-- 7단계: 테이블 코멘트 추가 (문서화)
-- ============================================================

COMMENT ON TABLE CART IS '장바구니 테이블';
COMMENT ON COLUMN CART.cart_id IS '장바구니 항목 고유번호';
COMMENT ON COLUMN CART.user_num IS '사용자 번호 (FK to USERS)';
COMMENT ON COLUMN CART.post_id IS '상품 번호 (FK to POST)';
COMMENT ON COLUMN CART.created_at IS '장바구니 담은 시간';

COMMENT ON TABLE ORDERS IS '주문 테이블 (장바구니 기반 주문)';
COMMENT ON COLUMN ORDERS.id IS '주문 고유번호';
COMMENT ON COLUMN ORDERS.user_id IS '주문자 번호 (FK to USERS, 탈퇴 시 NULL)';
COMMENT ON COLUMN ORDERS.merchant_uid IS '가맹점 주문번호 (포트원 연동용, UNIQUE)';
COMMENT ON COLUMN ORDERS.total_amount IS '총 주문 금액';
COMMENT ON COLUMN ORDERS.status IS '주문 상태 (PENDING, PAID, CANCELLED, REFUNDED)';
COMMENT ON COLUMN ORDERS.created_at IS '주문 생성 시간';

COMMENT ON TABLE ORDER_ITEMS IS '주문 상품 상세 테이블';
COMMENT ON COLUMN ORDER_ITEMS.id IS '주문 상품 고유번호';
COMMENT ON COLUMN ORDER_ITEMS.order_id IS '주문 번호 (FK to ORDERS)';
COMMENT ON COLUMN ORDER_ITEMS.product_id IS '상품 번호 (FK to POST)';
COMMENT ON COLUMN ORDER_ITEMS.product_name IS '주문 당시 상품명 (스냅샷)';
COMMENT ON COLUMN ORDER_ITEMS.unit_price IS '주문 당시 단가 (스냅샷)';
COMMENT ON COLUMN ORDER_ITEMS.qty IS '주문 수량';

COMMIT;

-- ============================================================
-- 8단계: 제약조건 검증 쿼리
-- ============================================================

-- 장바구니/결제 관련 테이블의 제약조건 확인
SELECT
    table_name AS "테이블명",
    constraint_name AS "제약조건명",
    constraint_type AS "타입",
    search_condition AS "조건"
FROM user_constraints
WHERE table_name IN ('CART', 'ORDERS', 'ORDER_ITEMS')
ORDER BY table_name, constraint_type;

-- 인덱스 확인
SELECT
    table_name AS "테이블명",
    index_name AS "인덱스명",
    uniqueness AS "고유성"
FROM user_indexes
WHERE table_name IN ('CART', 'ORDERS', 'ORDER_ITEMS')
ORDER BY table_name;

COMMIT;

-- ============================================================
-- 완료 메시지
-- ============================================================

BEGIN
    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('장바구니 및 결제 테이블 수정 완료!');
    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('1. PAY 테이블 제거 완료');
    DBMS_OUTPUT.PUT_LINE('2. ORDERS FK 수정 (CASCADE → SET NULL)');
    DBMS_OUTPUT.PUT_LINE('3. ORDERS/ORDER_ITEMS CHECK 제약조건 추가');
    DBMS_OUTPUT.PUT_LINE('4. CART UNIQUE 제약조건 추가');
    DBMS_OUTPUT.PUT_LINE('5. 인덱스 최적화 완료');
    DBMS_OUTPUT.PUT_LINE('6. 테이블 코멘트 추가 완료');
    DBMS_OUTPUT.PUT_LINE('========================================');
END;
/
