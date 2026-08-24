---
title: Docker 엔드포인트 생성
---

# Docker 엔드포인트 생성

표준 vLLM 서버로는 안 되는, 직접 만든 컨테이너 이미지를 서빙하고 싶을 때 씁니다. 자세한
용도 비교는 [워크로드 타입](/guide/workload-types) 의 `DOCKER_CUSTOM` 항목을 참고하세요.

<!-- SCREENSHOT: serverless-create-docker -->

## 입력 항목

| 항목 | 필수 | 설명 |
|---|---|---|
| 이미지 URI | ✓ | 띄울 컨테이너 이미지 주소입니다 |
| 레지스트리 인증 정보 | — | 프라이빗 레지스트리에서 이미지를 당겨올 때만 지정합니다. 미리 등록해 둔 자격 증명 중에서 고릅니다 |
| 엔드포인트 이름 | ✓ | DNS-1123 규칙(소문자·숫자·하이픈)을 따릅니다 |
| 컴퓨트 타입 | ✓ | CPU 또는 GPU 중에서 고릅니다 |
| 포트 | ✓ | 컨테이너가 실제로 리스닝하는 포트입니다. 쉼표로 여러 개를 나열할 수 있습니다 |
| 환경 변수 | — | 목록 형태로 하나씩 입력하거나, 원시 편집기로 한 번에 붙여 넣습니다 |

이미지가 프라이빗 레지스트리에 있다면 생성 폼에서 자격 증명을 새로 입력하지 않고, 미리
등록해 둔 레지스트리 자격 증명 중에서 고릅니다. 아직 등록한 것이 없다면
[레지스트리 자격 증명](/inference/settings/registry-credentials) 에서 먼저 추가하세요.

vLLM 계열과 달리 포트가 고정돼 있지 않습니다. 이미지 안의 서버가 실제로 리스닝하는
포트를 정확히 입력해야 배포 후 [Service URL](/inference/serverless/service-url) 로 얻는
주소가 실제로 응답합니다.

## OpenAI 호환 경로는 자동으로 생기지 않습니다

`DOCKER_CUSTOM` 은 어떤 API 형태도 강제하지 않습니다. `/v1/chat/completions` 같은 표준
경로를 쓰고 싶다면 이미지 안에서 직접 그 인터페이스를 구현해 두어야 합니다. 이미지가
표준 vLLM 서버라면 애초에 [vLLM 엔드포인트 생성](/inference/serverless/create-vllm) 을
쓰는 편이 더 간단합니다.

## 만든 뒤

생성 요청은 접수만 하고 곧바로 돌아옵니다. 상태가 `available` 이 될 때까지 기다린 뒤
[엔드포인트 조회](/inference/serverless/list) 에서 진행 상황을 확인하세요.

## 다음

- [엔드포인트 조회](/inference/serverless/list)
- [레지스트리 자격 증명](/inference/settings/registry-credentials)
- [Service URL 확인](/inference/serverless/service-url)
