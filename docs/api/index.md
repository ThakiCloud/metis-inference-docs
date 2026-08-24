---
title: API 레퍼런스 개요
---

# API 레퍼런스 개요

여기는 **플랫폼 API** 문서입니다. 엔드포인트를 만들고 조회하고 사용량을 보는 관리용
API 이고, 모든 경로가 `/api/v1/metis/` 아래에 있습니다.

::: warning 추론 호출은 여기가 아닙니다
실제 모델 호출은 플랫폼 API 가 아니라 **엔드포인트 자신의 주소**로 보냅니다. 그쪽은 vLLM 의
OpenAI 호환 서버라 규약이 다르고, 이 레퍼런스에 포함되지 않습니다.
[추론 호출하기](/guide/inference/endpoint-url) 를 보세요.
:::

## 무엇이 들어 있나

이 레퍼런스는 추론 운영에 필요한 **160개 오퍼레이션 / 22개 그룹**을 담고 있습니다.
원본 스펙에는 큐 스케줄링(Kueue) 관련 41개가 더 있지만 이 문서의 범위가 아니라 제외했습니다.

| 그룹 | 오퍼레이션 | 무엇을 하나 |
|---|---|---|
| Endpoints | 17 | 엔드포인트 생성·조회·수정·삭제, 일시정지·깨우기, Sanity Check |
| Admin Endpoints | 10 | 테넌트 전체 엔드포인트 운영 |
| Workloads | 18 | 워크로드 배포·조회·로그·삭제 |
| Storage | 16 | 볼륨 생성·조회·마운트·삭제 |
| Storage Shares | 11 | 볼륨 공유 |
| Metering | 12 | 프로젝트 사용량·토큰·비용·예측·내보내기 |
| Admin Metering | 11 | 테넌트 전체 사용량, 키 로스터, 이상 탐지 알림 |
| Templates | 9 | 배포 템플릿 |
| Projects / Admin Projects | 6 / 5 | 프로젝트 관리 |
| vLLM Catalog | 5 | 서빙 가능한 vLLM 모델 카탈로그 |
| Admin Pricing Rules | 5 | 가격 정책 |
| InferenceBenchmark | 5 | 추론 벤치마크 |
| Batch | 5 | 배치 작업 |
| Registry Credentials | 5 | 컨테이너 레지스트리 자격 증명 |
| SSH Keys | 4 | SSH 공개키 |
| User Authentication | 4 | 로그인·로그아웃·갱신·내 정보 |
| Admin Settings / Admin Users | 4 / 3 | 시스템 설정, 사용자 쿼터 |
| Storage Settings / Quota / User Storage | 2 / 2 / 1 | 스토리지 정책 |

전체 스펙은 [OpenAPI 뷰어](/api/reference)에서 그룹별로 펼쳐 볼 수 있고,
[JSON 원본](/metis-inference.openapi.json)을 그대로 내려받아 코드 생성기에 넣어도 됩니다.

## 빠른 진입

| 하려는 것 | 문서 |
|---|---|
| 토큰 받기 | [인증](/api/authentication) |
| 페이지네이션·시간 형식·버전 필드 | [공통 규약](/api/conventions) |
| 에러 응답 해석 | [에러 코드](/api/errors) |
| 엔드포인트 스펙 전문 | [OpenAPI 뷰어](/api/reference) |

## 베이스 URL

```
https://<your-console-host>/api/v1/metis
```

`<your-console-host>` 는 설치 환경마다 다릅니다. 브라우저에서 콘솔에 접속했을 때의
호스트와 같습니다.
