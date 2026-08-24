---
title: 에러 처리
---

# 에러 처리

엔드포인트가 돌려주는 HTTP 상태 코드별로 의미와 흔한 원인, 그리고 어떻게 대응하면
되는지를 정리했습니다. 플랫폼 API(`/api/v1/metis/...`)가 아니라 **추론 엔드포인트 자신의
주소**를 호출했을 때 받는 응답 기준입니다.

| 상태 | 의미 | 흔한 원인 | 조치 |
|---|---|---|---|
| `400` | 잘못된 요청 | JSON 형식 오류, 지원하지 않는 필드, `messages` 가 비어 있음 | 요청 본문을 다시 확인. 에러 메시지에 어떤 필드가 문제인지 담겨 있는 경우가 많습니다 |
| `401` | 인증 필요 | 게이트웨이가 인증을 요구하는 환경인데 `api_key`/`Authorization` 헤더를 안 보냄 | [인증](/guide/inference/authentication) 확인 후 발급받은 키를 붙여 재요청 |
| `403` | 인증은 됐지만 권한 없음 | 키는 유효하지만 이 엔드포인트에 대한 접근 권한이 없음 | 키 발급자에게 권한 확인 요청 |
| `404` | 대상 없음 | 엔드포인트 주소가 틀림, 엔드포인트가 삭제됨, 경로 오타(`/v1/chat/completion` 등) | 주소와 경로 철자를 다시 확인. 엔드포인트가 살아 있는지 콘솔에서 확인 |
| `408` | 요청 타임아웃 | 게이트웨이나 클라이언트가 응답을 기다리다 먼저 포기함(콜드 스타트 중 특히 흔함) | 클라이언트 타임아웃을 늘리고 재시도. [콜드 스타트](/guide/inference/cold-start) 참고 |
| `422` | 처리할 수 없는 요청 | 필드 값은 유효한 JSON 이지만 의미상 잘못됨(예: 임베딩 모델에 `messages` 를 보냄, `max_tokens` 가 모델 한도 초과) | 워크로드 타입과 요청 경로가 맞는지, 파라미터 값이 모델 한도 안인지 확인 |
| `429` | 요청 한도 초과 | 키에 걸린 RPS/RPM/월 토큰 한도 초과 | 지수 백오프 후 재시도. 한도 자체는 [사용 한도](/guide/inference/limits) 참고 |
| `500` | 서버 내부 오류 | 모델 서버(vLLM) 내부 예외 | 같은 요청을 한 번 더 시도해 보고, 반복되면 요청 내용(특히 프롬프트 길이·특수 문자)을 의심 |
| `502` | 게이트웨이 오류 | 파드가 아직 준비되지 않았거나 막 재시작된 직후 | 잠시 후 재시도. 지속되면 콘솔에서 엔드포인트 상태 확인 |
| `503` | 서비스 이용 불가 | 파드가 없거나(Scale-to-Zero) 자원 부족으로 스케줄 대기 중 | 콜드 스타트 진행 중일 가능성이 높음. 넉넉한 타임아웃으로 재시도 |
| `504` | 게이트웨이 타임아웃 | 콜드 스타트 중 파드가 뜨는 데 게이트웨이 대기 한도보다 오래 걸림 | 아래 "Scale-to-Zero 와 504" 참고 |

## Scale-to-Zero 와 504·타임아웃

`min_replica: 0` 인 엔드포인트가 유휴 상태에서 처음 요청을 받으면, 파드가 뜨고 모델을
로드하는 동안 그 요청은 대기합니다. 이 대기가 게이트웨이나 클라이언트의 타임아웃 한도를
넘으면 `504`(게이트웨이 타임아웃) 또는 클라이언트 쪽 타임아웃 예외로 나타납니다. 이건
엔드포인트가 고장난 것이 아니라 **아직 깨어나는 중**인 상태입니다.

대응은 두 갈래입니다.

1. **재시도 쪽**: 첫 요청이 타임아웃되면 곧바로 같은 요청을 다시 보냅니다. 파드가 이미
   떠서 준비 중이었다면 재시도는 대개 훨씬 빨리 성공합니다.
2. **회피 쪽**: 지연 자체가 문제라면 [콜드 스타트](/guide/inference/cold-start) 의
   `min_replica` 상향이나 미리 깨워 두기(wake)를 검토합니다.

## 재시도 전략 — 지수 백오프

`429`·`503`·`504` 처럼 일시적인 상태 코드는 무작정 바로 재시도하기보다 대기 시간을
점점 늘려가며 재시도하는 편이 안전합니다. 짧은 간격으로 계속 재시도하면 이미 부하가 걸린
엔드포인트에 부하를 더 얹을 뿐입니다.

::: code-group

```bash [shell]
for i in 1 2 3 4; do
  status=$(curl -s -o /tmp/resp.json -w "%{http_code}" \
    https://<your-endpoint-host>/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"model":"<your-model>","messages":[{"role":"user","content":"안녕"}]}')
  if [ "$status" -lt 500 ] && [ "$status" != "429" ]; then
    cat /tmp/resp.json
    break
  fi
  sleep $((2 ** i))
done
```

```python [Python]
import time
from openai import OpenAI, APIStatusError

client = OpenAI(base_url="https://<your-endpoint-host>/v1", api_key="not-used")

def call_with_backoff(**kwargs):
    for attempt in range(5):
        try:
            return client.chat.completions.create(**kwargs)
        except APIStatusError as e:
            if e.status_code not in (429, 500, 502, 503, 504):
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("재시도 한도를 초과했습니다")

response = call_with_backoff(
    model="<your-model>",
    messages=[{"role": "user", "content": "안녕하세요"}],
)
print(response.choices[0].message.content)
```

```javascript [Node.js]
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://<your-endpoint-host>/v1', apiKey: 'not-used' })

async function callWithBackoff(params, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await client.chat.completions.create(params)
    } catch (err) {
      const status = err?.status
      const retryable = [429, 500, 502, 503, 504].includes(status)
      if (!retryable || attempt === maxAttempts - 1) throw err
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
    }
  }
}

const response = await callWithBackoff({
  model: '<your-model>',
  messages: [{ role: 'user', content: '안녕하세요' }],
})
console.log(response.choices[0].message.content)
```

:::

OpenAI SDK 는 기본적으로 일부 상태 코드에 대해 자체 재시도를 이미 수행합니다. 위 예제는
그 동작을 이해하고 직접 제어하고 싶을 때를 위한 것이며, SDK 기본 재시도만으로 충분한
경우가 대부분입니다.

## 다음

- [콜드 스타트와 Scale-to-Zero](/guide/inference/cold-start)
- [사용 한도](/guide/inference/limits) — 429 를 유발하는 한도들
- [인증](/guide/inference/authentication) — 401·403 원인
