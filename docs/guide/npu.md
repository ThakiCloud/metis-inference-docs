---
title: NPU 로 서빙하기
---

# NPU 로 서빙하기 (Rebellions)

Rebellions NPU 로 모델을 서빙할 때는 GPU 와 규칙이 몇 가지 다릅니다. 그 차이가 스펙 곳곳에
흩어져 있어서 여기 한자리에 모았습니다. **다르게 동작하는 것만** 적었고, 나머지는 다른
워크로드 타입과 같습니다.

## 전용 생성 경로를 씁니다

```
POST /api/v1/metis/projects/{project_id}/endpoints/vllm-rbln
```

NPU 는 자기 경로가 따로 있습니다. 범용 생성 경로(`POST .../endpoints`)에
`workload_type: "VLLM_RBLN"` 을 넣어도 요청 자체는 받아들여지지만, **전용 경로를 쓰세요.**
전용 경로는 아래 네 가지 제약을 요청 시점에 검사해 어떤 필드가 왜 틀렸는지 알려 줍니다.
범용 경로는 그 검증을 거치지 않아, 잘못된 조합이 배포 단계까지 가서야 드러납니다.

## 반드시 지켜야 하는 제약 네 가지

| 항목 | 규칙 | 어기면 |
|---|---|---|
| `cluster_id` | **필수** | 거부됩니다. 스펙의 `required` 배열에는 빠져 있으니 주의하세요 |
| `model_path` | **`s3://` 경로만** | HuggingFace 에서 직접 받지 않습니다 |
| `hf_token` | **넣지 마세요** | 서비스가 400 으로 거부합니다. NPU 는 S3 전용입니다 |
| `npu_count` | 1~16, 단 **모델이 정합니다** | 콘솔에서는 편집이 잠겨 있습니다 |

포트는 8000 이 기본이고 서버리스 엔드포인트에서는 이 값을 씁니다.

## 요청 예

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/projects/$PROJECT_ID/endpoints/vllm-rbln" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-rbln-endpoint",
    "cluster_id": "<your-cluster-id>",
    "model": "<your-model>",
    "model_path": "s3://<bucket>/<key>",
    "npu_count": 4,
    "min_replica": 0,
    "max_replica": 1,
    "port": 8000
  }'
```

`name` 은 3~50자에 소문자·숫자·하이픈만 쓰는 DNS-1123 규칙을 따릅니다.

## 만들고 나면

배포가 끝나 상태가 `available` 이 되면 `service_url` 이 채워집니다. 그 주소로 OpenAI 호환
요청을 보내면 됩니다 — NPU 라고 해서 호출 규약이 달라지지 않습니다.

```bash
curl https://<your-endpoint-host>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"<your-model>","messages":[{"role":"user","content":"안녕"}]}'
```

주소를 얻는 방법은 [엔드포인트 URL](/guide/inference/endpoint-url),
요청·응답 형식은 [OpenAI 호환 API](/guide/inference/openai-compatible)에 있습니다.

## NPU 자원이 얼마나 남았는지

배포 전에 여유를 확인하려면 인프라 모니터링 API 를 씁니다. 가속기 인벤토리는 NVIDIA GPU 와
Rebellions NPU 를 함께 분류합니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/resource-inventory"
```

활용도 조회도 두 가속기를 함께 읽습니다 — [인프라 모니터링 API](/admin/monitoring/api).

## 다음

- [워크로드 타입](/guide/workload-types)
- [Rebellions vLLM 엔드포인트 생성](/inference/serverless/create-vllm-rbln) — 콘솔 화면
- [알려진 스펙 문제](/api/known-issues)
