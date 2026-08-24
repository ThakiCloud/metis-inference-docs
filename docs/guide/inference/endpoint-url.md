---
title: 엔드포인트 URL
---

# 엔드포인트 URL

엔드포인트를 만들면 그 엔드포인트만의 주소가 하나 생깁니다. 애플리케이션은 이 주소를
직접 호출합니다. 플랫폼 콘솔이나 백엔드 API 를 거치지 않습니다.

## 주소를 확인하는 방법

AI Inference 앱의 엔드포인트 목록에서 원하는 행의 액션 메뉴를 열고 **Service URL** 을
선택하면 주소가 담긴 패널이 열립니다. 복사 버튼으로 그대로 가져갈 수 있습니다.

API 로 가져올 수도 있습니다. 엔드포인트 상세 응답의 `service_url` 필드가 같은 값입니다.

```bash
curl -H "Authorization: Bearer $METIS_TOKEN" \
  "https://<your-console-host>/api/v1/metis/projects/$PROJECT_ID/endpoints/$ENDPOINT_ID" \
  | jq -r '.service_url'
```

::: tip 배포 전에는 값이 없습니다
`service_url` 은 엔드포인트가 실제로 배포된 뒤에 채워집니다. 상태가 `pending` 이나
`creating` 인 동안에는 `null` 입니다. 상태가 `available` 이 될 때까지 기다리세요.
:::

## 주소가 만들어지는 규칙

외부 주소는 세 조각으로 만들어집니다.

```
https://{엔드포인트 ID 앞 12자리}-{포트}.{환경 기본 도메인}
```

| 조각 | 설명 |
|---|---|
| 엔드포인트 ID 앞 12자리 | 엔드포인트 UUID 에서 하이픈을 뺀 뒤 앞에서 12글자를 잘라 씁니다. 소문자입니다. |
| 포트 | 엔드포인트의 서비스 포트. vLLM 계열은 **8000 고정**, Docker 커스텀은 생성할 때 지정한 포트입니다. |
| 환경 기본 도메인 | 설치 환경마다 다릅니다. 운영자가 정한 값이며 콘솔의 Service URL 에서 확인하는 편이 빠릅니다. |

예를 들어 엔드포인트 ID 가 `5daa5517-5e7a-4470-82db-d67274c97ea0` 이고 포트가 8000 이면
호스트 부분은 `5daa55175e7a-8000` 이 됩니다.

이 규칙을 알아 두면 좋은 이유는 하나입니다. **엔드포인트를 지우고 다시 만들면 ID 가 바뀌므로
주소도 바뀝니다.** 주소를 애플리케이션에 하드코딩하지 말고 설정으로 빼 두세요.

## 경로

엔드포인트는 vLLM 의 OpenAI 호환 서버입니다. 그래서 경로가 표준 그대로입니다.

| 경로 | 용도 |
|---|---|
| `POST /v1/chat/completions` | 대화형 추론. 대부분의 경우 이것을 씁니다. |
| `POST /v1/completions` | 단일 프롬프트 완성 |
| `POST /v1/embeddings` | 임베딩 (임베딩 모델을 띄운 경우) |
| `GET /v1/models` | 이 엔드포인트가 서빙 중인 모델 이름 확인 |

`model` 필드에 넣을 값이 헷갈리면 `/v1/models` 를 먼저 호출해 확인하세요.

```bash
curl https://<your-endpoint-host>/v1/models
```

## 내부 주소는 무엇인가

엔드포인트에는 클러스터 내부에서만 닿는 주소도 있습니다. 같은 클러스터 안에서 도는
워크로드끼리 호출할 때 쓰는 값입니다. 클러스터 밖에서는 닿지 않으므로, 일반적인
애플리케이션 연동에서는 위의 외부 주소를 쓰면 됩니다.

## 다음

- [인증](/guide/inference/authentication) — 이 주소를 호출할 때 필요한 것
- [OpenAI 호환 API](/guide/inference/openai-compatible) — 요청·응답 형식
- [콜드 스타트](/guide/inference/cold-start) — 첫 요청이 느린 이유
