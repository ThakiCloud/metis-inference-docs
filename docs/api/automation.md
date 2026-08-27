---
title: 프로그래밍 방식 제어
---

# 프로그래밍 방식 제어

콘솔에서 손으로 누르던 것을 스크립트로 옮길 때 알아야 할 것들입니다.
자원 수명주기, 모델 배포, 모니터링을 전부 API 로 돌릴 수 있습니다.

## 자격 증명부터 정하고 시작하세요

Metis API 인증은 로그인으로 받는 JWT 이고, `expires_in` 이 알려주는 만큼 유효합니다.
자동화에서는 만료를 전제로 재발급 경로를 넣어 두세요. 자격 증명 자체의 발급과 회수는
조직의 IAM 정책을 따릅니다.

토큰을 받아 쓰는 최소 흐름은 이렇습니다.

::: code-group

```bash [shell]
TOKEN=$(curl -s -X POST "https://<your-console-host>/api/v1/metis/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"login_id":"<your-login-id>","password":"<your-password>","domain":"<your-domain>"}' \
  | jq -r '.access_token')

curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/projects"
```

```python [Python]
import os, requests

BASE = "https://<your-console-host>/api/v1/metis"

def login() -> str:
    r = requests.post(f"{BASE}/auth/login", json={
        "login_id": os.environ["METIS_LOGIN_ID"],
        "password": os.environ["METIS_PASSWORD"],
        "domain": os.environ.get("METIS_DOMAIN"),
    }, timeout=15)
    r.raise_for_status()
    return r.json()["access_token"]

token = login()
session = requests.Session()
session.headers["Authorization"] = f"Bearer {token}"

print(session.get(f"{BASE}/projects", timeout=15).json())
```

:::

401 을 받으면 토큰이 만료된 것입니다. `POST /auth/refresh` 로 갱신하거나 다시 로그인한 뒤
**한 번만** 재시도하세요. 실패가 반복되면 자격 증명 문제이지 타이밍 문제가 아닙니다.

## 비동기 작업은 상태를 폴링합니다

생성·삭제·GPU 개수 변경은 요청을 접수만 하고 곧바로 응답합니다. 실제 완료는 상태로 확인합니다.

```bash
# 엔드포인트를 만들고 available 이 될 때까지 기다린다
ID=$(curl -s -X POST "$BASE/projects/$PROJECT_ID/endpoints/vllm-rbln" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d @create.json | jq -r '.id')

until [ "$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE/projects/$PROJECT_ID/endpoints/$ID" | jq -r '.status')" = "available" ]; do
  sleep 10
done
```

`service_url` 은 배포가 끝난 뒤에 채워집니다. 상태가 `available` 이 되기 전에 읽으면 `null`
입니다. 상태값 전체와 페이지네이션·낙관적 잠금 규약은 [공통 규약](/api/conventions)에 있습니다.

## 자원 수명주기 한 바퀴

ETRI 처럼 자원 전체를 API 로 돌리는 경우, 대체로 이 순서입니다.

| 단계 | 오퍼레이션 |
|---|---|
| 여유 자원 확인 | `GET /admin/kueue/resources/availability`, `GET /admin/kueue/resource-inventory` |
| 프로젝트 준비 | `GET /projects`, `POST /projects` |
| 볼륨 준비 | `POST /projects/{id}/volumes` |
| 레지스트리 자격 등록 | `POST /regcreds` → `POST /regcreds/{id}/verify` |
| 배포 | 엔드포인트 `POST /projects/{id}/endpoints/...` 또는 컨테이너 `POST /projects/{id}/workloads` |
| 운영 | `pause` · `wake` · `restart` · `PUT`(version 필요) |
| 관측 | 상태 요약 · Sanity Check · 메트릭 · 사용량 |
| 정리 | `DELETE` 후 상태가 `terminated` 인지 확인 |

## 스트리밍이 필요한 곳

워크로드의 로그와 터미널은 REST 가 아니라 WebSocket 입니다.

| 용도 | 경로 |
|---|---|
| 로그 스트림 | `GET /projects/{id}/workloads/{wid}/ws/logs` |
| 터미널 | `GET /projects/{id}/workloads/{wid}/ws/exec` |

엔드포인트가 정상인지 확인하는 것은 로그가 아니라
[Sanity Check](/admin/serverless/sanity-check) 로 합니다. 실행 결과가 이력으로 남고
관리자 앱에서도 조회됩니다.

## 다음

- [NPU 로 서빙하기](/guide/npu)
- [알려진 스펙 문제](/api/known-issues)
