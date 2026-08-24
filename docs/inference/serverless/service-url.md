---
title: Service URL 확인
---

# Service URL 확인

엔드포인트를 만들었으면 실제로 추론을 호출할 주소가 필요합니다. 그 주소를 콘솔에서
확인하는 방법이 이 화면입니다. 여기서 얻은 주소로 애플리케이션이 직접 호출합니다 — 콘솔이나
플랫폼 API 를 거치지 않습니다.

<!-- SCREENSHOT: serverless-service-url-panel -->

## 확인하는 방법

[엔드포인트 조회](/inference/serverless/list) 목록에서 원하는 행의 액션 메뉴를 열고
**Service URL** 을 선택하면 주소가 담긴 패널이 열립니다. 옆의 복사 버튼으로 그대로
가져갈 수 있습니다.

이 값은 API 로도 받을 수 있습니다. 엔드포인트 상세 응답의 `service_url` 필드가 같은
값입니다. 규칙과 API 예시는 [엔드포인트 URL](/guide/inference/endpoint-url) 에 정리돼
있습니다.

## 값이 비어 있다면

`service_url` 은 엔드포인트가 실제로 배포된 뒤에만 채워집니다. 상태가 `pending` 이나
`creating` 인 동안에는 비어 있는 것이 정상입니다. [엔드포인트 조회](/inference/serverless/list)
에서 상태가 `available` 로 바뀔 때까지 기다렸다가 다시 확인하세요.

## 주소를 얻은 다음

얻은 주소로 바로 호출하면 됩니다. 요청·응답 형식은 vLLM 의 OpenAI 호환 서버 형식을
그대로 따릅니다.

```bash
curl https://<your-endpoint-host>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"<your-model>","messages":[{"role":"user","content":"안녕"}]}'
```

인증이 필요한지 여부는 설치 환경마다 다릅니다. [인증](/guide/inference/authentication) 에서
내 환경이 어느 쪽인지 확인하는 방법을 안내합니다.

::: warning 이 주소를 아무 데나 붙여넣지 마세요
게이트웨이에 인증이 걸려 있지 않은 환경이라면 **주소를 아는 사람이 곧 호출할 수 있는
사람**입니다. 이슈·채팅·저장소·화면 캡처에 그대로 남기지 말고, 설정 값이나 시크릿으로
다루세요. 브라우저에서 도는 코드에 넣으면 그 주소는 공개된 것과 같습니다.
:::

## 다음

- [엔드포인트 URL](/guide/inference/endpoint-url)
- [OpenAI 호환 API](/guide/inference/openai-compatible)
- [인증](/guide/inference/authentication)
