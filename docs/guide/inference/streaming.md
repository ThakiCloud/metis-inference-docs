---
title: 스트리밍
---

# 스트리밍

`stream: true` 를 주면 응답 전체가 완성될 때까지 기다리지 않고, 토큰이 생성되는 대로
서버 전송 이벤트(SSE)로 받습니다. 챗 UI 처럼 답변이 타이핑되듯 나타나야 하는 화면에
씁니다.

## 요청

`chat/completions` 와 `completions` 둘 다 `stream: true` 를 받습니다. 나머지 파라미터는
[OpenAI 호환 API](/guide/inference/openai-compatible) 와 동일합니다.

```json
{
  "model": "<your-model>",
  "messages": [{"role": "user", "content": "짧은 시를 하나 써줘."}],
  "stream": true
}
```

## 응답 형식

응답의 `Content-Type` 은 `text/event-stream` 이고, 본문은 `data: ` 로 시작하는 청크가
줄바꿈으로 이어지는 형태입니다. 각 청크는 완성된 응답이 아니라 그 시점까지 생성된 조각
하나(delta)를 담습니다.

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"봄"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" 바람이"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

첫 청크는 보통 `role` 만 담긴 빈 델타로 시작합니다. 이후 청크마다 `delta.content` 에
새로 생성된 텍스트 조각이 들어오고, 클라이언트는 이걸 이어 붙여 나가면 됩니다. 생성이
끝나면 `finish_reason` 이 `stop`(또는 `length`)으로 채워진 청크가 오고, 마지막으로
**`data: [DONE]`** 이 스트림 종료를 알립니다. 이 문자열은 JSON 이 아니라 리터럴
`[DONE]` 이므로 파싱 전에 먼저 확인해야 합니다.

`usage` 필드는 스트리밍 응답의 중간 청크에는 보통 들어오지 않습니다 — 토큰 수가 필요하면
스트리밍이 끝난 뒤 별도로 세거나, 스트리밍을 쓰지 않는 일반 요청으로 확인하세요.

## 클라이언트 구현

### shell (raw SSE)

`curl` 로 직접 받으면 각 줄을 그대로 출력합니다. 실제 애플리케이션에서는 `data: ` 접두를
잘라내고 JSON 을 파싱해 `[DONE]` 을 걸러야 합니다.

```bash
curl https://<your-endpoint-host>/v1/chat/completions \
  -N \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "messages": [{"role": "user", "content": "짧은 시를 하나 써줘."}],
    "stream": true
  }'
```

`-N` 은 curl 이 출력을 버퍼링하지 않고 청크가 오는 대로 바로 보여 주게 합니다.

### Python

OpenAI SDK 는 `stream=True` 를 주면 청크를 순회할 수 있는 이터레이터를 돌려줍니다.
`[DONE]` 처리와 JSON 파싱은 SDK 가 대신합니다.

```python
from openai import OpenAI

client = OpenAI(base_url="https://<your-endpoint-host>/v1", api_key="not-used")

stream = client.chat.completions.create(
    model="<your-model>",
    messages=[{"role": "user", "content": "짧은 시를 하나 써줘."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
print()
```

### Node.js

```javascript
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://<your-endpoint-host>/v1', apiKey: 'not-used' })

const stream = await client.chat.completions.create({
  model: '<your-model>',
  messages: [{ role: 'user', content: '짧은 시를 하나 써줘.' }],
  stream: true,
})

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content
  if (delta) process.stdout.write(delta)
}
console.log()
```

## 콜드 스타트와 함께 쓸 때

엔드포인트가 Scale-to-Zero 상태에서 깨어나는 중이면 스트리밍이라도 첫 청크가 오기까지는
그 지연을 그대로 겪습니다. 스트리밍은 "생성 중"을 실시간으로 보여줄 뿐, 모델 로딩 자체를
건너뛰지는 못합니다. 자세한 내용은 [콜드 스타트](/guide/inference/cold-start) 를
참고하세요.

## 다음

- [OpenAI 호환 API](/guide/inference/openai-compatible) — 비-스트리밍 요청·응답 형식
- [클라이언트 예제](/guide/inference/clients) — SDK·LangChain 붙이는 법
- [콜드 스타트와 Scale-to-Zero](/guide/inference/cold-start)
