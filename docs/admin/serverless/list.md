---
title: 전체 엔드포인트 조회
---

# 전체 엔드포인트 조회

관리자 앱의 엔드포인트 목록은 IAM 조직 안의 모든 프로젝트를 가로질러 보여줍니다. Docker ·
vLLM · vLLM CPU · vLLM Rebellions 네 워크로드 타입이 한 화면에 섞여 나오고, 각 행에는
소속 프로젝트와 (연결돼 있으면) 클러스터가 함께 표시됩니다.

![관리자 앱의 테넌트 전체 엔드포인트 목록](/images/admin/admin-endpoint-list.png)

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints?status=available&page=1&page_size=20"
```

목록 조회는 아래 조건으로 좁힐 수 있습니다.

| 파라미터 | 설명 |
|---|---|
| `cluster_id` | 특정 클러스터로 제한 |
| `status` | 상태 필터 (아래 표 참고) |
| `workload_type` | Docker · vLLM · vLLM CPU · vLLM Rebellions 중 하나로 제한 |
| `owner_id` | 소유자로 제한 |
| `q` | 이름 검색 |
| `sort` / `order` | 정렬 필드와 방향 |
| `page` / `page_size` | 페이지네이션 ([API 레퍼런스](/api/) 참고) |

응답의 각 항목은 `id` · `name` · `status` · `workload_type` · `model` · `gpu` ·
`min_replica` · `max_replica` · `service_url` · `project_id` · `project_name` ·
`cluster_id` · `cluster_name` · `version`(수정 시 필요, [API 레퍼런스](/api/) 참고)을
담고 있습니다. `service_url` 은 배포가 끝나 `status` 가 `available` 이 되기 전까지 비어
있습니다.

상태만 빠르게 훑고 싶으면 요약 경로를 씁니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/summary"
```

응답은 `available` · `creating` · `failed` · `paused` · `pending` · `queued` ·
`terminated` · `terminating` · `total` 상태별 개수를 한 번에 돌려줍니다.

## 행에서 할 수 있는 것

목록의 각 행에는 액션 메뉴가 있습니다. **Service URL** 확인, **로그 보기**, **프롬프트
전송**, **일시정지**, **재개**, **편집**, **삭제**입니다. 새 엔드포인트를 만드는 액션은
없습니다 — 자세한 이유는 [일반 앱과의 차이](/admin/differences)를 보세요.

## 다음

- [엔드포인트 수정](/admin/serverless/edit)
- [일시정지·재개](/admin/serverless/pause-resume)
- [최근 활동](/admin/serverless/activities)
