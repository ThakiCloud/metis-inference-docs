---
title: 엔드포인트 수정
---

# 엔드포인트 수정

이미 만든 엔드포인트의 설정을 바꾸는 화면입니다. [엔드포인트 조회](/inference/serverless/list)
목록에서 행 액션 메뉴의 편집을 선택하면 열립니다.

![엔드포인트 편집 폼](/images/inference/serverless-edit.png)

## 낙관적 잠금 — version

수정 요청에는 `version` 값이 함께 들어갑니다. 이 화면을 열었을 때 조회된 현재 버전이고,
저장할 때 그대로 함께 보냅니다. 그 사이 다른 사람이 먼저 이 엔드포인트를 고쳤다면 버전이
어긋나 저장이 거부됩니다. 이때는 화면을 새로 불러와 최신 상태를 다시 받은 뒤 수정을
반복하세요. 같은 규칙이 API 로 직접 호출할 때도 적용됩니다 — 자세한 내용과 예시는
[공통 규약](/api/conventions) 의 낙관적 잠금 항목을 참고하세요.

## GPU 개수 변경은 비동기입니다

GPU 개수처럼 파드를 다시 띄워야 하는 변경은 저장 즉시 반영되지 않습니다. 요청이 접수된
뒤 실제로 적용되기까지 시간이 걸리므로,
[엔드포인트 조회](/inference/serverless/list) 에서 상태가 다시 `available` 로 돌아올
때까지 기다렸다가 호출하세요. 그 사이 잠시 요청이 실패할 수 있습니다.

## 다음

- [엔드포인트 조회](/inference/serverless/list)
- [일시정지·재개](/inference/serverless/pause-resume)
- [공통 규약](/api/conventions)
