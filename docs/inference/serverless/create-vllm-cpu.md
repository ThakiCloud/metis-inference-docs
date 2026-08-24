---
title: CPU vLLM 엔드포인트 생성
---

# CPU vLLM 엔드포인트 생성

GPU 없이 vLLM 서버를 띄웁니다. 가벼운 모델을 테스트하거나 GPU 예산을 쓰고 싶지 않을 때
씁니다. GPU 버전보다 처리량이 낮으므로 프로덕션 트래픽에는 권장하지 않는다는 점은
[워크로드 타입](/guide/workload-types) 에서도 설명합니다.

<!-- SCREENSHOT: serverless-create-vllm-cpu -->

## 입력 항목

GPU vLLM 보다 조정할 수 있는 항목이 많습니다. CPU 자원을 직접 배분하고 오토스케일
동작을 세밀하게 조정할 수 있기 때문입니다.

| 항목 | 설명 |
|---|---|
| 이름 | 엔드포인트 이름입니다 |
| 클러스터 | 어느 클러스터의 자원 위에 띄울지 지정합니다 |
| 모델 | 서빙할 모델을 고릅니다 |
| 최소 / 최대 레플리카 | 트래픽에 따라 늘고 줄어드는 파드 수의 범위입니다 |
| 포트 | 서비스 포트입니다 |
| CPU / 메모리 request·limit | 파드 하나가 요청하고 쓸 수 있는 CPU 와 메모리의 상한·하한입니다 |
| 오토스케일 타이밍 | reaction window(반응 대기 시간) · observation window(관측 구간) · cooldown(축소 전 대기 시간) 세 값으로 스케일링 민감도를 조정합니다 |
| maxModelLen | 컨텍스트 길이 상한입니다 |
| extraArgs | vLLM 서버 실행 시 추가로 넘길 인자입니다 |

## request 와 limit

CPU·메모리는 request(요청량)와 limit(상한) 두 값을 따로 입력합니다. request 는 파드가
스케줄될 때 보장받는 양이고, limit 은 그 이상 못 쓰게 막는 상한입니다. request 를 너무
낮게 잡으면 실제 부하에서 자원이 모자라고, limit 을 너무 낮게 잡으면 모델이 크거나 요청이
몰릴 때 파드가 강제로 재시작될 수 있습니다.

## 오토스케일 타이밍

세 값이 함께 스케일링 속도를 결정합니다. observation window 는 얼마나 오래 부하를 지켜볼지,
reaction window 는 그 관측 결과에 반응해 실제로 레플리카를 조정하기까지 걸리는 시간,
cooldown 은 한 번 조정한 뒤 다시 줄이기까지 기다리는 시간입니다. 값을 짧게 잡을수록
트래픽 변화에 빠르게 반응하지만 그만큼 파드가 자주 오르내립니다.

## 만든 뒤

생성 요청은 접수만 하고 곧바로 돌아옵니다. 상태가 `available` 이 될 때까지
[엔드포인트 조회](/inference/serverless/list) 에서 지켜보고, 배포가 끝나면
[Service URL](/inference/serverless/service-url) 에서 호출 주소를 확인하세요.

## 다음

- [엔드포인트 조회](/inference/serverless/list)
- [Rebellions vLLM 엔드포인트 생성](/inference/serverless/create-vllm-rbln)
- [핵심 개념](/guide/concepts)
