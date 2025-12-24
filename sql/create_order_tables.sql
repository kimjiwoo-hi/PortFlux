------------------------------------------------------------
-- 주문 관리 테이블 생성
-- PAY 테이블은 실제 결제 정보용으로 유지
-- ORDERS/ORDER_ITEMS는 주문 내역 관리용
------------------------------------------------------------

-- 1. ORDERS 테이블 생성
CREATE TABLE ORDERS (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(20) NOT NULL,
    merchant_uid VARCHAR2(255) NOT NULL,
    total_amount NUMBER(19,2) NOT NULL,
    status VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_orders_merchant_uid UNIQUE (merchant_uid),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES USERS(user_num)
);

-- 2. ORDER_ITEMS 테이블 생성
CREATE TABLE ORDER_ITEMS (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id NUMBER NOT NULL,
    product_id NUMBER(20) NOT NULL,
    product_name VARCHAR2(500) NOT NULL,
    unit_price NUMBER(19,2) NOT NULL,
    qty NUMBER NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES ORDERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES POST(post_id)
);

-- 3. 인덱스 생성 (성능 향상)
CREATE INDEX idx_orders_merchant_uid ON ORDERS(merchant_uid);
CREATE INDEX idx_orders_user_id ON ORDERS(user_id);
CREATE INDEX idx_orders_created_at ON ORDERS(created_at);
CREATE INDEX idx_order_items_order_id ON ORDER_ITEMS(order_id);
CREATE INDEX idx_order_items_product_id ON ORDER_ITEMS(product_id);

-- 4. 주석 추가
COMMENT ON TABLE ORDERS IS '주문 내역 관리 테이블 (PAY는 실제 결제 정보 관리)';
COMMENT ON TABLE ORDER_ITEMS IS '주문 상품 상세 정보';
COMMENT ON COLUMN ORDERS.merchant_uid IS '주문 고유 식별자 (UUID 기반)';
COMMENT ON COLUMN ORDERS.status IS '주문 상태 (CREATED, PENDING, PAID, CANCELLED)';
COMMENT ON COLUMN ORDER_ITEMS.qty IS '주문 수량';

COMMIT;

------------------------------------------------------------
-- 테이블 생성 확인
------------------------------------------------------------
SELECT 'ORDERS 테이블 생성 완료' AS MESSAGE FROM DUAL;
SELECT 'ORDER_ITEMS 테이블 생성 완료' AS MESSAGE FROM DUAL;

-- 테이블 구조 확인
DESC ORDERS;
DESC ORDER_ITEMS;

-- 데이터 개수 확인 (초기에는 0개)
SELECT 'ORDERS' AS 테이블명, COUNT(*) AS 데이터개수 FROM ORDERS
UNION ALL
SELECT 'ORDER_ITEMS', COUNT(*) FROM ORDER_ITEMS;
