---
title: 사용자 스토리지 쿼터
---

# 사용자 스토리지 쿼터

::: warning 이 환경의 콘솔 메뉴에는 없습니다
이 배포의 관리자 앱 사이드바에는 스토리지 쿼터 메뉴가 없습니다. 아래 설명은 기능 자체에 대한 것이고, 플랫폼 API 로는 그대로 쓸 수 있습니다.
설치 환경에 따라 메뉴가 노출되기도 합니다.
:::

이 화면은 특정 사용자 한 명의 스토리지 한도를 시스템 기본값과 다르게 조정할 때 씁니다.
조직 전체의 기본값·최대값은 [시스템 설정](/admin/management/settings)에서 따로
관리하고, 여기서는 그 기본값에 대한 **개인별 예외(override)**만 다룹니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/users/$USER_TPN/storage-quota"
```

`user_id` 자리에는 URL 인코딩된 소유자 TPN 을 넣습니다. 그 사용자에 대한 쿼터 레코드가
아직 없어도 오류가 아닙니다 — 레코드를 새로 만들지 않고 시스템 기본값 쿼터를
(`override_quota_gb` 는 `null`) 그대로 돌려줍니다.

| 필드 | 설명 |
|---|---|
| `user_id` | 대상 사용자 |
| `quota_gb` | 현재 적용 중인 쿼터 (기본값 또는 오버라이드) |
| `override_quota_gb` | 개인별로 설정한 오버라이드. 없으면 `null` |
| `used_gb` / `available_gb` | 사용량과 남은 용량 |
| `usage_percent` | 사용률 |
| `created_at` / `updated_at` | Unix 초 |

개인별 쿼터를 설정하려면 PUT 합니다.

```bash
curl -X PUT "https://<your-console-host>/api/v1/metis/admin/users/$USER_TPN/storage-quota" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"override_quota_gb": 500}'
```

레코드가 없던 사용자라면 이 요청이 기본값 레코드를 새로 만든 뒤 오버라이드를
적용합니다. `override_quota_gb` 에 `0` 을 보내면 오버라이드가 해제됩니다. 오버라이드만
명시적으로 지우고 싶다면 별도 경로를 씁니다.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/users/$USER_TPN/storage-quota/override"
```

레코드가 아예 없는 사용자에게 이 삭제 요청을 보내도 아무것도 쓰지 않고 기본값을 그대로
돌려줍니다 — 실패가 아닙니다.

## 다음

- [시스템 설정](/admin/management/settings) — 조직 전체 기본값·최대값
- [프로젝트 관리](/admin/management/projects)
- [사용 한도](/guide/inference/limits)
