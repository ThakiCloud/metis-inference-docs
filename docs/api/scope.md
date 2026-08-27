---
title: 이 API 의 범위
---

# 이 API 의 범위

Metis API 는 **추론 워크로드**를 다룹니다. 모델을 올리고, 컨테이너를 띄우고, 볼륨을 붙이고,
쓴 만큼을 세는 일입니다. 그 아래에 깔린 네트워크와 가상 머신은 다른 제품이 담당합니다.

이 경계를 먼저 확인하지 않으면 있지도 않은 경로를 찾느라 시간을 씁니다.

## Metis 가 다루는 것

| 대상 | 그룹 | 무엇을 할 수 있나 |
|---|---|---|
| 추론 엔드포인트 | Endpoints · Admin Endpoints | 생성·조회·수정·삭제, 일시정지·깨우기, Sanity Check |
| 컨테이너 워크로드 | Workloads | 배포·시작·중지·재시작·삭제, 파드 조회, 인그레스, 포트포워딩, 터미널·로그 |
| 볼륨 | Storage · Storage Shares · Storage Quota | 생성·수정·삭제, 스냅샷과 복원, 공유, 쿼터 |
| 배포 템플릿 | Templates | 등록·배포·복원 |
| 배치 추론 | Batch | 잡 제출·조회·취소, 부분 결과 |
| 성능 측정 | InferenceBenchmark | 실행·조회·취소, 리포트 다운로드 |
| 사용량과 비용 | Metering · Admin Metering | 토큰 사용량, 비용, 키별 활동, 예측, 내보내기 |
| 인프라 모니터링 | Infrastructure Monitoring | 클러스터·가속기 메트릭, 리소스 인벤토리·가용량 |
| 프로젝트 | Projects · Admin Projects | 생성·수정·삭제 |
| 자격 증명 | SSH Keys · Registry Credentials | SSH 공개키, 컨테이너 레지스트리 로그인 정보 |

## Metis 가 다루지 않는 것

아래는 **인프라 계층**이라 Metis API 에 경로가 없습니다. 같은 플랫폼의 다른 제품에서
관리하며, 그쪽 API 를 쓰셔야 합니다.

| 찾으시는 것 | Metis 에 있나 | 어디로 |
|---|---|---|
| vNet · VPC · Subnet | 없음 | 인프라(Compute) 제품 |
| Security Group · 방화벽 규칙 | 없음 | 인프라(Compute) 제품 |
| 가상 머신 생성·기동·삭제 | 없음 | 인프라(Compute) 제품 |
| VM 이미지 목록 | 없음 | 인프라(Compute) 제품 |
| VM Spec(Flavor) 목록 | 없음 | 인프라(Compute) 제품 |
| 블록 스토리지(VM 디스크) | 없음 | 인프라(Compute) 제품 |

::: tip 그래도 자원 현황은 볼 수 있습니다
가상 머신을 만들 수는 없지만, **추론이 돌아갈 클러스터에 지금 무엇이 얼마나 남아 있는지**는
Metis 로 조회됩니다. NPU·GPU 를 포함한 가속기 인벤토리와 가용량이 여기 들어갑니다.
[인프라 모니터링 API](/admin/monitoring/api) 를 보세요.
:::

## 헷갈리기 쉬운 두 가지

**SSH 키는 Metis 에도 있습니다.** 다만 이건 가상 머신 접속용이 아니라 개발 환경·워크로드
접속에 쓰는 사용자 공개키입니다. VM 키페어와는 다른 것입니다.

**볼륨도 Metis 에 있습니다.** 이건 워크로드와 엔드포인트가 마운트하는 영속 볼륨이고,
가상 머신에 붙이는 블록 디스크와는 다릅니다.

## 다음

- [프로그래밍 방식 제어](/api/automation) — 자동화로 쓸 때 알아야 할 것
- [인프라 모니터링 API](/admin/monitoring/api)
- [OpenAPI 뷰어](/api/reference)
