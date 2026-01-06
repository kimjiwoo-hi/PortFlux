# 🔍 블러가 풀리지 않는 문제 디버깅 체크리스트

## ✅ 이미 수정 완료된 사항

1. ✅ **PaymentService.java** - `orderService.updateOrderStatus(order)` 활성화
2. ✅ **PaymentService.java** - imp_uid 우선 중복 체크 추가
3. ✅ **PaymentRecord.java** - unique 제약 조건 추가
4. ✅ **SQL 파일** - 테이블 이름 수정 (PAYMENT_RECORD → PAYMENTS)

---

## 🧪 테스트가 필요한 사항

### 1️⃣ **백엔드 서버 재시작 필요**

```bash
cd backend
./gradlew bootRun
```

**중요:** 코드를 수정했으므로 백엔드를 반드시 재시작해야 합니다!

---

### 2️⃣ **DB 상태 확인**

#### A. 결제 후 ORDERS 테이블 상태 확인
```sql
-- 최근 주문 조회
SELECT id, user_id, merchant_uid, total_amount, status, created_at
FROM ORDERS
ORDER BY created_at DESC
LIMIT 5;
```

**확인사항:** `status`가 'PAID'로 변경되었는지 확인

#### B. ORDER_ITEMS 테이블 확인
```sql
-- 특정 사용자의 구매 내역 확인
SELECT oi.*, o.status, o.user_id
FROM ORDER_ITEMS oi
INNER JOIN ORDERS o ON oi.order_id = o.id
WHERE o.user_id = [사용자번호]
ORDER BY o.created_at DESC;
```

#### C. 구매 확인 쿼리 직접 테스트
```sql
-- BoardLookupMapper.xml의 쿼리와 동일
SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END as is_purchased
FROM ORDER_ITEMS oi
INNER JOIN ORDERS o ON oi.order_id = o.id
WHERE o.user_id = [사용자번호]
  AND oi.product_id = [게시물ID]
  AND o.status = 'PAID';
```

**예상 결과:**
- 구매했으면: `is_purchased = 1`
- 구매 안 했으면: `is_purchased = 0`

---

### 3️⃣ **프론트엔드 확인**

#### A. 브라우저 개발자 도구 - Network 탭
1. 결제 완료 후 게시글 페이지 이동
2. `/api/boardlookup/{postId}/purchased` API 호출 확인
3. Response 확인: `{"isPurchased": true}` 또는 `{"isPurchased": false}`

#### B. 브라우저 콘솔 로그 확인
```javascript
// BoardLookupRead.jsx:175 확인
console.log('구매 상태:', isPurchased);
```

#### C. React 상태 확인
- React DevTools에서 `BoardLookupRead` 컴포넌트의 state 확인
- `isPurchased` 값이 `true`로 변경되었는지 확인

---

### 4️⃣ **백엔드 로그 확인**

터미널에서 다음 로그 확인:

```
=== 구매 상태 확인 요청 ===
postId: [번호]
userNum: [번호]
구매 여부: true/false
========================
```

그리고 결제 완료 시:

```
Payment confirmed successfully: paymentId=[번호], merchantUid=[번호]
```

---

## 🐛 문제가 여전히 발생한다면

### Case 1: `isPurchased`가 계속 `false`인 경우

**원인 가능성:**
1. 백엔드 서버를 재시작하지 않음
2. DB에 `ORDERS.status`가 'CREATED' 상태로 남아있음
3. `ORDER_ITEMS.product_id`와 `postId`가 일치하지 않음
4. `ORDERS.user_id`와 `userNum`이 일치하지 않음

**해결:**
```sql
-- 수동으로 주문 상태 업데이트 (테스트용)
UPDATE ORDERS
SET status = 'PAID'
WHERE merchant_uid = '[주문번호]';
```

---

### Case 2: 결제는 성공하지만 주문 상태가 업데이트 안 됨

**확인사항:**
1. PaymentService의 트랜잭션이 정상적으로 커밋되는지 확인
2. 예외가 발생했는지 로그 확인
3. `orderService.updateOrderStatus()` 호출 여부 확인

---

### Case 3: 중복 주문이 계속 발생

**확인사항:**
1. DB에 unique 제약이 적용되었는지 확인:
```sql
-- H2 DB의 경우
SELECT * FROM INFORMATION_SCHEMA.CONSTRAINTS
WHERE TABLE_NAME = 'PAYMENTS';
```

2. 제약이 없다면 SQL 실행:
```sql
-- backend/src/main/resources/add_payment_unique_constraints.sql 실행
```

---

## 📋 테스트 시나리오

### 정상 플로우:

1. **장바구니에 제품 추가** → 성공
2. **결제 진행** → 포트원 결제 완료
3. **백엔드 로그 확인:**
   - "Payment confirmed successfully" 로그 출력
   - DB `ORDERS.status = 'PAID'` 업데이트
4. **게시글 페이지로 돌아옴:**
   - `visibilitychange` 이벤트 → `checkPurchaseStatus()` 호출
   - API 응답: `{"isPurchased": true}`
   - React state: `isPurchased = true`
   - 블러 제거: `shouldBlur = false`
5. **결과:**
   - 모든 이미지 블러 해제 ✅
   - 사이드바에 다운로드 아이콘 표시 ✅
   - 장바구니 클릭 시 "이미 구매한 상품" 알림 ✅

---

## 🚨 긴급 디버깅 팁

### 1. 결제 완료 후 즉시 확인
```bash
# 백엔드 로그에서 검색
grep "Payment confirmed" backend.log
grep "구매 여부" backend.log
```

### 2. DB 직접 수정 (테스트용)
```sql
-- 모든 주문을 PAID로 변경 (개발 환경에서만!)
UPDATE ORDERS SET status = 'PAID' WHERE status = 'CREATED';
```

### 3. 프론트엔드 강제 새로고침
- 브라우저 캐시 완전 삭제
- Hard Reload: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)

---

## ✅ 성공 확인 방법

다음이 모두 충족되면 성공:

- [ ] 백엔드 서버 재시작 완료
- [ ] 결제 후 `ORDERS.status = 'PAID'` 확인
- [ ] `/api/boardlookup/{postId}/purchased` 응답이 `{"isPurchased": true}`
- [ ] React state `isPurchased = true` 확인
- [ ] 블러가 모든 이미지에서 제거됨
- [ ] 사이드바에 다운로드 아이콘 표시
- [ ] 장바구니 추가 시 "이미 구매한 상품" 알림

---

**다음 단계:** 위 체크리스트를 순서대로 확인하세요!
