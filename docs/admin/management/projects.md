---
title: 프로젝트 관리
---

# 프로젝트 관리

프로젝트 관리 화면은 IAM 조직 안의 모든 프로젝트를 관리자가 직접 만들고, 고치고, 지우는
곳입니다. 일반 사용자가 자기 프로젝트 설정을 보는 화면과 달리, 여기서는 조직 전체
프로젝트를 가로질러 다룹니다.

<!-- SCREENSHOT: admin-management-projects -->

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/projects?status=active&page=1&page_size=20"
```

`status` · `project_type` · `type` · `tier` · `q`(이름·설명 검색)로 필터링하고
`sort_by` · `sort_order` 로 정렬합니다. 목록은 이 호출자의 IAM 조직 전체를 대상으로
하며, 개별 프로젝트마다 역할·배정을 다시 조회하지 않으므로 대규모 조직에서도 빠릅니다.
응답의 `is_estimated` 가 `true` 면 전체 개수(`total`)가 근사치라는 뜻입니다.

## 만들기

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/admin/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "ml-research", "description": "리서치팀 실험 프로젝트", "tier": "medium", "type": "team"}'
```

| 필드 | 값 |
|---|---|
| `name` | 프로젝트 이름 |
| `description` | 설명 |
| `status` | `active` · `inactive` · `archived` |
| `tier` | `tiny` · `small` · `medium` · `large` · `xlarge` |
| `type` | `division` · `team` · `part` |

소유자는 별도로 지정하지 않습니다. 요청을 보낸 관리자 본인이 소유자로 기록되고, 조직
관련 키를 요청 본문에 넣으면 거부됩니다.

## 수정과 삭제

`PATCH /admin/projects/{project_id}` 로 이름·설명·상태·티어·타입만 부분 수정합니다.
그 외 필드를 보내면 400 이 돌아옵니다.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/projects/$PROJECT_ID"
```

**엔드포인트 같은 활성 자원이 남아 있는 프로젝트는 삭제가 거부됩니다.** 먼저
[전체 엔드포인트 조회](/admin/serverless/list)에서 그 프로젝트의 자원을 정리한 뒤
삭제하세요.

여러 프로젝트를 한 번에 정리해야 하면 일괄 삭제를 씁니다(최대 50개).

```bash
curl -X POST "https://<your-console-host>/api/v1/metis/admin/projects/bulk-delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_ids": ["proj_a", "proj_b"]}'
```

응답은 200 이어도 **각 프로젝트별 성공·실패가 따로** 담깁니다(`success_projects` /
`failed_projects` / `total`). 요청 전체가 성공했다는 뜻이 아니라, 요청 자체는 정상적으로
처리됐다는 뜻입니다. 실패한 항목은 개별적으로 원인을 확인해야 합니다.

## 다음

- [사용자 스토리지 쿼터](/admin/management/storage-quota)
- [전체 엔드포인트 조회](/admin/serverless/list)
- [시스템 설정](/admin/management/settings)
