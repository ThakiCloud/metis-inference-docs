---
title: 일시정지·재개
---

# 일시정지·재개

일시정지는 엔드포인트를 지우지 않고 자원만 반납하는 방법입니다. 다시 쓸 계획이 있는데
당장은 트래픽이 없는 엔드포인트에 씁니다.

<!-- SCREENSHOT: admin-endpoint-pause-resume -->

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/$ENDPOINT_ID/pause"

curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/$ENDPOINT_ID/wake"
```

두 요청 모두 접수만 하고 바로 돌아옵니다(202). 응답에는 `id` · `name` · `message` ·
`timestamp` 가 담깁니다. 실제로 멈추거나 다시 뜨는 것은 비동기로 진행되므로, 목록에서
`status` 가 `paused` 또는 `available` 로 바뀔 때까지 기다리세요.

일시정지된 엔드포인트는 GPU 를 반납하므로 과금도 멈춥니다. 재개하면 다시 `creating`
상태를 거쳐 뜨고, 이 시간은 [콜드 스타트](/guide/inference/cold-start)와 같은 성격입니다
— 오래 쉰 엔드포인트일수록 이미지·가중치를 다시 받아 오는 시간이 걸릴 수 있습니다.

이미 일시정지된 엔드포인트를 다시 일시정지하거나, 이미 떠 있는 엔드포인트를 다시 깨우면
409 가 돌아옵니다. 목록에서 현재 상태를 먼저 확인하세요.

## 다음

- [전체 엔드포인트 조회](/admin/serverless/list) — 현재 상태 확인
- [엔드포인트 삭제](/admin/serverless/delete)
- [콜드 스타트](/guide/inference/cold-start)
