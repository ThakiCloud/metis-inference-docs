---
title: 엔드포인트 수정
---

# 엔드포인트 수정

관리자는 어느 프로젝트에 속한 엔드포인트든 수정할 수 있습니다. 목록의 액션 메뉴에서 편집을
선택하면 GPU 개수, 최소·최대 레플리카, 스케일링 타이밍을 바꾸는 패널이 열립니다.

![관리자 앱의 엔드포인트 편집](/images/admin/admin-endpoint-edit.png)

수정 가능한 필드는 이 네 가지뿐입니다.

| 필드 | 설명 |
|---|---|
| `gpu` | GPU 개수. 바뀌면 즉시 반영되지 않고 비동기로 처리됩니다. |
| `min_replica` | 최소 레플리카 수 |
| `max_replica` | 최대 레플리카 수 |
| `scaling_timings` | 스케일링 타이밍 설정. 부분 업데이트를 지원해 바꾸려는 값만 보내면 됩니다. |

일반 엔드포인트 수정과 마찬가지로 낙관적 잠금이 적용됩니다. 조회 응답의 `version` 을
그대로 실어 보내야 하고, 그 사이 다른 사람이 먼저 고쳤다면 요청이 거부됩니다
([API 레퍼런스](/api/) 참고).

```bash
curl -X PUT "https://<your-console-host>/api/v1/metis/admin/endpoints/$ENDPOINT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gpu": 2, "min_replica": 1, "max_replica": 4, "version": 3}'
```

GPU 개수를 바꾸는 요청은 접수만 되고 곧바로 돌아옵니다. 실제로 자원이 재배치되는 동안
엔드포인트 상태는 `creating` 을 거치고, 끝나면 다시 `available` 이 됩니다. 진행 상황은
[전체 엔드포인트 조회](/admin/serverless/list)에서 상태를 다시 조회해 확인하세요.

## 다음

- [전체 엔드포인트 조회](/admin/serverless/list)
- [API 레퍼런스](/api/) — 낙관적 잠금과 비동기 처리
- [일시정지·재개](/admin/serverless/pause-resume)
