---
title: OpenAI 호환 API
---

# OpenAI 호환 API

엔드포인트는 vLLM 이 그대로 노출하는 OpenAI 호환 서버입니다. 그래서 경로도, 요청·응답
필드도 OpenAI 의 표준 형식을 따릅니다. 이미 OpenAI SDK 나 OpenAI 호환 클라이언트를 쓰고
있다면 `base_url` 만 엔드포인트 주소로 바꾸면 코드는 그대로 동작합니다.

네 경로를 지원합니다.

| 경로 | 용도 |
|---|---|
| `POST /v1/chat/completions` | 대화형 추론. 대부분의 경우 이것을 씁니다 |
| `POST /v1/completions` | 단일 프롬프트 완성 (레거시 스타일) |
| `POST /v1/embeddings` | 임베딩. 임베딩 모델을 띄운 엔드포인트에서만 동작 |
| `GET /v1/models` | 이 엔드포인트가 서빙 중인 모델 이름 확인 |

## POST /v1/chat/completions

대부분의 애플리케이션이 쓰는 경로입니다. `messages` 배열로 대화를 보내고, 모델이 이어서
할 응답을 받습니다.

### 요청 파라미터

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `model` | string | ✓ | `/v1/models` 로 확인한 모델 이름 |
| `messages` | array | ✓ | `{"role": "system"\|"user"\|"assistant", "content": "..."}` 객체 배열 |
| `temperature` | number | — | 샘플링 온도. 낮을수록 결정적, 높을수록 다양해집니다 |
| `top_p` | number | — | 누적 확률 상위 p 만 샘플링(Top-p) |
| `max_tokens` | integer | — | 생성할 최대 토큰 수 |
| `n` | integer | — | 요청당 생성할 응답(choice) 개수 |
| `stop` | string \| array | — | 이 문자열이 나오면 생성을 멈춥니다 |
| `presence_penalty` | number | — | 이미 등장한 토큰 자체에 페널티(새 주제 유도) |
| `frequency_penalty` | number | — | 등장 빈도에 비례해 페널티(반복 억제) |
| `stream` | boolean | — | SSE 스트리밍 여부. [스트리밍](/guide/inference/streaming) 참고 |
| `user` | string | — | 요청을 보낸 사용자 식별용 문자열. 로그·사용량 추적에 쓰입니다 |

::: tip 기본값은 서버가 정합니다
생략한 파라미터는 엔드포인트의 vLLM 서버 기본값을 따릅니다. 그 값은 vLLM 버전과 실행
인자에 따라 다르므로 이 문서에 못 박지 않았습니다. 재현 가능한 결과가 필요하면
`temperature` 와 `max_tokens` 는 **명시적으로 지정하세요.** 특히 `max_tokens` 를 비워 두면
모델이 컨텍스트 한계까지 생성해 응답이 길고 느려질 수 있습니다.
:::

### 요청 예

::: code-group

```bash [shell]
curl https://<your-endpoint-host>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "messages": [
      {"role": "system", "content": "너는 간결하게 답하는 어시스턴트야."},
      {"role": "user", "content": "vLLM 이 뭔지 한 문장으로 설명해줘."}
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

```python [Python]
from openai import OpenAI

client = OpenAI(base_url="https://<your-endpoint-host>/v1", api_key="not-used")

response = client.chat.completions.create(
    model="<your-model>",
    messages=[
        {"role": "system", "content": "너는 간결하게 답하는 어시스턴트야."},
        {"role": "user", "content": "vLLM 이 뭔지 한 문장으로 설명해줘."},
    ],
    temperature=0.7,
    max_tokens=256,
)
print(response.choices[0].message.content)
```

```javascript [Node.js]
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://<your-endpoint-host>/v1', apiKey: 'not-used' })

const response = await client.chat.completions.create({
  model: '<your-model>',
  messages: [
    { role: 'system', content: '너는 간결하게 답하는 어시스턴트야.' },
    { role: 'user', content: 'vLLM 이 뭔지 한 문장으로 설명해줘.' },
  ],
  temperature: 0.7,
  max_tokens: 256,
})
console.log(response.choices[0].message.content)
```

:::

### 응답

```json
{
  "id": "chatcmpl-8f3a1c2e9b1d4e6f8a0c2d4e6f8a0c2d",
  "object": "chat.completion",
  "created": 1735000000,
  "model": "<your-model>",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "vLLM 은 PagedAttention 으로 KV 캐시를 효율적으로 관리해 대형 언어 모델을 빠르게 서빙하는 오픈소스 추론 엔진입니다."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 34,
    "completion_tokens": 42,
    "total_tokens": 76
  }
}
```

`finish_reason` 은 정상 종료면 `stop`, `max_tokens` 에 걸려 잘렸으면 `length` 입니다.
`n` 을 1보다 크게 주면 `choices` 배열에 그만큼 항목이 늘어납니다.

## POST /v1/completions

메시지 구조 없이 프롬프트 문자열 하나를 그대로 이어 쓰게 합니다. 대화형이 필요 없는
단발 완성 작업에 씁니다.

::: code-group

```bash [shell]
curl https://<your-endpoint-host>/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "prompt": "다음 문장을 이어서 완성해줘: 서울에서 부산까지 가는 가장 빠른 방법은",
    "max_tokens": 128
  }'
```

```python [Python]
from openai import OpenAI

client = OpenAI(base_url="https://<your-endpoint-host>/v1", api_key="not-used")

response = client.completions.create(
    model="<your-model>",
    prompt="다음 문장을 이어서 완성해줘: 서울에서 부산까지 가는 가장 빠른 방법은",
    max_tokens=128,
)
print(response.choices[0].text)
```

```javascript [Node.js]
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://<your-endpoint-host>/v1', apiKey: 'not-used' })

const response = await client.completions.create({
  model: '<your-model>',
  prompt: '다음 문장을 이어서 완성해줘: 서울에서 부산까지 가는 가장 빠른 방법은',
  max_tokens: 128,
})
console.log(response.choices[0].text)
```

:::

응답 구조는 `chat.completions` 와 비슷하되 `choices[].message` 대신 `choices[].text` 에
생성된 문자열이 그대로 들어갑니다.

## POST /v1/embeddings

텍스트를 벡터로 변환합니다. 임베딩 모델을 서빙하는 엔드포인트에서만 동작하고, 텍스트
생성 모델에 이 경로를 호출하면 에러가 납니다.

::: code-group

```bash [shell]
curl https://<your-endpoint-host>/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "input": "임베딩으로 변환할 문장입니다."
  }'
```

```python [Python]
from openai import OpenAI

client = OpenAI(base_url="https://<your-endpoint-host>/v1", api_key="not-used")

response = client.embeddings.create(
    model="<your-model>",
    input="임베딩으로 변환할 문장입니다.",
)
print(response.data[0].embedding[:5], "...")
```

```javascript [Node.js]
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://<your-endpoint-host>/v1', apiKey: 'not-used' })

const response = await client.embeddings.create({
  model: '<your-model>',
  input: '임베딩으로 변환할 문장입니다.',
})
console.log(response.data[0].embedding.slice(0, 5), '...')
```

:::

```json
{
  "object": "list",
  "data": [
    { "object": "embedding", "index": 0, "embedding": [0.0123, -0.0456, 0.0789] }
  ],
  "model": "<your-model>",
  "usage": { "prompt_tokens": 8, "total_tokens": 8 }
}
```

`input` 은 문자열 하나뿐 아니라 문자열 배열도 받습니다 — 여러 텍스트를 한 번에
임베딩하면 `data` 배열에 그만큼 항목이 생깁니다.

## GET /v1/models

이 엔드포인트가 서빙 중인 모델 이름을 확인합니다. `model` 필드에 정확히 뭘 넣어야 할지
헷갈릴 때 가장 먼저 호출해 보는 경로입니다.

```bash
curl https://<your-endpoint-host>/v1/models
```

```json
{
  "object": "list",
  "data": [
    { "id": "<your-model>", "object": "model", "created": 1735000000, "owned_by": "vllm" }
  ]
}
```

## 다음

- [스트리밍](/guide/inference/streaming) — `stream: true` 로 토큰을 실시간으로 받기
- [클라이언트 예제](/guide/inference/clients) — SDK·LangChain 붙이는 법
- [에러 처리](/guide/inference/errors) — 잘못된 요청·한도 초과 시 응답
