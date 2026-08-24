---
title: 가격 정책
---

# 가격 정책

가격 정책은 [비용 조회](/admin/metering/costs)와 [토큰 사용량](/admin/metering/tokens)의
`cost` 필드를 계산하는 근거입니다. 어떤 단위(토큰·시간 등)에 얼마를 매길지를 정의합니다.

<!-- SCREENSHOT: admin-metering-pricing-rules -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/pricing-rules?is_active=true"
```

`pricing_key` · `pricing_key_type`(`sku` 또는 `fallback`) · `is_active` 로
필터링합니다. `sku` 는 특정 모델·자원에 대한 명시적 가격이고, `fallback` 은 명시적
규칙이 없을 때 적용되는 기본 가격입니다.

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/admin/pricing-rules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricing_key": "qwen3-8b:completion_tokens",
    "pricing_key_type": "sku",
    "unit": "1k_tokens",
    "price_per_unit": 0.002,
    "currency": "USD",
    "is_active": true
  }'
```

| 필드 | 설명 |
|---|---|
| `pricing_key` | 이 규칙이 적용되는 대상 (모델·자원 조합) |
| `pricing_key_type` | `sku` 또는 `fallback` |
| `unit` | 가격 단위 |
| `price_per_unit` | 단위당 가격 |
| `currency` | 통화 (기본 USD) |
| `effective_from` / `effective_to` | 적용 기간 (Unix 초) |
| `is_active` | 활성 여부 |

수정은 `PUT /admin/pricing-rules/{id}` 로 같은 필드를 부분 갱신합니다. 규칙을 완전히
지우는 대신 **비활성화**하는 것이 정본 경로입니다.

```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/pricing-rules/$RULE_ID/deactivate"
```

비활성화된 규칙은 이후 비용 계산에서 빠지지만 이력으로는 남습니다. 과거 시점의 비용을
다시 계산해야 한다면 [이상 탐지 알림](/admin/metering/alerts) 페이지의 집계 백필
기능으로 해당 구간을 재집계하세요.

## 다음

- [비용 조회](/admin/metering/costs)
- [토큰 사용량](/admin/metering/tokens)
- [vLLM 카탈로그](/admin/catalog/vllm)
