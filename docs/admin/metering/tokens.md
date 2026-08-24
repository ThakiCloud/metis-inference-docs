---
title: 토큰 사용량
---

# 토큰 사용량

토큰 사용량 화면은 테넌트 전체의 모델 호출을 집계해서 보여줍니다. 요약과 차원별 분해
(breakdown) 두 가지 조회를 제공합니다.

<!-- SCREENSHOT: admin-metering-tokens -->

## 요약

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/tokens/summary?start_date=1745280000&end_date=1745366400&granularity=daily"
```

`start_date` 와 `end_date` 는 필수입니다(Unix 초). `granularity` 로 시간 단위를 정하고,
`model` · `endpoint_id` · `user_id` · `api_key_id` 로 범위를 좁힐 수 있습니다. 응답에는
총 요청 수, 성공·실패·취소 건수, 토큰 사용량, 지연 시간 백분위, 캐시 히트율, 비용, 그리고
구간별 `time_series` 가 담깁니다.

## 값이 없는 것과 0 인 것을 구분합니다

이 응답에서 가장 중요한 규칙입니다. `error_rate` · `cache_hit_rate` · `avg_latency_ms` ·
`tokens_per_sec` · `cost` 같은 지표는 **측정된 것이 없으면 0 이 아니라 필드 자체가
빠집니다.** 요청이 하나도 없었던 구간의 에러율은 0% 가 아니라 "잰 적이 없다"는 뜻이고,
이 둘을 같은 0 으로 렌더링하면 실제로는 아무 트래픽도 없었던 엔드포인트가 건강한 것처럼
보입니다. 코드에서 이 필드들을 읽을 때는 값이 없는 경우를 0 과 구분해서 처리하세요.

`latency_p50_ms` · `latency_p95_ms` · `latency_p99_ms` · `ttft_p50_ms` 등 백분위 값은
히스토그램에서 **보간(interpolate)한 추정치**이며, `percentiles_exact` 필드가 이 사실을
알려줍니다. p99 가 히스토그램의 마지막 유한 구간 경계와 같은 값이면, 그 값은 정확한 p99 가
아니라 하한선일 수 있습니다.

`cost` 가 있는데 `unpriced_records` 도 0 보다 크면, 그 비용은 **하한선**입니다 — 구간
안의 일부 기록만 가격이 매겨졌다는 뜻입니다. `cost` 자체가 없으면 그 구간은 아무것도
가격이 매겨지지 않은 것이고, 이때 `unpriced_records` 로도 비용의 하한을 추정할 수
없습니다.

## 차원별 분해

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/tokens/breakdown?group_by=model&start_date=1745280000&end_date=1745366400"
```

`group_by` 는 필수이며 `user` · `project` · `model` · `endpoint` · `api_key` 중 하나를
받습니다. `search` 로 그 차원의 표시 이름을 검색할 수 있고(`user` 는 이름 또는 이메일),
결과는 [API 레퍼런스](/api/)의 표준 페이지네이션(`page` · `page_size` · `total`)을
따릅니다. 각 행은 요약과 같은 지표(요청 수, 토큰, 지연, 비용 등)를 그 차원 기준으로
담고 있고, 결측 규칙도 동일합니다.

## 다음

- [비용 조회](/admin/metering/costs)
- [키 로스터와 활동](/admin/metering/key-roster)
- [API 레퍼런스](/api/) — 시간 형식과 페이지네이션
