---
title: 이상 탐지 알림
---

# 이상 탐지 알림

이상 탐지 알림은 API 키의 사용 패턴이 평소와 다르게 튈 때 시스템이 자동으로 만드는
경보입니다. 급격한 토큰 소비 증가, 비정상적으로 높은 에러율 같은 패턴을 탐지기(detector)가
잡아냅니다.

<!-- SCREENSHOT: admin-metering-alerts -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/alerts?status=open&page=1&page_size=20"
```

`api_key_id` · `detector` · `severity` · `status` · `triage` 로 필터링합니다. 각 알림은
`observed_value` 와 `threshold_value`(관측값과 임계값), `occurrence_count`(누적 발생
횟수)와 `clean_evaluations`(정상으로 평가된 횟수), 탐지 구간(`window_start`/
`window_end`), 최초·최근 관측 시각(`first_seen_at`/`last_seen_at`)을 담습니다.

## 알림 처리하기

```bash
curl -X PATCH "https://<your-console-host>/api/v1/metis/admin/metering/alerts/$ALERT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "acknowledged", "triage": "actionable"}'
```

`status` 는 `acknowledged`(확인함) 또는 `resolved`(해결함)로, `triage` 는 `actionable`
(조치 필요) · `false_positive`(오탐) · `ignored`(무시) · `untriaged`(미분류) 중 하나로
바꿉니다. 두 필드 중 최소 하나는 있어야 합니다.

## 반복되는 알림을 잠재우기 — Suppression

같은 키에서 같은 탐지기가 계속 알림을 만든다면, 그 조합을 일정 기간 억제(suppress)할 수
있습니다.

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/admin/metering/suppressions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_key_id": "pak_abc123", "detector": "token_spike", "until_at": 1750000000, "reason": "예정된 부하 테스트"}'
```

`detector` 자리에 `*` 를 넣으면 그 키의 모든 탐지기를 억제합니다. `until_at` 은 반드시
미래 시각(Unix 초)이어야 합니다. 억제를 조기에 풀려면 삭제합니다.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/metering/suppressions/pak_abc123/token_spike"
```

## 집계 백필

집계가 잘못됐거나, 소급해서 데이터를 보정한 뒤 재집계가 필요할 때 씁니다.

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/admin/metering/aggregation/backfill" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"from": 1745280000, "to": 1745366400, "granularity": "hourly"}'
```

`granularity` 는 `5m` · `hourly` · `daily` 중 하나이고, `from` · `to` 는 그 단위 경계에
맞춰진 Unix 초여야 하며 `to` 는 미래일 수 없습니다. 응답의 `buckets` 는 실제로 재집계된
구간 수입니다. [토큰 사용량](/admin/metering/tokens)이나 [비용 조회](/admin/metering/costs)
의 지표가 실제와 어긋나 보인다면, 먼저 이 경로로 해당 구간을 다시 집계해 보세요.

## 다음

- [키 로스터와 활동](/admin/metering/key-roster)
- [레이트 리밋 설정](/admin/metering/rate-limits)
- [토큰 사용량](/admin/metering/tokens)
