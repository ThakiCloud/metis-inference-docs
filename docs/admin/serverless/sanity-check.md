---
title: Sanity Check
---

# Sanity Check

Sanity Check 는 엔드포인트가 실제로 응답하는지 확인하는 가장 짧은 방법입니다. 짧은
프롬프트 하나를 보내고 응답과 지연 시간을 기록합니다 — 관리자가 직접
`/v1/chat/completions` 를 호출해 보지 않아도, 그 엔드포인트가 살아 있는지 화면에서 바로
알 수 있습니다.

<!-- SCREENSHOT: admin-endpoint-sanity-check -->

## 트리거하기

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/$ENDPOINT_ID/sanity-check" \
  -d '{"prompt": "안녕"}'
```

`prompt` 는 선택입니다. 생략하면 표준 인사말로 보냅니다. 응답(201)에는 그 실행 결과가
그대로 담깁니다.

| 필드 | 설명 |
|---|---|
| `status` | 실행 결과 (예: `passed`) |
| `prompt` | 실제로 보낸 프롬프트 |
| `response_text` | 모델이 돌려준 응답 |
| `latency_ms` | 걸린 시간 |
| `error_message` | 실패했을 때의 원인 |
| `triggered_by` | 누가·무엇이 실행했는지 |
| `created_at` / `updated_at` | Unix 초 |

이미 진행 중인 Sanity Check 가 있는 엔드포인트에 다시 요청하면 409 가 돌아옵니다.

## 이력 조회하기

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/$ENDPOINT_ID/sanity-check?limit=20"
```

응답은 가장 최근 결과(`latest`)와 과거 실행 이력(`history`)을 함께 돌려줍니다. `limit`
으로 이력 개수를 제한할 수 있습니다.

## 다음

- [전체 엔드포인트 조회](/admin/serverless/list)
- [최근 활동](/admin/serverless/activities)
- [토큰 사용량](/admin/metering/tokens)
