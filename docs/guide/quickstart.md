---
title: 빠른 시작 — 60초 첫 추론
---

# 빠른 시작 — 60초 첫 추론

콘솔에서 엔드포인트 하나를 만들고, 배포가 끝나길 기다렸다가, 실제로 호출까지 해 봅니다.
모델을 처음 올려 보는 경우 이 페이지 하나로 끝까지 갈 수 있습니다.

## 1. 엔드포인트 생성

AI Inference 앱의 서버리스 엔드포인트 화면에서 새 엔드포인트를 만듭니다. 워크로드
타입은 대부분의 경우 **VLLM** 을 고르면 됩니다. GPU 를 쓰지 않는 환경이거나 가볍게
테스트만 하고 싶다면 **VLLM_CPU** 도 있습니다. 타입별 차이는
[워크로드 타입](/guide/workload-types) 에 정리돼 있습니다.

최소한으로 채워야 하는 값은 이렇습니다.

| 항목 | 예시 | 비고 |
|---|---|---|
| 이름 | `my-first-endpoint` | 3~50자, DNS 호환 문자열 |
| 모델 | `<your-model>` | HuggingFace 모델 ID |
| GPU 개수 | `1` | VLLM_CPU 는 해당 없음 |

나머지 필드(레플리카 수, 스케일링 타이밍, 리소스 사이징 등)는 기본값 그대로 두어도
됩니다. `min_replica` 는 기본이 `0` 이라 트래픽이 없으면 자동으로 줄어듭니다 — 이 동작은
[콜드 스타트](/guide/inference/cold-start) 에서 자세히 다룹니다.

## 2. 상태가 available 이 될 때까지 기다린다

엔드포인트는 생성 직후 `pending` → `creating` 상태를 거칩니다. 이미지를 당기고 모델
가중치를 불러오는 동안이라 모델 크기에 따라 시간이 걸립니다. 콘솔의 엔드포인트 목록에서
상태가 **`available`** 로 바뀌면 호출할 준비가 된 것입니다.

API 로 상태를 폴링하려면 엔드포인트 상세를 반복 조회하며 `status` 필드를 봅니다.

```bash
curl -s -H "Authorization: Bearer $METIS_TOKEN" \
  "https://<your-console-host>/api/v1/metis/projects/$PROJECT_ID/endpoints/$ENDPOINT_ID" \
  | jq -r '.status'
```

상태값 전체는 `pending`·`creating`·`queued`·`available`·`paused`·`failed`·`terminating`·
`terminated` 입니다. `failed` 가 나오면 콘솔의 로그 화면에서 원인을 확인하세요.

## 3. Service URL 확인

`available` 이 되면 `service_url` 필드가 채워집니다. 콘솔에서는 엔드포인트 행의 액션
메뉴에서 **Service URL** 을 열어 복사할 수 있습니다. 이 값이 곧 애플리케이션이 호출할
주소입니다. 자세한 규칙은 [엔드포인트 URL](/guide/inference/endpoint-url) 을 참고하세요.

## 4. 호출

받은 주소를 `<your-endpoint-host>` 자리에 넣어 호출합니다.

::: code-group

```bash [shell]
curl https://<your-endpoint-host>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "messages": [{"role": "user", "content": "자기소개를 한 문장으로 해줘."}]
  }'
```

```python [Python]
from openai import OpenAI

client = OpenAI(
    base_url="https://<your-endpoint-host>/v1",
    api_key="not-used",  # 인증이 필요한 환경이면 실제 키를 넣습니다
)

response = client.chat.completions.create(
    model="<your-model>",
    messages=[{"role": "user", "content": "자기소개를 한 문장으로 해줘."}],
)
print(response.choices[0].message.content)
```

```javascript [Node.js]
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://<your-endpoint-host>/v1',
  apiKey: 'not-used', // 인증이 필요한 환경이면 실제 키를 넣습니다
})

const response = await client.chat.completions.create({
  model: '<your-model>',
  messages: [{ role: 'user', content: '자기소개를 한 문장으로 해줘.' }],
})
console.log(response.choices[0].message.content)
```

:::

첫 요청이 유독 느리게 느껴지면 정상입니다. `min_replica` 가 `0` 인 엔드포인트는 트래픽이
끊기면 파드가 내려가고, 다음 요청이 다시 깨웁니다. 이 동작과 대응법은
[콜드 스타트](/guide/inference/cold-start) 에서 다룹니다.

인증 관련 401·403 을 만났다면 [인증](/guide/inference/authentication) 을,
그 외 에러는 [에러 처리](/guide/inference/errors) 를 확인하세요.

## 다음

- [핵심 개념](/guide/concepts) — 프로젝트·엔드포인트·워크로드가 어떻게 엮이는지
- [OpenAI 호환 API](/guide/inference/openai-compatible) — 요청·응답 형식 전체
- [콜드 스타트](/guide/inference/cold-start) — Scale-to-Zero 동작
