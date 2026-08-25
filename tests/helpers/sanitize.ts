import type { Page } from '@playwright/test'

/**
 * 캡처 전에 화면의 식별 정보를 중립 값으로 바꾼다.
 *
 * 왜 필요한가: 이 저장소는 공개다. `check-secrets` 는 텍스트만 읽고 PNG 안은 못 본다.
 * 실제 콘솔 화면에는 조직명·프로젝트명·클러스터 ID·엔드포인트 UUID·서비스 주소·S3 경로가
 * 그대로 찍히고, 특히 엔드포인트 주소는 게이트웨이에 인증이 없으면 그 자체가 접근 권한이다.
 *
 * 그림판으로 덧칠하는 대신 **DOM 텍스트를 바꾼 뒤 촬영**한다. 레이아웃이 살아 있고,
 * 매번 같은 결과가 나오며, 가림 상자가 화면을 가리지 않는다.
 *
 * 한계: 캔버스·이미지 안에 그려진 글자는 못 바꾼다. 그래서 캡처는 사람이 한 번 본다.
 */

export type SanitizeOptions = {
  /** 조직/테넌트 이름 (예: 'ETRI') → 중립값으로 치환 */
  org?: string
  /** 추가 치환 규칙 (문자열 또는 정규식 → 대체값) */
  extra?: Array<[string | RegExp, string]>
}

/** 어떤 환경에서 찍어도 지워야 하는 것들. */
function buildRules(opts: SanitizeOptions): Array<[RegExp, string]> {
  const rules: Array<[RegExp, string]> = [
    // 엔드포인트 quick-access 호스트가 가장 위험하다 — 주소가 곧 접근 권한이다.
    [/\b[0-9a-f]{12}-\d{2,5}\.[a-z0-9.-]+\.[a-z]{2,}\b/gi, 'your-endpoint-host'],
    // 콘솔·클러스터 호스트
    [/\b[a-z0-9-]+\.thakicloud\.(net|com|site)\b/gi, 'your-console-host'],
    [/\bs3:\/\/[^\s"'<>]+/gi, 's3://models/example'],
    // 전체 UUID
    [
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      '00000000-0000-0000-0000-000000000000',
    ],
    // 콘솔이 줄여 보여주는 짧은 id (예: 83302859-815c)
    [/\b[0-9a-f]{8}-[0-9a-f]{4}\b/gi, 'cluster-01'],
    // 쿠버네티스 네임스페이스
    [/\bproject-[0-9a-f-]{8,}\b/gi, 'project-example'],
    // 사설 IP
    [
      /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g,
      '10.0.0.1',
    ],
  ]

  if (opts.org) {
    const org = opts.org
    // 조직 이름은 단독으로도, 리소스 이름 안에도 박혀 있다(etri-rbln-serving, tkai-etri).
    rules.push([new RegExp(`\\b${org}\\b`, 'g'), org.toUpperCase() === org ? 'ACME' : 'acme'])
    rules.push([new RegExp(org, 'gi'), 'acme'])
  }

  for (const [from, to] of opts.extra ?? []) {
    rules.push([from instanceof RegExp ? from : new RegExp(escapeRe(from), 'gi'), to])
  }
  return rules
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 현재 페이지의 모든 텍스트 노드와 input value 를 치환한다.
 * 화면이 다시 그려지면 되돌아가므로 **촬영 직전에** 부른다.
 */
export async function sanitizePage(page: Page, opts: SanitizeOptions = {}): Promise<void> {
  const rules = buildRules(opts).map(([re, to]) => [re.source, re.flags, to] as const)

  await page.evaluate((serialized) => {
    const compiled = serialized.map(([source, flags, to]) => [new RegExp(source, flags), to] as const)
    const apply = (text: string): string => {
      let out = text
      for (const [re, to] of compiled) out = out.replace(re, to as string)
      return out
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const targets: Text[] = []
    while (walker.nextNode()) targets.push(walker.currentNode as Text)
    for (const node of targets) {
      const next = apply(node.nodeValue ?? '')
      if (next !== node.nodeValue) node.nodeValue = next
    }

    for (const el of Array.from(document.querySelectorAll('input, textarea'))) {
      const input = el as HTMLInputElement
      if (input.type === 'password') continue
      const next = apply(input.value ?? '')
      if (next !== input.value) input.value = next
      if (input.placeholder) input.placeholder = apply(input.placeholder)
    }

    // title 속성·aria-label 에도 주소가 들어간다(복사 버튼 툴팁 등).
    for (const el of Array.from(document.querySelectorAll('[title], [aria-label]'))) {
      const t = el.getAttribute('title')
      if (t) el.setAttribute('title', apply(t))
      const a = el.getAttribute('aria-label')
      if (a) el.setAttribute('aria-label', apply(a))
    }
  }, rules)
}
