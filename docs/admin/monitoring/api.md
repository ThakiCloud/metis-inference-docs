---
title: 인프라 모니터링 API
---

# 인프라 모니터링 API

관리자 앱의 모니터링 화면이 보여주는 것을 API 로도 받을 수 있습니다. 자원이 얼마나 남았는지,
가속기가 얼마나 일하고 있는지를 외부 시스템에서 주기적으로 끌어갈 때 쓰는 경로입니다.

전부 관리자 권한이 필요하고 `Authorization: Bearer {JWT}` 를 씁니다.

## 어떤 것이 있나

| 오퍼레이션 | 무엇을 주나 |
|---|---|
| `GET /admin/kueue/resources/availability` | CPU·메모리·가속기 가용량 |
| `GET /admin/kueue/resource-inventory` | ResourceFlavor 별 노드 용량, 워크로드 사용량, 시스템 파드 오버헤드, 쿼터 |
| `GET /admin/kueue/metrics/cluster` | 클러스터 리소스 사용량과 노드 상태 |
| `GET /admin/kueue/metrics/gpu-utilization` | 장치별 가속기 활용도 |
| `GET /admin/kueue/metrics/gpu-trends` | 기간별 가속기 활용도 추세 |
| `GET /admin/kueue/health` | 플랫폼 구성요소 상태 |

::: tip 이름은 GPU 인데 NPU 도 함께 나옵니다
활용도 조회는 Prometheus 의 가속기 메트릭을 읽는데, 여기에 **NVIDIA DCGM 과 Rebellions NPU 가
함께** 들어갑니다. 경로 이름만 보고 GPU 전용이라고 판단하지 마세요.
:::

## 지금 자원이 얼마나 남았나

배포 전에 여유를 확인할 때 씁니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/resources/availability"
```

`cluster` 쿼리로 특정 클러스터만 볼 수 있고, 생략하면 전체 클러스터를 합산합니다.

## 가속기별 상세는 인벤토리로

어떤 종류의 가속기가 어느 노드에 얼마나 있는지, 그중 얼마가 쓰이고 있는지를 봅니다.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/resource-inventory?page=1&page_size=50"
```

| 쿼리 | 설명 |
|---|---|
| `name` | Flavor 이름 부분 일치 필터 |
| `resource_type` | 리소스 타입 필터 |
| `cluster` | 대상 클러스터. 생략하면 기본 클러스터 |
| `page` · `page_size` | 기본 1 / 10, 페이지 크기는 최대 500 |

## 활용도와 추세

```bash
# 지금 장치별로 얼마나 쓰고 있나
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/metrics/gpu-utilization"

# 최근 24시간 추세
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/metrics/gpu-trends?duration=24h"
```

`duration` 과 `timeWindow` 는 `1h` · `6h` · `24h` · `7d` 를 받습니다. 시계열 응답의 시각은
RFC 3339 문자열입니다 — 리소스의 `created_at` 이 Unix 초인 것과 다르니
[공통 규약](/api/conventions)의 시간 형식 절을 함께 보세요.

## 상태 점검

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://<your-console-host>/api/v1/metis/admin/kueue/health"
```

데이터베이스는 ping, 쿠버네티스는 API 서버 discovery, 스케줄러는 API 그룹 제공 여부로
실제 프로브를 돌려 보고합니다. 캐시된 값이 아니라 그 순간의 상태입니다.

## 엔드포인트 자체의 건강 상태는 따로입니다

위 경로들은 **인프라**를 봅니다. 특정 엔드포인트가 실제로 응답하는지는 Sanity Check 로
확인하고, 상태별 개수는 요약 경로로 봅니다.

- [Sanity Check](/admin/serverless/sanity-check)
- [전체 엔드포인트 조회](/admin/serverless/list)

## 다음

- [노드](/admin/monitoring/nodes) · [사용량 추세](/admin/monitoring/usage-trend) — 같은 데이터를 보는 화면
- [프로그래밍 방식 제어](/api/automation)
- [OpenAPI 뷰어](/api/reference)
