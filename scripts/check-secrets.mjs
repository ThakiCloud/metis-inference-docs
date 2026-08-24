#!/usr/bin/env node
/**
 * 공개 레포 게이트 — 배포 전에 코드가 판정한다.
 *
 * 산문으로 "실 호스트를 쓰지 말자"고 부탁하면 언젠가 새어 나간다. 그래서 CI 가
 * 실행하는 검사로 만들었다. 하나라도 걸리면 exit 1 이고 배포가 서지 않는다.
 *
 * 검사하는 것:
 *  1. 실 배포 호스트명 (문서는 플레이스홀더만 쓴다)
 *  2. 토큰·키처럼 보이는 문자열 (JWT, sk-, ghp_, AWS 키, PEM)
 *  3. 내부 인프라 노출 (클러스터 내부 DNS, 사설 IP)
 *  4. 실 엔드포인트 접속 주소 형태 ({12hex}-{port}.도메인) — 이게 곧 접근 권한이다
 *
 *   node scripts/check-secrets.mjs [--dir docs]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
const targetDir = join(ROOT, argv[argv.indexOf('--dir') + 1] ?? 'docs')

/** 스캔 대상 확장자. 이미지·스펙 원본은 별도 규칙으로 다룬다. */
const TEXT_EXT = new Set(['.md', '.ts', '.mts', '.js', '.mjs', '.vue', '.json', '.yml', '.yaml', '.css'])
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'cache', '.vitepress/dist', '.vitepress/cache'])

/** 스펙 원본은 벤더가 준 파일이라 호스트 규칙에서 면제한다(필터 스크립트가 host 를 지운다). */
const EXEMPT = [
  /docs\/public\/metis-inference\.openapi\.json$/,
  /^spec\//,
  /scripts\/check-secrets\.mjs$/, // 이 파일 자신의 패턴 문자열
]

const RULES = [
  {
    id: 'real-host',
    severity: 'error',
    // 실 배포 도메인. 문서는 <your-console-host> / <your-endpoint-host> 만 쓴다.
    re: /\b[a-z0-9-]+\.thakicloud\.(net|com|site)\b/gi,
    hint: '실 호스트 대신 <your-console-host> 또는 <your-endpoint-host> 플레이스홀더를 쓰세요.',
    allow: [/github\.com\/ThakiCloud/i, /www\.thakicloud\.com/i],
  },
  {
    id: 'endpoint-quick-access-host',
    severity: 'error',
    // {12자리 hex}-{포트}.{도메인} — 실 엔드포인트 접속 주소 형태
    re: /\b[0-9a-f]{12}-\d{2,5}\.[a-z0-9.-]+\.[a-z]{2,}\b/gi,
    hint: '실 엔드포인트 주소는 곧 접근 권한입니다. 예제는 <your-endpoint-host> 로 쓰세요.',
    allow: [],
  },
  {
    id: 'jwt',
    severity: 'error',
    re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g,
    hint: '실제 JWT 로 보입니다. 예제는 잘린 형태(eyJhbGciOi...)로 쓰세요.',
    allow: [],
  },
  {
    id: 'api-key-like',
    severity: 'error',
    re: /\b(?:sk-(?!thaki-x)[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/g,
    hint: '키처럼 보이는 문자열입니다. 플레이스홀더로 바꾸세요.',
    allow: [],
  },
  {
    id: 'private-key',
    severity: 'error',
    re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
    hint: '개인키는 어떤 형태로도 커밋하지 않습니다.',
    allow: [],
  },
  {
    id: 'internal-infra',
    severity: 'error',
    re: /\b(?:[a-z0-9-]+\.)*svc\.cluster\.local\b/gi,
    hint: '클러스터 내부 DNS 는 공개 문서에 적지 않습니다.',
    allow: [],
  },
  {
    id: 'private-ip',
    severity: 'warn',
    re: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g,
    hint: '사설 IP 가 보입니다. 예시용이 맞는지 확인하세요.',
    allow: [],
  },
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = relative(ROOT, full)
    if (SKIP_DIRS.has(name) || SKIP_DIRS.has(rel)) continue
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (TEXT_EXT.has(extname(name))) out.push(full)
  }
  return out
}

const findings = []
for (const file of walk(targetDir)) {
  const rel = relative(ROOT, file)
  if (EXEMPT.some((re) => re.test(rel))) continue
  const lines = readFileSync(file, 'utf8').split('\n')

  for (const rule of RULES) {
    lines.forEach((line, i) => {
      if (rule.allow.some((re) => re.test(line))) return
      const matches = line.match(rule.re)
      if (!matches) return
      for (const m of new Set(matches)) {
        findings.push({ rule, file: rel, line: i + 1, match: m })
      }
    })
  }
}

const errors = findings.filter((f) => f.rule.severity === 'error')
const warns = findings.filter((f) => f.rule.severity === 'warn')

for (const f of [...errors, ...warns]) {
  const tag = f.rule.severity === 'error' ? 'ERROR' : 'WARN '
  console.log(`${tag} ${f.file}:${f.line}  [${f.rule.id}]  ${f.match}`)
  console.log(`      → ${f.rule.hint}`)
}

console.log(
  `\nscanned ${targetDir.replace(ROOT + '/', '')} — ${errors.length} error, ${warns.length} warn`,
)

if (errors.length > 0) {
  console.error('\nGATE FAIL: 공개 레포에 들어가면 안 되는 내용이 있습니다.')
  process.exit(1)
}
console.log('GATE OK')
