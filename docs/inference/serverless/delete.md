---
title: 엔드포인트 삭제
---

# 엔드포인트 삭제

더 이상 쓰지 않는 엔드포인트를 영구히 지웁니다. [엔드포인트 조회](/inference/serverless/list)
목록의 행 액션 메뉴에서 삭제를 선택합니다.

<!-- SCREENSHOT: serverless-delete-confirm -->

## 삭제하면 되돌릴 수 없습니다

삭제 요청이 접수되면 상태가 `terminating` 을 거쳐 `terminated` 로 바뀌고, 이 과정은
되돌릴 수 없습니다. 엔드포인트 설정도, [Service URL](/inference/serverless/service-url)
로 확인하던 주소도 함께 사라집니다. 나중에 같은 모델로 엔드포인트를 다시 만들어도
아이디가 새로 생기므로 주소는 이전과 달라집니다 — 자세한 규칙은
[엔드포인트 URL](/guide/inference/endpoint-url) 을 참고하세요.

당장 쓰지 않지만 나중에 다시 쓸 가능성이 있다면 삭제 대신
[일시정지](/inference/serverless/pause-resume) 를 먼저 검토하세요. 일시정지는 설정과
주소를 그대로 둔 채 자원만 반납합니다.

## 삭제 후 확인

삭제 요청도 접수 후 곧바로 돌아옵니다. 목록에서 상태가 `terminated` 로 바뀌었는지, 또는
목록에서 아예 사라졌는지 확인하면 정리가 끝난 것입니다.

## 다음

- [엔드포인트 조회](/inference/serverless/list)
- [일시정지·재개](/inference/serverless/pause-resume)
- [엔드포인트 URL](/guide/inference/endpoint-url)
