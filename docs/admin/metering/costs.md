---
title: 비용 조회
---

# 비용 조회

비용 조회는 토큰 사용량 위에 가격 정책을 적용해 실제 비용을 계산한 결과를 보여줍니다.
가격 자체는 [가격 정책](/admin/metering/pricing-rules)에서 관리하고, 여기서는 그 정책이
적용된 결과만 조회합니다.

<!-- SCREENSHOT: admin-metering-costs -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/tokens/costs?group_by=project&start_date=1745280000&end_date=1745366400"
```

`group_by` 와 `start_date` · `end_date` 는 필수입니다. `granularity` 는 `daily` 로
고정됩니다. 응답의 `series` 는 구간별·그룹별 비용 버킷이고, 각 버킷의 `cost` 와
`unpriced_records` 는 [토큰 사용량](/admin/metering/tokens)과 같은 결측 규칙을 따릅니다
— `cost` 가 없으면 가격이 매겨진 기록이 없다는 뜻이고, 있는데 `unpriced_records` 도
있으면 그 비용은 하한선입니다.

::: warning `truncated` 를 반드시 확인하세요
버킷마다 비용이 큰 순으로 최대 100개 그룹까지만 담깁니다. 그 이상은 잘리고, `truncated`
필드가 `true` 로 이 사실을 알려줍니다. 이 값을 확인하지 않고 합계를 그대로 전체 비용으로
쓰면, 상위 100개 밖의 소액 지출이 조용히 빠진 채로 보고서에 실립니다. 이 경로에는
페이지네이션(`page`/`page_size`)이 없습니다 — 잘린 나머지를 다음 페이지로 가져올 수
없다는 뜻입니다.
:::

## 다음

- [토큰 사용량](/admin/metering/tokens)
- [가격 정책](/admin/metering/pricing-rules)
- [키 로스터와 활동](/admin/metering/key-roster)
