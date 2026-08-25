---
title: vLLM 카탈로그
---

# vLLM 카탈로그

::: warning 이 환경의 콘솔 메뉴에는 없습니다
이 배포의 관리자 앱 사이드바에는 vLLM 카탈로그 메뉴가 없습니다. 아래 설명은 기능 자체에 대한 것이고, 플랫폼 API 로는 그대로 쓸 수 있습니다.
설치 환경에 따라 메뉴가 노출되기도 합니다.
:::

vLLM 카탈로그는 특정 모델을 배포할 때 적용할 실행 오버라이드를 관리자가 미리 등록해 두는
곳입니다. 사용자가 vLLM 엔드포인트를 만들 때 모델 이름만 고르면, 여기 등록된
`vllm_config` 와 `env` 가 자동으로 적용됩니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/vllm-catalog?enabled=true"
```

`model_name`(정확 일치) · `enabled` 로 필터링합니다. 각 항목은 `id` · `model_name` ·
`enabled` · `vllm_config` · `env` · `source` · `notes` · `version` · 생성·수정 정보
(`created_at`/`created_by`/`updated_at`/`updated_by`)를 담습니다.

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/admin/vllm-catalog" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "qwen3-8b",
    "enabled": true,
    "vllm_config": {"max_model_len": 32768, "gpu_memory_utilization": 0.9},
    "env": {"VLLM_ATTENTION_BACKEND": "FLASH_ATTN"},
    "source": "internal",
    "notes": "8B 기본 배포 설정"
  }'
```

`vllm_config` 와 `env` 는 실제로 엔드포인트를 배포할 때와 **같은 검증**을 통과해야
저장됩니다. 잘못된 키나 값을 넣으면 생성 시점에 400 으로 걸립니다.

수정은 낙관적 잠금이 걸려 있습니다. `PATCH /admin/vllm-catalog/{id}` 요청에 현재
`version` 을 함께 보내야 하고, 어긋나면 409 가 돌아옵니다 — [API 레퍼런스](/api/)의
엔드포인트 수정과 같은 규칙입니다. 보낸 필드만 바뀝니다.

삭제도 `version` 이 필요합니다.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/vllm-catalog/$ID?version=2"
```

삭제는 소프트 삭제입니다. 같은 `model_name` 으로 새 항목을 다시 만들 수 있습니다.

## 다음

- [엔드포인트 수정](/admin/serverless/edit)
- [의존성(SBOM)](/admin/monitoring/dependencies)
