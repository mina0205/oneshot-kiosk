## 인메모리 데이터 저장소

# 장바구니: { session_id: { cartItemId: { ...item } } }
carts: dict = {}

# 주문 이력: { session_id: [ { ...order } ] }
orders: dict = {}

# 대기번호 카운터
order_counter = 0
