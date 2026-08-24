---
title: 키 로스터와 활동
---

# 키 로스터와 활동

키 로스터는 테넌트 안의 모든 API 키를 한 줄씩 보여주는 화면입니다. 어느 키가 얼마나
최근에 쓰였는지, 상태가 무엇인지, 최근 얼마나 호출했는지를 한눈에 훑을 때 씁니다.

<!-- SCREENSHOT: admin-metering-key-roster -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/tokens/api-keys?page=1&page_size=20"
```

| 필드 | 설명 |
|---|---|
| `api_key_id` | 키 ID (`pak_`·`sak_` 접두) |
| `key_name` | 키 이름 |
| `status` / `effective_status` | 저장된 상태와, 만료 시각으로 읽어낸 실제 상태. IAM 은 키 회수를 만료 처리로 구현하므로 `expires_at` 이 지났으면 `effective_status` 는 회수됨으로 읽힙니다. |
| `known` | 사용 기록은 있는데 키 디렉터리에 없는 키는 `false` 입니다. 디렉터리가 켜지기 전 트래픽이거나 아직 관측되지 않은 키로, **정상적으로 있을 수 있는 상태**입니다. |
| `unattributed` | `api_key_id` 없이 들어온 트래픽을 모아 두는 예약 행에만 붙습니다. |
| `expires_at` / `first_metered_at` / `last_metered_at` | Unix 초 |
| `last_model` | 마지막으로 호출한 모델 |
| `owner_tpn` | 인증 시점에 확인된 소유자. 신원 관측 기능이 배포되기 전 발급된 키는 첫 인증 전까지 비어 있습니다. |
| `usage_1d` / `usage_7d` / `usage_30d` / `usage_mtd` | 1일·7일·30일·이번 달 사용량 요약 |

`include_unattributed=true` 로 비귀속 트래픽 행을 포함해 조회할 수 있고, `search` 로
`api_key_id` 나 최근 모델명을 부분 일치 검색합니다.

## 키별 활동 조회

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/tokens/api-keys/$API_KEY_ID/activity?start_date=1745280000&end_date=1745366400"
```

특정 키 하나의 시계열 활동을 봅니다. 응답은 [토큰 사용량](/admin/metering/tokens)의
요약과 같은 지표 집합에 더해 `top_models`(가장 많이 호출한 모델 목록)와
`top_models_truncated`(목록이 잘렸는지)를 포함합니다. 값이 없는 것과 0 인 것을 구분하는
규칙도 동일하게 적용됩니다.

## 다음

- [레이트 리밋 설정](/admin/metering/rate-limits) — 키별 한도
- [이상 탐지 알림](/admin/metering/alerts)
- [토큰 사용량](/admin/metering/tokens)
