---
title: 사용량 추세
---

# 사용량 추세

사용량 추세는 클러스터의 자원 소비를 시간 축으로 보여주는 화면입니다. 특정 시점에
급증했던 CPU·메모리 사용량이나, GPU 활용도가 낮은 채로 오래 떠 있는 워크로드를 찾을 때
씁니다.

![사용량 추세](/images/admin/admin-monitoring-usage-trend.png)

시계열 데이터는 다음 필드로 구성됩니다. 시간 형식은 리소스 목록과 달리 RFC 3339
문자열입니다([API 레퍼런스](/api/) 참고).

| 필드 | 설명 |
|---|---|
| `timestamp` | 표본 시각 (RFC 3339, 예: `2026-04-22T08:15:00Z`) |
| `cpu_millicores` | CPU 사용량 (밀리코어) |
| `memory_bytes` | 메모리 사용량 (바이트) |
| `gpus` | 사용 중인 GPU 개수 |
| `active_workloads` | 그 시점에 떠 있던 워크로드 수 |

GPU 활용도는 같은 화면의 별도 그래프로, `time` · `value`(퍼센트) 두 필드로 된 시계열입니다.

## 다음

- [노드](/admin/monitoring/nodes)
- [연결된 클러스터](/admin/monitoring/clusters)
