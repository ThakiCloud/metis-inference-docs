---
title: 알려진 스펙 문제
---

# 알려진 스펙 문제

OpenAPI 스펙과 서버의 실제 동작이 어긋나는 곳입니다. 스펙만 보고 코드를 짜면 걸리는
것들이라 따로 모았습니다. 고쳐지면 이 페이지에서 지웁니다.

## 설명에는 필수인데 `required` 에 없는 필드

스펙의 `required` 배열만 신뢰하면 400 을 받습니다. 필드 설명을 함께 읽으세요.

| 정의 | 필드 | 실제 |
|---|---|---|
| `endpoint.CreateVLLMRBLNEndpointRequest` | `cluster_id` | **필수**. 빠지면 거부됩니다 |
| `endpoint.CreateEndpointRequest` | `workload_config` | 워크로드 타입에 따라 사실상 필수 |
| `endpoint.CreateSGLANGEndpointRequest` | `workload_config` | 위와 같음 |
| `ChatCompletionRequest` | `messages` | 필수 |
| `templateshandler.RestoreRequest` | `new_name` | 이름이 충돌할 때 필수 |

가장 자주 걸리는 것은 첫 줄입니다. **NPU 엔드포인트를 만들 때 `cluster_id` 는 반드시
넣어야 합니다.** 자세한 제약은 [NPU 로 서빙하기](/guide/npu)에 있습니다.

## 파라미터 기본값을 스펙에서 읽지 마세요

`ChatCompletionRequest` 의 `temperature` · `max_tokens` · `top_p` 에는 기본값이 적혀
있는데, 그 값은 **콘솔 프록시**가 적용하는 것입니다. 문서가 권장하는 방식대로
[엔드포인트 주소로 직접 호출](/guide/inference/endpoint-url)하면 vLLM 서버의 기본값이
적용되고, 그 값은 버전과 실행 인자에 따라 다릅니다.

재현 가능한 결과가 필요하면 `temperature` 와 `max_tokens` 를 **명시적으로 지정하세요.**

## 스펙에 없지만 알아야 하는 것

| 사실 | 왜 중요한가 |
|---|---|
| 클러스터 목록 경로 없음 | 관리자 화면에는 연결된 클러스터가 보입니다. API 로는 리소스 인벤토리·가용량으로 대신합니다 |
| `host` 가 스펙에 `your-console-host` | 이 문서가 공개라 실 호스트를 넣지 않았습니다. 자신의 콘솔 주소로 바꿔 쓰세요 |

## 문제를 발견하셨다면

스펙과 실제 동작이 다른 곳을 더 찾으시면
<a href="https://github.com/ThakiCloud/metis-inference-docs/issues" target="_blank" rel="noreferrer">이슈</a>로
알려 주세요. 어떤 요청을 보냈고 무엇을 기대했으며 무엇을 받았는지 세 줄이면 충분합니다.

## 다음

- [프로그래밍 방식 제어](/api/automation)
- [공통 규약](/api/conventions)
- [에러 코드](/api/errors)
