# 미터링·과금 — 보류 중 (사이트 미게시)

이 디렉터리의 문서는 **아직 검증되지 않아 사이트에서 제외**돼 있습니다.
읽더라도 사실로 취급하지 마세요.

`docs/.vitepress/config.mts` 의 `srcExclude` 가 이 경로를 빌드에서 뺍니다.

## 되살리는 법

1. `config.mts` 의 `srcExclude: ['**/admin/metering/**']` 한 줄을 지웁니다.
2. 같은 파일의 사이드바에 "미터링·과금" 블록을 되돌립니다.
3. 인바운드 링크를 되돌립니다(`admin/index.md`, `admin/differences.md`,
   `admin/serverless/activities.md`, `admin/serverless/sanity-check.md`,
   `admin/catalog/vllm.md`, `admin/monitoring/usage-trend.md`,
   `guide/inference/authentication.md`, `index.md`, `guide/index.md`, `changelog.md`).
4. 이 README 를 지웁니다.

1~3은 이 문단을 추가한 커밋에서 한꺼번에 제거했으므로 `git show` 로 그대로 꺼낼 수 있습니다.

## 되살리기 전에 확인할 것

내용이 실제 화면·API 응답과 맞는지 확인해야 합니다. 특히 토큰 사용량 집계 기준,
비용 산정 방식, 레이트 리밋의 적용 범위, 가격 정책의 우선순위 — 이 넷은 틀리면
독자가 돈 계산을 잘못하게 되는 항목입니다.
