---
title: 일시정지·재개
---

# 일시정지·재개

당장 쓰지 않는 엔드포인트는 지우지 않고 일시정지해 둘 수 있습니다.
[엔드포인트 조회](/inference/serverless/list) 목록의 행 액션 메뉴에 일시정지와 재개가
따로 있습니다.

<!-- SCREENSHOT: serverless-pause-resume -->

## 일시정지

레플리카를 내려 자원을 반납합니다. 상태가 `paused` 로 바뀌고, 이 상태에서는 호출해도
응답하지 않습니다. 엔드포인트 자체와 그 설정은 그대로 남아 있으므로, 다시 필요할 때
재개만 하면 됩니다.

일정 기간 안 쓸 모델이라면 삭제 대신 일시정지를 먼저 고려하세요. 삭제는 되돌릴 수 없고
엔드포인트를 다시 만들면 [엔드포인트 URL](/guide/inference/endpoint-url) 에서 설명하는
대로 주소도 새로 발급됩니다. 일시정지는 주소를 그대로 유지한 채 자원만 반납합니다.

## 재개

`paused` 상태의 엔드포인트를 다시 띄웁니다. 새로 만드는 것이 아니라 같은 설정으로 다시
배포하는 것이므로, 재개 후에도 [Service URL](/inference/serverless/service-url) 은
바뀌지 않습니다. 재개 요청도 접수 후 곧바로 돌아오므로, 상태가 `available` 로 바뀔 때까지
[엔드포인트 조회](/inference/serverless/list) 에서 지켜본 뒤 호출하세요.

## 다음

- [엔드포인트 조회](/inference/serverless/list)
- [엔드포인트 삭제](/inference/serverless/delete)
- [Service URL 확인](/inference/serverless/service-url)
