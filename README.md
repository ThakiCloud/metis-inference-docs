# metis-inference-docs

Metis **AI Inference** · **Admin AI Inference** 사용자 가이드입니다.
VitePress 로 빌드해 GitHub Pages 로 배포합니다.

- 사이트: https://thakicloud.github.io/metis-inference-docs/

## 무엇을 다루나

| 영역 | 내용 |
|---|---|
| 가이드 | 엔드포인트 전용 주소로 OpenAI 호환 추론을 호출하는 법, 인증, 스트리밍, 콜드 스타트, 에러·한도 |
| AI Inference 앱 | 대시보드, 서버리스 엔드포인트(Docker·vLLM·CPU vLLM·Rebellions vLLM), 워크로드, 볼륨, 템플릿, 프로젝트, 사용량, 설정 |
| Admin AI Inference 앱 | 테넌트 전체 엔드포인트 운영, 노드·사용량 추세 모니터링, 토큰 미터링·비용, 레이트 리밋, 가격 정책, vLLM 카탈로그, 프로젝트·시스템 설정 |
| API 레퍼런스 | 플랫폼 API 160 오퍼레이션 (OpenAPI 뷰어) |

큐 스케줄링(Kueue) 영역은 이 문서의 범위가 아닙니다.

## 로컬에서 보기

```bash
npm ci
npm run docs:dev      # http://localhost:5173
npm run docs:build    # 정적 빌드
npm run docs:preview
```

## API 스펙 갱신

플랫폼 Swagger 가 바뀌면 원본을 갈아 끼우고 필터를 다시 돌립니다.
필터는 큐 관련 오퍼레이션을 제외하고, 참조되지 않는 정의를 정리하고, 호스트 정보를 지웁니다.

```bash
# 1) 원본 교체
curl -sS "https://<your-console-host>/api/v1/metis/swagger/doc.json" \
  -o spec/metis-swagger-source.json

# 2) 필터 + 게이트 (오퍼레이션 수가 기대와 다르면 exit 1)
npm run spec:filter -- spec/metis-swagger-source.json --expect 160
```

오퍼레이션 수가 바뀐 것이 정상이라면 `--expect` 값과 `.github/workflows/deploy.yml`,
`docs/api/index.md` 의 숫자를 함께 고칩니다. 숫자를 조용히 맞추지 말고, 무엇이 늘고
줄었는지 확인한 뒤에 고치세요.

## 게이트

CI 가 배포 전에 세 가지를 강제합니다. 로컬에서도 같은 명령으로 돌려볼 수 있습니다.

| 게이트 | 명령 | 무엇을 막나 |
|---|---|---|
| 스펙 범위 | `npm run spec:filter -- spec/metis-swagger-source.json --expect 160` | 스펙이 바뀌었는데 모르고 지나가는 것 |
| 공개 안전성 | `npm run check:secrets` | 실 호스트·실 엔드포인트 주소·토큰·키·내부 DNS 유출 |
| 죽은 링크 | `npm run docs:build` | 사이드바·본문의 깨진 링크 |

**이 저장소는 공개입니다.** 실제 호스트명, 실제 엔드포인트 주소, 토큰, 사용자 정보를
문서나 화면 캡처에 넣지 마세요. 문서의 모든 주소는 플레이스홀더
(`<your-console-host>`, `<your-endpoint-host>`, `<your-model>`)로 씁니다.

## 화면 캡처

캡처는 Playwright 로 생성합니다. 접속 정보는 `.env` 로 주입하며 절대 커밋하지 않습니다.

```bash
cp .env.example .env   # 값을 채운 뒤
npm run capture
```

## 라이선스

Apache License 2.0 — [LICENSE](./LICENSE)
