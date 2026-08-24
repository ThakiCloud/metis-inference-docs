---
title: 최근 활동
---

# 최근 활동

최근 활동은 테넌트 전체에서 엔드포인트에 벌어진 일을 시간순으로 보여주는 화면입니다.
누가 언제 무엇을 했는지 — 생성·수정·삭제·일시정지·재개 — 를 프로젝트 경계 없이 한 번에
훑을 때 씁니다.

<!-- SCREENSHOT: admin-recent-activities -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/recent-activities"
```

`cluster_id` 또는 `cluster` 파라미터로 특정 클러스터의 활동만 좁혀 볼 수 있습니다.

각 활동 항목은 다음 필드를 가집니다.

| 필드 | 설명 |
|---|---|
| `action` | `create` · `update` · `delete` · `wake` · `pause` 등 |
| `endpoint_id` / `endpoint_name` | 대상 엔드포인트. 이름은 그 시점 스냅샷입니다. |
| `project_id` / `project_name` | 소속 프로젝트. 이름 확인이 안 되면 비어 있습니다. |
| `cluster_id` / `cluster_name` | 배포된 클러스터. 없거나 확인이 안 되면 비어 있습니다. |
| `request_at` | 행위가 기록된 시각 (Unix 초) |

`endpoint_name` · `project_name` · `cluster_name` 은 **그 행위가 일어난 시점의 이름**을
기록해 둔 것입니다. 이후 이름이 바뀌거나 프로젝트가 지워져도 이력에 남은 이름은 바뀌지
않습니다. 이름 확인이 애초에 안 됐던 경우는 빈 문자열로 남고, ID 로 대체되지 않습니다.

## 다음

- [전체 엔드포인트 조회](/admin/serverless/list)
- [Sanity Check](/admin/serverless/sanity-check)
- [키 로스터와 활동](/admin/metering/key-roster) — 누가 얼마나 호출했는지
