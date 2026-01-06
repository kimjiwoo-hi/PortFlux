-- ========================================
-- PAYMENTS 테이블에 UNIQUE 제약 조건 추가
-- 중복 결제 방지를 위한 DB 레벨 보호
-- ========================================

-- 1. imp_uid에 UNIQUE 제약 추가
-- imp_uid는 포트원(아임포트)에서 부여하는 결제 고유 ID
-- 동일한 imp_uid로 여러 번 저장되는 것을 방지
ALTER TABLE PAYMENTS ADD CONSTRAINT uk_payment_imp_uid UNIQUE (imp_uid);

-- 2. merchant_uid에 UNIQUE 제약 추가
-- merchant_uid는 가맹점 주문 번호
-- 하나의 주문에 대해 하나의 결제만 허용
ALTER TABLE PAYMENTS ADD CONSTRAINT uk_payment_merchant_uid UNIQUE (merchant_uid);

-- ========================================
-- 실행 참고사항:
-- 1. 기존 데이터에 중복이 있으면 제약 조건 추가가 실패합니다.
-- 2. 중복 데이터 확인 쿼리:
--    SELECT imp_uid, COUNT(*) FROM PAYMENTS GROUP BY imp_uid HAVING COUNT(*) > 1;
--    SELECT merchant_uid, COUNT(*) FROM PAYMENTS GROUP BY merchant_uid HAVING COUNT(*) > 1;
-- 3. 중복 데이터가 있다면 먼저 정리 후 제약 조건을 추가하세요.
-- ========================================
