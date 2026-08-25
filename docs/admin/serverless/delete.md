---
title: 엔드포인트 삭제
---

# 엔드포인트 삭제

삭제는 되돌릴 수 없습니다. 엔드포인트가 실행 중이면 먼저 정지한 뒤 삭제가 진행됩니다.

![관리자 앱의 엔드포인트 삭제 확인](/images/admin/admin-endpoint-delete-confirm.png)

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/$ENDPOINT_ID"
```

요청은 접수만 하고 바로 돌아오며, 엔드포인트는 `terminating` 상태를 거쳐 `terminated` 로
넘어갑니다. 이 값은 목록이나 상세 조회로 다시 확인해야 합니다 — 삭제 요청 자체의 응답에는
최종 상태가 담기지 않습니다.

같은 이름으로 다시 엔드포인트를 만들 수는 있지만, [엔드포인트 URL](/guide/inference/endpoint-url)
에서 설명했듯 주소는 엔드포인트 ID 에서 나오므로 **새 엔드포인트는 새 주소를 받습니다.**
호출하는 애플리케이션이 삭제된 엔드포인트의 주소를 하드코딩하고 있었다면 새 주소로 갱신해야
합니다.

::: warning 이 자리에서는 확인창을 신뢰하세요
목록 화면의 삭제 액션은 확인 절차를 거칩니다. API 를 직접 호출할 때는 이 확인이 없으므로,
`$ENDPOINT_ID` 가 지우려는 그 엔드포인트가 맞는지 [전체 엔드포인트 조회](/admin/serverless/list)
로 먼저 확인하고 실행하세요.
:::

## 다음

- [전체 엔드포인트 조회](/admin/serverless/list)
- [일시정지·재개](/admin/serverless/pause-resume) — 지우지 않고 멈추는 방법
- [최근 활동](/admin/serverless/activities) — 누가 언제 지웠는지
