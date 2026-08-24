---
title: 인증
---

# 인증

호출하는 대상이 무엇이냐에 따라 인증이 다릅니다. 이 둘을 섞으면 계속 401 을 받습니다.

| 호출 대상 | 주소 | 인증 |
|---|---|---|
| **플랫폼 API** (엔드포인트 생성·조회·삭제, 사용량 조회 등) | 콘솔과 같은 호스트의 `/api/v1/metis/...` | `Authorization: Bearer {JWT}` |
| **추론 엔드포인트** (실제 모델 호출) | 엔드포인트 전용 주소 `https://<your-endpoint-host>` | 아래 참고 |

## 플랫폼 API — JWT

플랫폼 API 는 JWT 하나로 통일돼 있습니다. 로그인해서 토큰을 받고, 이후 모든 요청에
`Authorization` 헤더로 붙입니다.

```bash
TOKEN=$(curl -s -X POST "https://<your-console-host>/api/v1/metis/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"login_id":"<your-login-id>","password":"<your-password>"}' \
  | jq -r '.access_token')

curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/projects"
```

| 요청 필드 | 필수 | 설명 |
|---|---|---|
| `login_id` | ✓ | 로그인 ID |
| `password` | ✓ | 비밀번호 |
| `domain` | — | 조직 도메인. 생략하면 요청 호스트명에서 추론합니다. 여러 조직이 한 호스트를 쓰는 환경에서만 지정하세요. |

응답의 `expires_in` 은 초 단위 만료 시간입니다. 만료되면 `POST /api/v1/metis/auth/refresh`
로 갱신하거나 다시 로그인하세요. 현재 토큰의 주인은 `GET /api/v1/metis/auth/me` 로 확인합니다.

::: danger 토큰을 코드에 넣지 마세요
`access_token` 은 그 사용자의 모든 권한을 그대로 가집니다. 환경 변수나 시크릿 저장소에서
읽어 쓰고, 저장소·로그·화면 캡처에 남기지 마세요.
:::

## 추론 엔드포인트 — 환경 설정에 달려 있습니다

추론 주소의 보호 수준은 **설치 환경의 게이트웨이 설정이 정합니다.** 플랫폼 콘솔 자체는
이 주소를 호출할 때 인증 헤더를 붙이지 않습니다. 콘솔은 백엔드용 자격 증명을 다른 오리진인
엔드포인트로 보내지 않도록 일부러 그렇게 설계돼 있습니다.

그래서 환경에 따라 두 가지 중 하나입니다.

**게이트웨이에서 키를 검증하는 환경** — 발급받은 키를 표준 방식대로 붙입니다.
OpenAI 클라이언트를 쓰면 `api_key` 에 넣으면 되고, 직접 호출하면 헤더로 붙입니다.

```bash
curl https://<your-endpoint-host>/v1/chat/completions \
  -H "Authorization: Bearer $INFERENCE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"<your-model>","messages":[{"role":"user","content":"안녕"}]}'
```

**게이트웨이에서 별도 검증을 하지 않는 환경** — 헤더 없이도 호출됩니다. OpenAI 클라이언트는
`api_key` 를 비워 두면 오류를 내므로 아무 문자열이나 넣습니다(`"not-used"` 등). 이 경우
**주소를 아는 사람은 누구나 호출할 수 있습니다.**

::: warning 내 환경이 어느 쪽인지 확인하는 법
헤더 없이 `/v1/models` 를 한 번 호출해 보세요. 200 이 오면 인증이 걸려 있지 않은 것이고,
401·403 이 오면 키가 필요한 환경입니다.

```bash
curl -i https://<your-endpoint-host>/v1/models
```
:::

## 인증이 걸려 있지 않다면

추론 주소가 열려 있는 환경이라면 다음을 검토하세요. 문서로 우회할 문제가 아니라
운영에서 막아야 하는 문제입니다.

- **주소를 공개하지 않습니다.** 주소 자체가 사실상 접근 권한입니다. 저장소·이슈·채팅·
  화면 캡처에 남기지 마세요.
- **네트워크 수준에서 좁힙니다.** 사내망·VPN·허용 IP 목록 안에서만 닿게 합니다.
- **게이트웨이에 인증을 붙입니다.** 조직의 IAM 이 발급한 키를 검증하도록 설정합니다.
- **애플리케이션 서버를 앞에 둡니다.** 브라우저에서 엔드포인트를 직접 부르지 말고,
  자기 서버가 대신 호출하게 하면 인증·감사·레이트 리밋을 그 서버에서 걸 수 있습니다.

브라우저 코드에 추론 주소를 넣으면 그 주소는 공개된 것과 같습니다.

## 사용량은 누가 썼는지 어떻게 구분되나

토큰 사용량과 비용은 키 단위로 집계됩니다. 관리자 앱에서 키별 사용량·비용·활동 이력을
보고, 키마다 RPS·RPM·월 토큰 한도를 걸 수 있습니다.

- [토큰 사용량](/admin/metering/tokens)
- [레이트 리밋 설정](/admin/metering/rate-limits)

## 다음

- [OpenAI 호환 API](/guide/inference/openai-compatible)
- [에러 처리](/guide/inference/errors) — 401·403 이 왔을 때
