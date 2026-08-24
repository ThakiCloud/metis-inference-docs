---
title: 공통 규약
---

# 공통 규약

그룹이 22개나 되지만 규약은 몇 가지로 공통입니다. 이것만 알면 처음 보는 경로도 읽힙니다.

## 베이스 경로

```
https://<your-console-host>/api/v1/metis
```

대부분의 사용자 리소스는 프로젝트 아래에 있습니다.

```
/api/v1/metis/projects/{project_id}/endpoints
/api/v1/metis/projects/{project_id}/metering/tokens/summary
```

관리자 전용 경로는 프로젝트 대신 `admin` 아래에 있고 테넌트 전체를 봅니다.

```
/api/v1/metis/admin/endpoints
/api/v1/metis/admin/metering/tokens/summary
```

## 목록 응답과 페이지네이션

목록은 `data` 배열과 페이지 정보를 함께 돌려줍니다.

```json
{
  "data": [ { "id": "...", "name": "..." } ],
  "page": 1,
  "page_size": 20,
  "total": 100
}
```

| 필드 | 설명 |
|---|---|
| `data` | 결과 배열 |
| `page` | 현재 페이지 (1부터) |
| `page_size` | 페이지 크기 |
| `total` | 필터 적용 후 전체 개수 |

`total` 과 `page_size` 로 마지막 페이지를 계산해 순회하세요. 페이지를 끝까지 도는 코드는
`page * page_size >= total` 을 종료 조건으로 씁니다.

## 시간 형식이 두 가지입니다

섞여 있으니 주의하세요.

| 형식 | 쓰이는 곳 | 예 |
|---|---|---|
| Unix 초 (정수) | 리소스의 `created_at`, `updated_at`, 에러의 `timestamp` | `1701676800` |
| RFC 3339 문자열 | 추세·시계열 데이터의 `timestamp`, `time` | `2026-04-22T08:15:00Z` |

리소스 목록을 다루면 정수, 차트용 시계열을 다루면 문자열이라고 기억하면 대체로 맞습니다.

## 식별자

리소스 ID 는 UUID 입니다.

```
550e8400-e29b-41d4-a716-446655440000
```

이름(`name`)은 ID 가 아닙니다. 엔드포인트 이름은 3~50자 DNS-1123 규칙(소문자·숫자·하이픈)을
따르고 프로젝트 안에서만 고유합니다. 참조는 항상 ID 로 하세요.

## 낙관적 잠금 — `version`

엔드포인트 수정은 `version` 을 함께 보내야 합니다. 조회했을 때 받은 값을 그대로 넣습니다.

```bash
curl -X PUT "https://<your-console-host>/api/v1/metis/projects/$PROJECT_ID/endpoints/$ENDPOINT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"min_replica": 1, "max_replica": 3, "version": 1}'
```

그 사이 다른 사람이 먼저 고쳤다면 버전이 어긋나 요청이 거부됩니다. 이때는 다시 조회해서
최신 `version` 으로 재시도하세요. 조회 없이 `version` 을 임의로 올려 보내면 남의 변경을
덮어씁니다.

## 비동기로 처리되는 작업

생성·삭제·GPU 개수 변경은 요청을 접수만 하고 곧바로 돌아옵니다. 응답은 이런 모양입니다.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-vllm-endpoint",
  "message": "Endpoint deletion request accepted",
  "timestamp": 1701676800
}
```

실제 완료는 상태를 폴링해서 확인합니다. `status` 가 `available` 이 되어야 쓸 수 있고,
`service_url` 도 그때 채워집니다.

| 상태 | 의미 |
|---|---|
| `pending` | 접수됨, 아직 스케줄 전 |
| `queued` | 자원 대기 중 |
| `creating` | 배포 중 |
| `available` | 사용 가능 |
| `paused` | 일시정지 |
| `failed` | 실패 |
| `terminating` / `terminated` | 삭제 중 / 삭제됨 |

상태별 개수만 빠르게 보려면 요약 경로가 따로 있습니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/projects/$PROJECT_ID/endpoints/summary"
```

## 다음

- [에러 코드](/api/errors)
- [OpenAPI 뷰어](/api/reference)
