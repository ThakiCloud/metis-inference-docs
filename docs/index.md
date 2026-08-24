---
layout: home

hero:
  name: Metis 추론 가이드
  text: 배포한 모델을 OpenAI 호환으로 호출한다
  tagline: 엔드포인트를 만들면 전용 주소가 나옵니다. 기존 OpenAI 클라이언트에서 base URL 만 바꾸면 끝입니다.
  actions:
    - theme: brand
      text: 60초 만에 첫 추론
      link: /guide/quickstart
    - theme: alt
      text: AI Inference 앱 사용법
      link: /inference/
    - theme: alt
      text: API 레퍼런스
      link: /api/

features:
  - title: 전용 엔드포인트 주소
    details: 엔드포인트마다 자기 서브도메인이 생깁니다. 콘솔을 거치지 않고 애플리케이션이 직접 호출합니다.
    link: /guide/inference/endpoint-url
  - title: OpenAI 호환
    details: vLLM 의 OpenAI 호환 서버라 /v1/chat/completions 경로와 요청·응답 형식이 표준 그대로입니다.
    link: /guide/inference/openai-compatible
  - title: Scale-to-Zero
    details: 트래픽이 없으면 0으로 줄었다가 요청이 오면 깨어납니다. 첫 요청 지연을 다루는 법을 안내합니다.
    link: /guide/inference/cold-start
  - title: 관리자 운영
    details: 테넌트 전체 엔드포인트·노드·사용량 추세·토큰 미터링·가격 정책을 관리자 앱에서 봅니다.
    link: /admin/
---

## 60초 안에 첫 추론

엔드포인트를 하나 만들고 나면 아래 한 덩어리가 그대로 돕니다.
`<your-endpoint-host>` 자리에 콘솔의 **Service URL** 값을 넣으세요.

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
    api_key="not-used",  # 인증 설정은 guide/inference/authentication 참고
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
  apiKey: 'not-used', // 인증 설정은 guide/inference/authentication 참고
})

const response = await client.chat.completions.create({
  model: '<your-model>',
  messages: [{ role: 'user', content: '자기소개를 한 문장으로 해줘.' }],
})
console.log(response.choices[0].message.content)
```

:::

응답은 OpenAI Chat Completions 형식 그대로입니다.

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "<your-model>",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "..." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 21, "completion_tokens": 18, "total_tokens": 39 }
}
```

::: warning 콘솔 프록시 API 로 추론하지 마세요
플랫폼 API 에는 `POST /projects/{project_id}/endpoints/{endpoint_id}/chat` 같은 경로가 있지만,
이것은 **콘솔 플레이그라운드 전용**입니다. 애플리케이션은 위처럼 엔드포인트 자신의 주소를
직접 호출해야 합니다. 이유는 [콘솔 프록시 API](/guide/inference/console-proxy) 에 정리했습니다.
:::

## 어디부터 읽을까

| 지금 하려는 것 | 읽을 곳 |
|---|---|
| 모델을 처음 띄워 본다 | [빠른 시작](/guide/quickstart) |
| 내 코드에서 호출한다 | [엔드포인트 URL](/guide/inference/endpoint-url) → [OpenAI 호환 API](/guide/inference/openai-compatible) |
| 첫 요청이 느린 이유가 궁금하다 | [콜드 스타트](/guide/inference/cold-start) |
| 콘솔 화면 사용법을 찾는다 | [AI Inference 앱](/inference/) |
| 테넌트 전체를 운영한다 | [Admin AI Inference 앱](/admin/) |
| 엔드포인트 스펙을 본다 | [API 레퍼런스](/api/) |
