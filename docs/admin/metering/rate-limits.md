---
title: 레이트 리밋 설정
---

# 레이트 리밋 설정

레이트 리밋은 API 키 단위로 초당·분당 요청 수와 월간 토큰 사용량에 상한을 겁니다. 특정
키가 비정상적으로 많이 호출해 다른 테넌트에 영향을 주는 것을 막는 용도입니다.

<!-- SCREENSHOT: admin-metering-rate-limits -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/api-key-rate-limits/$KEY_ID"
```

한 키에 여러 모델별 설정이 있을 수 있어 목록으로 돌아옵니다. 설정하거나 바꿀 때는 모델
단위로 PUT 합니다.

```bash
curl -X PUT "https://<your-console-host>/api/v1/metis/admin/api-key-rate-limits/$KEY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "*", "rps_limit": 5, "rpm_limit": 200, "monthly_token_limit": 5000000}'
```

| 필드 | 설명 |
|---|---|
| `model` | 대상 모델. 전체 모델에 적용하려면 `*` |
| `rps_limit` / `rpm_limit` | 초당·분당 요청 수 상한 |
| `monthly_token_limit` | 월간 토큰 사용량 상한 |
| `monthly_cost_limit_micros` | 월간 비용 상한 (마이크로 USD 단위) |
| `alert_threshold_pcts` | 한도 대비 몇 % 에서 알림을 낼지. 생략하면 기본값 `{50, 85, 95}` 가 적용되고, 빈 배열을 명시하면 구간 알림 자체를 끕니다. |

::: warning `monthly_cost_limit_micros` 는 실제로 막지 않습니다
이 필드는 **알림 전용**입니다. 값을 넘어도 호출이 차단되지 않고, 임계치를 넘었다는 알림만
발생합니다. 실제로 호출을 막는 것은 `rps_limit` · `rpm_limit` · `monthly_token_limit`
뿐입니다. 비용 상한이 곧 차단으로 이어질 거라 기대하고 설정하면 안 됩니다.
:::

특정 모델의 설정을 지우려면 그 모델명(또는 `*`)을 지정해 삭제합니다.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/api-key-rate-limits/$KEY_ID?model=*"
```

이 한도를 넘은 요청이 어떻게 보이는지는 [API 레퍼런스](/api/)의 에러 코드 문서에서
`RATE_LIMIT_EXCEEDED` 를 참고하세요.

## 다음

- [키 로스터와 활동](/admin/metering/key-roster)
- [이상 탐지 알림](/admin/metering/alerts)
- [API 레퍼런스](/api/)
