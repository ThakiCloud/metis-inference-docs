---
title: 엔드포인트 조회
---

# 엔드포인트 조회

서버리스 엔드포인트는 워크로드 타입별로 목록이 나뉘어 있습니다. Docker, vLLM, CPU vLLM,
Rebellions vLLM 이 각자 자기 목록 화면을 갖고, 화면 구성과 조작 방법은 네 곳 모두
동일합니다. 그래서 이 문서 하나로 네 목록 화면을 전부 설명합니다.

![서버리스 엔드포인트 목록 — 상태·이름·모델·GPU·레플리카·포트·생성일과 행 액션](/images/inference/serverless-list.png)

| 번호 | 영역 | 설명 |
|---|---|---|
| 1 | 사이드바 | 워크로드 타입별로 목록이 나뉩니다. Docker · CPU vLLM · Rebellions vLLM 각각이 자기 목록 화면입니다. |
| 2 | 검색·필터 | 이름으로 찾고 상태로 좁힙니다. 엔드포인트가 많아지면 여기서 걸러냅니다. |
| 3 | Create endpoint | 생성 화면으로 가는 입구. 입력 폼은 워크로드 타입마다 다릅니다. |
| 4 | 목록 | 행 하나가 엔드포인트 하나입니다. 상태·이름·모델·GPU·레플리카·포트·생성일이 보이고, 맨 오른쪽 Action 에서 그 엔드포인트에 대한 조작을 엽니다. |

## 목록에 보이는 것

행 하나가 엔드포인트 하나입니다. 이름, 상태, 모델, 생성 시각 같은 기본 정보와 함께 상태를
색으로 구분한 뱃지가 붙습니다. 상태는 아래 여덟 가지 중 하나입니다.

| 상태 | 의미 |
|---|---|
| `pending` | 접수됨, 아직 스케줄 전 |
| `queued` | 자원 대기 중 |
| `creating` | 배포 중 |
| `available` | 사용 가능 |
| `paused` | 일시정지 |
| `failed` | 실패 |
| `terminating` | 삭제 처리 중 |
| `terminated` | 삭제됨 |

실제로 호출할 수 있는 상태는 `available` 뿐입니다. `pending`·`queued`·`creating` 은 아직
준비 중이고, `paused` 는 사람이 멈춰 둔 상태, `failed` 는 배포에 문제가 생긴 상태입니다.
행마다 이 상태를 보고 지금 무엇을 해야 할지 판단하면 됩니다 — 예를 들어 `failed` 행은
[로그 보기](/inference/serverless/prompt-and-logs) 로 원인을 확인하는 식입니다.

목록 위쪽에는 이름으로 찾는 검색창과 상태로 좁히는 필터가 있습니다. 엔드포인트가 많아지면
이 둘로 원하는 것만 남기고 나머지를 걷어낼 수 있습니다.

## 행 액션 메뉴

각 행 끝에 액션 메뉴가 있고, 여기서 그 엔드포인트에 할 수 있는 대부분의 조작이 이루어집니다.

| 액션 | 하는 일 |
|---|---|
| Service URL | 이 엔드포인트의 호출 주소를 패널로 보여줍니다. [Service URL 확인](/inference/serverless/service-url) |
| 로그 보기 | 컨테이너 로그를 확인합니다. [프롬프트 전송·로그 보기](/inference/serverless/prompt-and-logs) |
| 벤치마크 | vLLM 계열 엔드포인트에서만 보입니다. 처리량을 잽니다. |
| 프롬프트 전송 | 콘솔 안에서 바로 요청을 보내 동작을 확인합니다. [프롬프트 전송·로그 보기](/inference/serverless/prompt-and-logs) |
| 일시정지 | 레플리카를 내려 자원을 반납합니다. [일시정지·재개](/inference/serverless/pause-resume) |
| 재개 | 일시정지된 엔드포인트를 다시 띄웁니다. [일시정지·재개](/inference/serverless/pause-resume) |
| 편집 | 레플리카 범위 같은 설정을 고칩니다. [엔드포인트 수정](/inference/serverless/edit) |
| 삭제 | 엔드포인트를 영구히 지웁니다. [엔드포인트 삭제](/inference/serverless/delete) |

벤치마크는 워크로드 타입이 vLLM 계열(vLLM·CPU vLLM·Rebellions vLLM)일 때만 나타납니다.
Docker 커스텀 엔드포인트는 서버 형태가 정해져 있지 않아 이 메뉴가 없습니다.

## 새 엔드포인트 만들기

목록 우측 상단의 **Create endpoint** 버튼이 생성 화면으로 가는 입구입니다. 실제 입력 폼은
워크로드 타입마다 다르므로, 만들려는 타입의 문서를 보세요.

- [Docker 엔드포인트 생성](/inference/serverless/create-docker)
- [vLLM 엔드포인트 생성](/inference/serverless/create-vllm)
- [CPU vLLM 엔드포인트 생성](/inference/serverless/create-vllm-cpu)
- [Rebellions vLLM 엔드포인트 생성](/inference/serverless/create-vllm-rbln)

## 다음

- [Service URL 확인](/inference/serverless/service-url)
- [엔드포인트 수정](/inference/serverless/edit)
- [일시정지·재개](/inference/serverless/pause-resume)
