---
title: 클라이언트 예제
---

# 클라이언트 예제

엔드포인트는 표준 OpenAI 호환 서버이므로 기존 OpenAI 클라이언트·프레임워크에 `base_url`
만 바꿔서 그대로 붙일 수 있습니다. 이 페이지는 흔히 쓰는 클라이언트별로 붙이는 법을
모아 둡니다.

## OpenAI Python SDK

가장 직접적인 방법입니다. `openai` 패키지를 설치하고 `base_url` 을 엔드포인트 주소로
바꿉니다.

```bash
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://<your-endpoint-host>/v1",
    api_key="not-used",  # 인증이 걸린 환경이면 실제 키를 넣습니다
)

response = client.chat.completions.create(
    model="<your-model>",
    messages=[{"role": "user", "content": "안녕하세요"}],
)
print(response.choices[0].message.content)
```

환경 변수로 관리하고 싶다면 `OPENAI_BASE_URL`·`OPENAI_API_KEY` 를 설정해 두는 것만으로도
`OpenAI()` 생성자에 인자를 넘기지 않고 동작합니다.

```bash
export OPENAI_BASE_URL="https://<your-endpoint-host>/v1"
export OPENAI_API_KEY="not-used"
```

## OpenAI Node.js SDK

```bash
npm install openai
```

```javascript
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://<your-endpoint-host>/v1',
  apiKey: 'not-used', // 인증이 걸린 환경이면 실제 키를 넣습니다
})

const response = await client.chat.completions.create({
  model: '<your-model>',
  messages: [{ role: 'user', content: '안녕하세요' }],
})
console.log(response.choices[0].message.content)
```

Python 과 마찬가지로 `OPENAI_BASE_URL`·`OPENAI_API_KEY` 환경 변수를 읽습니다.

## LangChain

`ChatOpenAI` 에 `base_url` 을 넘기면 됩니다. 별도의 Metis 전용 통합은 필요 없습니다 —
엔드포인트가 표준 OpenAI 인터페이스를 그대로 노출하기 때문입니다.

```bash
pip install langchain-openai
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://<your-endpoint-host>/v1",
    api_key="not-used",
    model="<your-model>",
    temperature=0.7,
)

response = llm.invoke("vLLM 이 뭔지 한 문장으로 설명해줘.")
print(response.content)
```

체인이나 에이전트 안에서 쓸 때도 다른 `ChatOpenAI` 인스턴스와 동일하게 다루면 됩니다 —
스트리밍(`llm.stream(...)`)도 그대로 지원됩니다.

## shell (curl)

SDK 없이 순수 HTTP 로 호출할 때는 `curl` 이 가장 빠릅니다. CI 스크립트나 헬스체크에
자주 씁니다.

```bash
curl https://<your-endpoint-host>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "messages": [{"role": "user", "content": "안녕하세요"}]
  }'
```

응답만 텍스트로 뽑아내고 싶다면 `jq` 를 함께 씁니다.

```bash
curl -s https://<your-endpoint-host>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"<your-model>","messages":[{"role":"user","content":"안녕하세요"}]}' \
  | jq -r '.choices[0].message.content'
```

## 여러 프레임워크를 동시에 쓸 때 공통으로 챙길 것

- `base_url` 끝에 **`/v1`** 을 붙입니다. 엔드포인트 주소 자체(`https://<your-endpoint-host>`)
  에는 붙어 있지 않으므로 클라이언트 설정에서 빠뜨리기 쉽습니다.
- `api_key` 는 인증이 없는 환경에서도 빈 문자열이 아니라 아무 문자열이나(`"not-used"` 등)
  넣어야 합니다. 대부분의 SDK 가 빈 값이면 클라이언트 생성 단계에서 에러를 냅니다. 어느
  쪽이 필요한지는 [인증](/guide/inference/authentication) 을 참고하세요.
- 콜드 스타트를 겪을 수 있는 엔드포인트라면 타임아웃을 넉넉히 설정합니다. 자세한 내용은
  [콜드 스타트](/guide/inference/cold-start) 를 참고하세요.

## 다음

- [OpenAI 호환 API](/guide/inference/openai-compatible) — 요청·응답 필드 전체
- [인증](/guide/inference/authentication) — `api_key` 에 무엇을 넣어야 하는지
- [에러 처리](/guide/inference/errors)
