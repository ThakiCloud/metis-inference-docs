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

## 문서대로 불러도 실패하는 곳

스펙이 아니라 **서버 동작**이 문서와 어긋나는 자리입니다. 실제로 호출해서 확인한 것만 적었습니다.

### 인프라 모니터링은 `cluster` 를 생략하면 안 됩니다

문서는 `cluster` 를 선택 파라미터로 안내합니다. 멀티 클러스터 환경에서는 사실상 필수입니다.
생략하면 세 경로가 서로 다른 방식으로 어긋납니다.

| 경로 | `cluster` 생략 | `cluster` 지정 |
|---|---|---|
| `GET /admin/kueue/resource-inventory` | `500 INTERNAL_ERROR` (`failed to list resource flavors`) | 정상 |
| `GET /admin/kueue/metrics/cluster` | `500 INTERNAL_ERROR` (`Failed to get cluster metrics`) | 정상 |
| `GET /admin/kueue/resources/availability` | 200 이지만 워크로드 클러스터가 아닌 값. 가속기가 `nvidia-gpu` 로 `total: 0` 이라 NPU 가 보이지 않습니다 | NPU 가 정상으로 잡힙니다 |

세 번째가 특히 조용합니다. 200 이 오고 형식도 맞아서 값을 그대로 믿기 쉽습니다. 배포 전 여유를
확인하려고 부르는 경로인데, 생략하면 가속기가 0 으로 보여 잘못된 판단을 하게 됩니다.

```bash
# 이렇게 부르세요
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/resources/availability?cluster=<your-cluster-id>"
```

클러스터 ID 는 엔드포인트나 워크로드를 조회하면 `cluster_id` 필드로 나옵니다.

### `POST /auth/refresh` 는 환경에 따라 쓸 수 없습니다

IAM SSO 가 토큰 수명을 관리하는 환경에서는 이 경로가 `401` 을 돌려줍니다.

```json
{ "error": "UNAUTHORIZED", "message": "token refresh is managed by Thaki IAM SSO" }
```

이런 환경에서는 만료된 토큰을 갱신하지 말고 `POST /auth/login` 으로 다시 받으세요. 자동화
코드라면 401 을 받았을 때 재로그인하는 흐름 하나만 두는 편이 간단합니다.

### 콘솔 프록시는 업스트림 오류를 `500` 으로 덮습니다

임베딩 모델이 아닌 엔드포인트에 임베딩을 요청하면, 부르는 경로에 따라 받는 답이 달라집니다.

| 호출 방식 | 응답 |
|---|---|
| 엔드포인트 주소로 직접 `POST /v1/embeddings` | `404 {"detail":"Not Found"}` — 원인이 드러납니다 |
| 콘솔 프록시 `POST /projects/{id}/endpoints/{eid}/embed` | `500 SERVER_ERROR` `Unexpected server error` |

프록시 쪽 500 만 보면 서버가 고장난 것처럼 읽히지만 실제로는 모델이 그 경로를 지원하지 않는
것입니다. 원인을 확인할 때는 엔드포인트 주소로 직접 불러 보세요.

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
