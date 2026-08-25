---
title: 사용량과 비용
---

# 사용량과 비용

::: warning 이 환경의 콘솔 메뉴에는 없습니다
이 배포의 AI Inference 앱 사이드바에는 사용량 메뉴가 없습니다. 아래 설명은 기능 자체에 대한 것이고, 플랫폼 API 로는 그대로 쓸 수 있습니다.
설치 환경에 따라 메뉴가 노출되기도 합니다.
:::

이 프로젝트에서 엔드포인트를 얼마나 호출했고, 그것이 얼마짜리인지 확인하는 화면입니다.
아래 표는 이 화면이 보여주는 값을 실제로 채우는 API 를 정리한 것입니다 — 콘솔 화면 자체는
이 값들을 조합해 보여줍니다.

| 확인하는 것 | 경로 |
|---|---|
| 전체 요약 | `GET /metering/summary` |
| 기간별 사용량 | `GET /metering/usage` |
| 토큰 사용량 요약 | `GET /metering/tokens/summary` |
| 항목별 토큰 사용량 분해 | `GET /metering/tokens/breakdown` |
| 토큰 사용량에 따른 비용 | `GET /metering/tokens/costs` |
| 비용 예측 | `GET /metering/estimate` |
| 데이터 내보내기 | `GET /metering/export` |

## 요약과 분해

요약(summary)은 이 프로젝트의 사용량을 한눈에 보여주는 값이고, 분해(breakdown)는 그
합계를 엔드포인트별·모델별로 쪼개 보여줍니다. 어느 엔드포인트가 사용량을 많이 차지하는지
찾을 때는 요약이 아니라 분해 쪽을 확인하세요.

## 비용 예측과 내보내기

지금까지의 사용 패턴을 바탕으로 앞으로의 비용을 미리 가늠해 보고 싶다면 비용 예측을
씁니다. 정산이나 별도 분석을 위해 원본 데이터를 밖으로 빼야 한다면 내보내기 기능으로
파일을 받을 수 있습니다.

## 다음

- [프로젝트](/inference/projects)
- [엔드포인트 조회](/inference/serverless/list)
- [공통 규약](/api/conventions)
