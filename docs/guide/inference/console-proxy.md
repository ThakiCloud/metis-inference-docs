---
title: 콘솔 프록시 API
---

# 콘솔 프록시 API

플랫폼 API 에는 추론처럼 보이는 경로가 세 개 있습니다.

| 경로 | 하는 일 |
|---|---|
| `POST /api/v1/metis/projects/{project_id}/endpoints/{endpoint_id}/chat` | Chat Completion 전송 |
| `POST /api/v1/metis/projects/{project_id}/endpoints/{endpoint_id}/prompt` | 프롬프트 전송 |
| `POST /api/v1/metis/projects/{project_id}/endpoints/{endpoint_id}/embed` | 임베딩 요청 |

**이 세 경로는 콘솔 화면에서 모델이 살아 있는지 눌러 보는 용도입니다.
애플리케이션 연동에는 쓰지 마세요.**

## 왜 쓰지 않나

세 가지 이유가 있고, 셋 다 실제 비용으로 돌아옵니다.

**홉이 하나 더 있습니다.** 프록시를 거치면 애플리케이션 → 플랫폼 백엔드 → 엔드포인트로
요청이 두 번 건너갑니다. 엔드포인트를 직접 부르면 한 번입니다. 스트리밍에서 이 차이가
첫 토큰 지연으로 그대로 나타납니다.

**플랫폼 백엔드가 추론 트래픽을 떠안습니다.** 프록시는 콘솔에서 가끔 눌러 보는 부하를
전제로 만들어졌습니다. 프로덕션 트래픽을 여기로 보내면 엔드포인트가 아니라 플랫폼
백엔드가 병목이 되고, 그 영향이 같은 백엔드를 쓰는 다른 기능(엔드포인트 관리·조회)까지
번집니다.

**표준이 아닙니다.** 이 경로들은 Metis 고유 규약이라 OpenAI 클라이언트가 그대로 붙지
않습니다. 반면 엔드포인트 자신의 주소는 vLLM 의 OpenAI 호환 서버라
`base_url` 만 바꾸면 기존 코드가 그대로 돕니다.

콘솔 앱 자체도 프롬프트를 보낼 때 이 프록시를 쓰지 않고 엔드포인트 주소로 직접 보냅니다.
같은 이유입니다.

## 대신 이렇게

```diff
- POST https://<your-console-host>/api/v1/metis/projects/{project_id}/endpoints/{endpoint_id}/chat
+ POST https://<your-endpoint-host>/v1/chat/completions
```

주소를 얻는 방법은 [엔드포인트 URL](/guide/inference/endpoint-url) 에,
요청 형식은 [OpenAI 호환 API](/guide/inference/openai-compatible) 에 있습니다.

## 그래도 프록시가 맞는 경우

딱 하나입니다 — **콘솔 화면 안에서 동작 확인을 할 때**입니다. 엔드포인트 목록의
"프롬프트 전송" 기능이 그것이고, 그건 이미 콘솔이 알아서 합니다. 직접 호출할 일은 없습니다.

엔드포인트가 정상인지 자동으로 확인하고 싶다면 프록시 대신 **Sanity Check** 를 쓰세요.
결과가 이력으로 남고 관리자 앱에서도 조회됩니다.

- [Sanity Check](/admin/serverless/sanity-check)
