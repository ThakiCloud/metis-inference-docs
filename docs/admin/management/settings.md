---
title: 시스템 설정
---

# 시스템 설정

::: warning 이 환경의 콘솔 메뉴에는 없습니다
이 배포의 관리자 앱 사이드바에는 시스템 설정 메뉴가 없습니다. 아래 설명은 기능 자체에 대한 것이고, 플랫폼 API 로는 그대로 쓸 수 있습니다.
설치 환경에 따라 메뉴가 노출되기도 합니다.
:::

시스템 설정은 프로젝트나 사용자 하나가 아니라 **테넌트 전체**에 적용되는 기본값을
다룹니다. 여기서 바뀐 값은 별도로 오버라이드하지 않은 모든 프로젝트·사용자에게 그대로
적용됩니다.

## 워크로드 자동 종료

유휴 상태로 오래 떠 있는 워크로드를 자동으로 종료하는 시간을 설정합니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/settings/auto-termination"
```

```bash
curl -X PUT "https://<your-console-host>/api/v1/metis/admin/settings/auto-termination" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"default_hours": 8, "max_hours": 168}'
```

| 필드 | 설명 |
|---|---|
| `default_hours` | 워크로드가 기본으로 적용받는 자동 종료 시간 (예: 8시간) |
| `max_hours` | 사용자가 늘릴 수 있는 상한 (예: 168시간, 7일) |

생략한 필드는 바뀌지 않습니다 — 둘 중 하나만 바꾸고 싶으면 그 필드만 보내면 됩니다.

## 사용자 스토리지 기본값

조직 전체 사용자에게 적용되는 스토리지 쿼터의 기본값과 상한을 설정합니다. 특정 사용자
한 명만 예외로 두려면 이 값이 아니라 [사용자 스토리지 쿼터](/admin/management/storage-quota)
의 개인별 오버라이드를 씁니다.

```bash
curl -X PUT "https://<your-console-host>/api/v1/metis/admin/settings/user-storage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"default_user_quota_gb": 100, "max_user_quota_gb": 10000}'
```

| 필드 | 설명 |
|---|---|
| `default_user_quota_gb` | 오버라이드가 없는 사용자에게 적용되는 기본 쿼터 |
| `max_user_quota_gb` | 개인별 오버라이드로도 넘을 수 없는 조직 전체 상한 |

## 다음

- [사용자 스토리지 쿼터](/admin/management/storage-quota)
- [프로젝트 관리](/admin/management/projects)
- [전체 엔드포인트 조회](/admin/serverless/list)
