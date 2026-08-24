# 기여 가이드

이 저장소는 **공개**입니다. 아래 규칙은 취향이 아니라 사고를 막기 위한 것입니다.

## 절대 하지 않는 것

1. **실 호스트명을 적지 않습니다.** 문서의 모든 주소는 플레이스홀더입니다 —
   `<your-console-host>`, `<your-endpoint-host>`, `<your-model>`.
2. **실 엔드포인트 주소를 적지 않습니다.** 게이트웨이에 인증이 없는 환경에서는 주소가 곧
   접근 권한입니다. 예제·화면 캡처 어디에도 넣지 마세요.
3. **토큰·키·개인키를 적지 않습니다.** JWT 예시는 잘린 형태(`eyJhbGciOi...`)로만.
4. **클러스터 내부 정보를 적지 않습니다.** 내부 DNS, 네임스페이스, 사설 IP.
5. **화면 캡처에 사람·다른 테넌트 정보를 남기지 않습니다.** 이름·이메일·실 엔드포인트 UUID는
   가리고 올립니다.

`npm run check:secrets` 가 위 항목을 CI 에서 강제합니다. 통과하지 못하면 배포가 서지 않습니다.

## 문체

기존 문서를 두 개쯤 읽고 그 리듬에 맞추는 것이 가장 빠릅니다.
`docs/guide/inference/endpoint-url.md` 와 `docs/api/conventions.md` 가 기준점입니다.

- 한국어, 합니다체.
- **흐르는 산문이 기본입니다.** 불릿 트리로 페이지를 채우지 마세요. 표는 진짜 행·열 비교
  (필드 목록, 상태값, 에러 코드)에만 씁니다.
- 코드 예제는 `::: code-group` 으로 shell / Python / Node.js 탭. Python·Node 는 공식
  `openai` SDK 를 씁니다.
- 요청 예제 옆에는 응답도 같이 보여 줍니다. 접지 마세요.
- 이모지를 쓰지 않습니다.
- 페이지 끝에 `## 다음` 으로 관련 문서 2~3개.

## 모르는 것은 쓰지 않습니다

화면을 직접 보지 않고 UI 세부를 추측해 적으면, 그 문장은 언젠가 독자를 엉뚱한 데로 보냅니다.
확인한 것만 쓰고, 확인하지 못한 것은 생략하거나 "환경에 따라 다릅니다"라고 적으세요.

수치도 마찬가지입니다. 콜드 스타트 지연처럼 환경마다 다른 값은 구체적인 숫자를 지어내지 말고
독자가 자기 환경에서 재도록 안내합니다.

## 화면 캡처

캡처가 들어갈 자리는 주석으로 표시합니다.

```html
<!-- SCREENSHOT: serverless-list -->
```

`npm run check:shots` 가 남은 자리와 깨진 이미지 참조를 보고합니다.
캡처 생성은 Playwright 로 합니다. 접속 정보는 `.env` 로만 주입하고 절대 커밋하지 않습니다.

```bash
cp .env.example .env    # 값을 채우고
npm run capture         # 일반 사용자 화면
ROLE=admin npm run capture   # 관리자 화면
```

캡처는 라이트 모드 · 1920×1080 · 2배 스케일로 고정돼 있습니다. 이 설정을 바꾸면 기존
이미지들과 톤이 어긋납니다.

## 링크

링크는 절대 경로로 씁니다(`/guide/inference/endpoint-url`). 존재하지 않는 경로로 링크하면
`npm run docs:build` 가 실패합니다 — 이 검사는 끄지 마세요. 죽은 링크는 문서 신뢰도를
가장 빨리 깎습니다.

## API 스펙

스펙은 손으로 고치지 않습니다. 플랫폼 Swagger 를 받아 필터를 다시 돌립니다.

```bash
npm run spec:filter -- spec/metis-swagger-source.json --expect 160
```

오퍼레이션 수가 달라지면 게이트가 막습니다. 숫자를 조용히 맞추지 말고, 무엇이 늘고 줄었는지
확인한 뒤에 `--expect` 와 `docs/api/index.md` 를 함께 고치세요.

## 보내기 전에

```bash
npm run spec:filter -- spec/metis-swagger-source.json --expect 160
npm run check:secrets
npm run check:shots
npm run docs:build
```

네 개가 전부 통과해야 합니다.
