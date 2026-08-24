---
title: Rebellions vLLM 엔드포인트 생성
---

# Rebellions vLLM 엔드포인트 생성

Rebellions NPU 하드웨어에서 vLLM 서버를 띄웁니다. 입력 항목은
[CPU vLLM 엔드포인트 생성](/inference/serverless/create-vllm-cpu) 과 거의 같고, NPU 개수
항목이 하나 더 붙습니다.

<!-- SCREENSHOT: serverless-create-vllm-rbln -->

## 입력 항목

| 항목 | 설명 |
|---|---|
| 이름 | 엔드포인트 이름입니다 |
| 클러스터 | NPU 를 가진 클러스터를 지정합니다 |
| 모델 | 서빙할 모델을 고릅니다 |
| 최소 / 최대 레플리카 | 트래픽에 따라 늘고 줄어드는 파드 수의 범위입니다 |
| 포트 | 서비스 포트입니다 |
| CPU / 메모리 request·limit | 파드 하나가 요청하고 쓸 수 있는 CPU 와 메모리의 상한·하한입니다 |
| 오토스케일 타이밍 | reaction window · observation window · cooldown 세 값으로 스케일링 민감도를 조정합니다 |
| maxModelLen | 컨텍스트 길이 상한입니다 |
| extraArgs | vLLM 서버 실행 시 추가로 넘길 인자입니다 |
| NPU 개수 | 고른 모델에 따라 자동으로 정해지고, 이 화면에서 직접 편집할 수는 없습니다 |

CPU/메모리 request·limit 과 오토스케일 타이밍의 의미는
[CPU vLLM 엔드포인트 생성](/inference/serverless/create-vllm-cpu) 에서 설명한 것과
동일합니다.

## NPU 개수가 고정되는 이유

다른 항목과 달리 NPU 개수는 직접 입력하는 값이 아니라 고른 모델이 정합니다. 모델마다
필요한 NPU 개수가 다르기 때문에, 모델을 선택하면 그에 맞는 값이 채워지고 회색으로
비활성화됩니다. 다른 NPU 개수로 띄우고 싶다면 그만큼을 지원하는 다른 모델을 골라야
합니다.

## 만든 뒤

생성 요청은 접수만 하고 곧바로 돌아옵니다. 상태가 `available` 이 될 때까지
[엔드포인트 조회](/inference/serverless/list) 에서 지켜보고, 배포가 끝나면
[Service URL](/inference/serverless/service-url) 에서 호출 주소를 확인하세요.

## 다음

- [엔드포인트 조회](/inference/serverless/list)
- [CPU vLLM 엔드포인트 생성](/inference/serverless/create-vllm-cpu)
- [워크로드 타입](/guide/workload-types)
