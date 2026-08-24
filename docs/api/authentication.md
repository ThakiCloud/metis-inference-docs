---
title: API 인증
---

# API 인증

플랫폼 API 는 JWT Bearer 토큰 하나로 인증합니다. 스펙상 정의된 인증 방식도 이것 하나입니다.

```
Authorization: Bearer {access_token}
```

## 토큰 받기

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login_id": "<your-login-id>",
    "password": "<your-password>"
  }'
```

| 요청 필드 | 필수 | 설명 |
|---|---|---|
| `login_id` | ✓ | 로그인 ID |
| `password` | ✓ | 비밀번호 |
| `domain` | — | 조직 도메인. 생략하면 요청 호스트명에서 추론합니다. `X-Organization-Domain` 헤더로도 줄 수 있고, 본문 값이 헤더보다 우선합니다. |

응답:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "홍길동",
    "email": "user@example.com",
    "organization_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

`refresh_token` 은 환경에 따라 포함되지 않을 수 있습니다. 기본 로그인 경로에서는 보통 없습니다.

## 토큰 쓰기

```bash
TOKEN="<access_token>"

curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/projects"
```

## 토큰 갱신과 확인

| 목적 | 오퍼레이션 |
|---|---|
| 액세스 토큰 갱신 | `POST /api/v1/metis/auth/refresh` |
| 현재 사용자 확인 | `GET /api/v1/metis/auth/me` |
| 로그아웃 | `POST /api/v1/metis/auth/logout` |

`expires_in` 은 초 단위입니다. 장시간 도는 작업이라면 만료 전에 갱신하거나, 401 을 받으면
한 번 갱신하고 재시도하는 흐름을 넣으세요.

## 401 이 계속 날 때

| 증상 | 원인 | 조치 |
|---|---|---|
| 로그인 자체가 400 `Invalid login ID format` | 필드 이름이 틀렸습니다. `username` 이 아니라 `login_id` 입니다. | 필드명 수정 |
| 로그인이 401 | 아이디·비밀번호가 틀렸거나, 조직 도메인이 다릅니다. | `domain` 을 명시해서 재시도 |
| 조회 요청만 401 | 헤더 형식이 틀렸습니다. `Bearer ` 접두사가 필요합니다. | `Authorization: Bearer {token}` |
| 한동안 되다가 401 | 토큰이 만료됐습니다. | 갱신 후 재시도 |

::: danger 토큰을 저장소에 커밋하지 마세요
`access_token` 은 그 사용자의 권한을 그대로 가집니다. 환경 변수나 시크릿 저장소에서 읽어
쓰고, 로그·이슈·화면 캡처에 남기지 마세요.
:::

## 추론 엔드포인트는 규칙이 다릅니다

모델을 실제로 호출하는 주소는 이 JWT 를 쓰지 않습니다.
[추론 인증](/guide/inference/authentication) 을 보세요.

## 다음

- [공통 규약](/api/conventions)
- [에러 코드](/api/errors)
