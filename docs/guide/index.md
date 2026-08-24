---
title: 가이드 개요
---

# 가이드 개요

이 가이드는 Metis 에 배포한 모델을 **애플리케이션에서 호출하는 법**을 다룹니다. 콘솔
화면 자체의 사용법(버튼이 어디 있는지, 메뉴가 뭘 하는지)은 [AI Inference 앱](/inference/)
문서가 따로 다루므로 그쪽을 보세요. 이 가이드는 그보다 한 단계 위, "내 코드에서 이 모델을
어떻게 부르나"에 집중합니다.

## 누가 무엇부터 읽을까

**엔드포인트를 아직 하나도 안 만들어 봤다면** [빠른 시작](/guide/quickstart) 부터
시작하세요. 콘솔에서 엔드포인트를 만들고 첫 응답을 받기까지 전 과정을 그대로 따라갈 수
있습니다.

**엔드포인트는 있고 코드에서 붙이려는 참이라면** [엔드포인트 URL](/guide/inference/endpoint-url) 로
주소를 확인하고, [인증](/guide/inference/authentication) 으로 내 환경에 인증이 걸려 있는지
확인한 다음, [OpenAI 호환 API](/guide/inference/openai-compatible) 로 요청 형식을 봅니다.

**프로젝트·엔드포인트·워크로드 같은 용어가 헷갈린다면** [핵심 개념](/guide/concepts) 을
먼저 읽으세요. 나머지 문서 전체가 이 용어들을 전제로 쓰여 있습니다.

**어떤 워크로드 타입을 골라야 할지 모르겠다면** [워크로드 타입](/guide/workload-types) 에서
`VLLM`·`VLLM_CPU`·`VLLM_RBLN`·`DOCKER_CUSTOM` 을 비교합니다.

**호출이 가끔 느리거나, 429·5xx 를 받거나, 첫 요청이 유독 오래 걸린다면** "추론 호출하기"
아래 [콜드 스타트](/guide/inference/cold-start) 와 [에러 처리](/guide/inference/errors),
[사용 한도](/guide/inference/limits) 를 봅니다.

## 이 가이드가 다루지 않는 것

- 콘솔 화면 조작법 → [AI Inference 앱](/inference/)
- 테넌트 전체 운영(노드·사용량·가격 정책) → [Admin AI Inference 앱](/admin/)
- 전체 API 스펙 → [API 레퍼런스](/api/)

## 다음

- [빠른 시작](/guide/quickstart)
- [핵심 개념](/guide/concepts)
- [엔드포인트 URL](/guide/inference/endpoint-url)
