---
title: Admin AI Inference 앱
---

# Admin AI Inference 앱

Admin AI Inference 앱은 테넌트를 운영하는 관리자를 위한 콘솔입니다. AI Inference 앱이 자기
프로젝트 안의 엔드포인트만 보여주는 것과 달리, 관리자 앱은 IAM 조직에 속한 **모든 프로젝트의
엔드포인트를 한 화면에서** 봅니다. 프로젝트 경계를 넘나들며 운영해야 하는 사람 — 플랫폼
운영자, 과금 담당자, SRE — 이 쓰는 화면입니다.

<!-- SCREENSHOT: admin-overview -->

여기서 하는 일은 크게 네 가지로 나뉩니다. 첫째는 **엔드포인트 운영**입니다. 테넌트 전체
엔드포인트를 조회하고, 수정·일시정지·재개·삭제하고, Sanity Check 로 살아 있는지 확인하고,
최근 활동 이력을 봅니다. 둘째는 **모니터링**입니다. 노드의 자원 현황, 사용량 추세, 연결된
클러스터, 소프트웨어 의존성(SBOM)을 확인합니다. 셋째는 **미터링과 과금**입니다. 토큰
사용량·비용을 조회하고, API 키별 사용 이력과 이상 탐지 알림을 관리하고, 레이트 리밋과 가격
정책을 설정합니다. 넷째는 **카탈로그와 시스템 관리**입니다. vLLM 실행 오버라이드 카탈로그,
프로젝트, 사용자 스토리지 쿼터, 시스템 설정을 다룹니다.

::: tip 엔드포인트는 여기서 만들지 않습니다
관리자 앱은 이미 있는 엔드포인트를 **운영**하는 화면입니다. 새 엔드포인트 생성은 AI Inference
앱에서 프로젝트 소유자가 합니다. 자세한 차이는 [일반 앱과의 차이](/admin/differences)를
보세요.
:::

관리자 API 는 일반 프로젝트 API 와 경로 구조가 같고, `projects/{project_id}` 대신
`admin` 아래에 있습니다. 규약 자체는 [API 레퍼런스](/api/)의 공통 규약과 동일합니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/endpoints/summary"
```

## 다음

- [일반 앱과의 차이](/admin/differences) — 무엇을 못 하고 무엇을 더 하는지
- [전체 엔드포인트 조회](/admin/serverless/list) — 가장 먼저 보게 되는 화면
- [토큰 사용량](/admin/metering/tokens) — 테넌트 전체 사용량
