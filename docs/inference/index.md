---
title: AI Inference 앱
---

# AI Inference 앱

AI Inference 는 모델을 엔드포인트로 배포하고, 그 상태를 관리하고, 사용량을 확인하는
콘솔 화면입니다. 관리자 앱이 테넌트 전체를 내려다보는 것과 달리, 이 앱은 자신이 속한
프로젝트 안의 리소스만 다룹니다.

크게 세 가지를 합니다. 먼저 **서버리스 엔드포인트**를 만들고 조회·수정·일시정지·삭제합니다.
이것이 이 앱의 중심 기능이고, Docker 커스텀 이미지·GPU vLLM·CPU vLLM·Rebellions NPU vLLM
네 가지 방식을 지원합니다. 다음으로 **워크로드·볼륨·템플릿·프로젝트**처럼 엔드포인트를
둘러싼 리소스를 관리합니다. 마지막으로 **사용량과 비용**을 확인하고, 프라이빗 레지스트리
자격 증명이나 SSH 키 같은 계정 설정을 관리합니다.

용어가 낯설다면 먼저 [핵심 개념](/guide/concepts) 을 읽어 두세요. 이 문서 전체가 프로젝트·
엔드포인트·워크로드·볼륨·템플릿·클러스터라는 용어를 그대로 씁니다.

## 화면 구성

| 하려는 것 | 화면 |
|---|---|
| 전체 상태를 한눈에 본다 | [대시보드](/inference/dashboard) |
| 엔드포인트 목록을 보고 관리한다 | [엔드포인트 조회](/inference/serverless/list) |
| 새 엔드포인트를 만든다 | [Docker](/inference/serverless/create-docker) · [vLLM](/inference/serverless/create-vllm) · [CPU vLLM](/inference/serverless/create-vllm-cpu) · [Rebellions vLLM](/inference/serverless/create-vllm-rbln) |
| 호출 주소를 확인한다 | [Service URL](/inference/serverless/service-url) |
| 콘솔에서 동작을 확인하고 로그를 본다 | [프롬프트 전송·로그 보기](/inference/serverless/prompt-and-logs) |
| 떠 있는 워크로드·파드를 직접 본다 | [워크로드](/inference/workloads) |
| 모델·데이터를 영속 저장한다 | [볼륨](/inference/volumes) |
| 반복되는 생성 설정을 저장해 둔다 | [템플릿](/inference/templates) |
| 프로젝트를 관리한다 | [프로젝트](/inference/projects) |
| 처리량을 잰다 | [벤치마크](/inference/benchmarks) |
| 토큰 사용량과 비용을 본다 | [사용량과 비용](/inference/usage) |
| 프라이빗 이미지 자격 증명·SSH 키를 등록한다 | [레지스트리 자격 증명](/inference/settings/registry-credentials) · [SSH 키](/inference/settings/ssh-keys) |

## 실제로 애플리케이션이 호출하는 주소

이 앱에서 하는 일은 대부분 엔드포인트를 **만들고 관리하는** 것이지, 엔드포인트를
**호출하는** 것이 아닙니다. 실제 추론 호출은 콘솔이 아니라 엔드포인트 자신의 주소로
갑니다. 그 주소를 얻는 법과 호출 형식은 가이드 쪽 문서를 참고하세요.

## 다음

- [핵심 개념](/guide/concepts)
- [빠른 시작](/guide/quickstart)
- [엔드포인트 URL](/guide/inference/endpoint-url)
