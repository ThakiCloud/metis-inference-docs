---
title: 워크로드 타입
---

# 워크로드 타입

엔드포인트를 만들 때 워크로드 타입을 고릅니다. 콘솔 화면에서 고를 수 있는 타입은
네 가지입니다.

| 타입 | 언제 고르나 | 서버 |
|---|---|---|
| **VLLM** | GPU 로 텍스트 생성 모델을 서빙할 때. 대부분의 경우 이것 | vLLM (GPU) |
| **VLLM_CPU** | GPU 없이 가볍게 서빙하거나 테스트할 때 | vLLM (CPU) |
| **VLLM_RBLN** | Rebellions NPU 하드웨어에서 서빙할 때 | vLLM (Rebellions NPU) |
| **DOCKER_CUSTOM** | 표준 vLLM 서버로 안 되는, 직접 만든 이미지를 띄울 때 | 사용자 정의 컨테이너 |

::: tip API 에는 이 네 가지 말고도 있습니다
플랫폼 API 는 `SGLANG`·`COMFYUI`·`AXOLOTL_FINE_TUNING` 워크로드 타입도 받습니다. 다만
이 세 가지는 **콘솔 화면에는 노출되지 않고 API 로만** 쓸 수 있습니다. 이 문서는 콘솔에
보이는 네 가지를 기준으로 설명합니다.
:::

## VLLM — 기본 선택지

GPU 위에서 vLLM 의 OpenAI 호환 서버를 띄웁니다. HuggingFace 모델 ID 를 그대로 `model`
에 넣으면 되고, 서비스 포트는 **8000 으로 고정**입니다.

필수 입력은 `model`·`name`·`workload_type` 뿐이고, 나머지는 기본값이 있습니다.

```json
{
  "name": "my-vllm-endpoint",
  "model": "<your-model>",
  "workload_type": "VLLM",
  "gpu": 1,
  "workload_config": {
    "max_model_len": 4096,
    "tensor_parallel": 1
  }
}
```

`workload_config` 로 컨텍스트 길이(`max_model_len`)와 텐서 병렬 개수(`tensor_parallel`)를
조정할 수 있습니다. 모델이 여러 GPU 에 걸쳐야 하면 `tensor_parallel` 을 GPU 개수와
맞춥니다.

## VLLM_CPU — GPU 없이

GPU 필드와 `workload_type` 필드 자체가 요청에서 빠집니다. 나머지는 VLLM 과 거의
동일하고, 포트도 8000 고정입니다. 가벼운 모델을 테스트하거나 GPU 예산을 쓰고 싶지 않을
때 씁니다. GPU 서빙 대비 처리량이 낮으므로 프로덕션 트래픽에는 권장하지 않습니다.

## VLLM_RBLN — Rebellions NPU

Rebellions NPU 로 서빙합니다. 다른 타입과 다른 점이 셋 있습니다.

- `cluster_id` 가 **필수**입니다 (NPU 를 가진 특정 클러스터를 지정해야 합니다).
- `model_path` 가 **필수**이고, `s3://bucket/key` 형태만 받습니다. HuggingFace 에서 바로
  당겨오지 않습니다.
- `npu_count` 가 **필수**입니다 (1~16, 파드당 NPU 개수).
- `hf_token` 은 받지 않습니다 — RBLN 은 S3 모델만 지원하므로 HuggingFace 토큰을 보내면
  거부됩니다.

```json
{
  "name": "my-rbln-endpoint",
  "model": "<your-model>",
  "model_path": "s3://models/<your-model>",
  "cluster_id": "<rbln-cluster-id>",
  "npu_count": 4,
  "workload_config": { "max_model_len": 4096 }
}
```

## DOCKER_CUSTOM — 직접 만든 이미지

표준 vLLM 서버로 감당이 안 되는 모델·파이프라인을 자기 컨테이너 이미지로 띄웁니다. 포트는
vLLM 계열처럼 고정돼 있지 않고 **엔드포인트를 만들 때 직접 지정**하며, 여러 포트를 CSV 로
나열할 수도 있습니다.

```json
{
  "name": "my-custom-endpoint",
  "model": "<your-model>",
  "workload_type": "DOCKER_CUSTOM",
  "workload_config": {
    "image_uri": "<your-registry>/<your-image>:<tag>",
    "ports": [8080],
    "primary_port": 8080,
    "env": { "MODEL_PATH": "/models/<your-model>" }
  }
}
```

OpenAI 호환 경로(`/v1/chat/completions` 등)를 그대로 쓰고 싶다면 이미지 안에서 직접
그 인터페이스를 구현해야 합니다 — `DOCKER_CUSTOM` 자체는 어떤 API 형태도 강제하지
않습니다.

## 어떻게 고를까

- 텍스트 생성 모델이고 GPU 를 쓸 수 있다 → **VLLM**
- GPU 없이 테스트만 한다 → **VLLM_CPU**
- Rebellions NPU 클러스터를 쓴다 → **VLLM_RBLN**
- 표준 vLLM 으로 안 되는 서빙 로직이 필요하다 → **DOCKER_CUSTOM**

## 다음

- [핵심 개념](/guide/concepts) — 워크로드가 엔드포인트·클러스터와 어떻게 엮이는지
- [엔드포인트 URL](/guide/inference/endpoint-url) — 포트가 주소 규칙에 어떻게 들어가는지
- [OpenAI 호환 API](/guide/inference/openai-compatible)
