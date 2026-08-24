#!/usr/bin/env node
/**
 * Metis Swagger → 추론 문서용 스펙으로 필터링한다.
 *
 * 왜 필터링하나: 원본은 201 operation 인데 그중 Kueue(큐 스케줄링) 41개는
 * 이 문서의 범위가 아니다. 큐레이션 없이 통째로 렌더하면 독자가 추론에 필요한
 * 것을 찾지 못한다.
 *
 * 이 스크립트가 게이트를 겸한다 — 결과 operation 수가 기대치와 다르면 exit 1.
 * 포맷·집계를 모델이 아니라 코드가 소유한다.
 *
 *   node scripts/filter-openapi.mjs <source.json> [--out <path>] [--expect 160]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']

/** 제외할 태그 접두사. 큐는 이 문서의 범위가 아니다(사용자 확정 2026-08-25). */
const EXCLUDED_TAG_PREFIXES = ['Kueue']

const argv = process.argv.slice(2)
if (argv.length === 0 || argv[0].startsWith('--')) {
  console.error('usage: node scripts/filter-openapi.mjs <source.json> [--out <path>] [--expect N]')
  process.exit(2)
}
const source = resolve(argv[0])
const outPath = resolve(flag('--out') ?? 'docs/public/metis-inference.openapi.json')
const expected = flag('--expect') ? Number(flag('--expect')) : null

function flag(name) {
  const i = argv.indexOf(name)
  return i === -1 ? undefined : argv[i + 1]
}

const spec = JSON.parse(readFileSync(source, 'utf8'))
const isExcluded = (tag) => EXCLUDED_TAG_PREFIXES.some((p) => tag.startsWith(p))

// ── 1. Kueue operation 제거 ────────────────────────────────────────────
const paths = {}
let kept = 0
let dropped = 0
const keptTags = new Map()

for (const [path, item] of Object.entries(spec.paths ?? {})) {
  const next = {}
  for (const [method, op] of Object.entries(item)) {
    if (!HTTP_METHODS.includes(method)) {
      next[method] = op
      continue
    }
    const tag = (op.tags ?? ['<none>'])[0]
    if (isExcluded(tag)) {
      dropped++
      continue
    }
    next[method] = op
    kept++
    keptTags.set(tag, (keptTags.get(tag) ?? 0) + 1)
  }
  if (HTTP_METHODS.some((m) => m in next)) paths[path] = next
}

// ── 2. 남은 operation 이 참조하는 definition 만 남긴다 (전이 폐포) ──────
const allDefs = spec.definitions ?? {}
const needed = new Set()
const refRe = /#\/definitions\/([^"']+)/g

function walk(node) {
  if (node == null) return
  if (typeof node === 'string') {
    for (const m of node.matchAll(refRe)) queue.push(decodeURIComponent(m[1]))
    return
  }
  if (Array.isArray(node)) return node.forEach(walk)
  if (typeof node !== 'object') return
  for (const [k, v] of Object.entries(node)) {
    if (k === '$ref' && typeof v === 'string') {
      const m = /^#\/definitions\/(.+)$/.exec(v)
      if (m) queue.push(decodeURIComponent(m[1]))
    } else walk(v)
  }
}

const queue = []
walk(paths)
while (queue.length) {
  const name = queue.pop()
  if (needed.has(name) || !(name in allDefs)) continue
  needed.add(name)
  walk(allDefs[name])
}

const definitions = Object.fromEntries(
  Object.entries(allDefs)
    .filter(([name]) => needed.has(name))
    .sort(([a], [b]) => a.localeCompare(b)),
)

// ── 3. 호스트 정보 제거 (공개 레포 — 실 호스트를 스펙에 박지 않는다) ──
const out = {
  ...spec,
  host: undefined,
  schemes: undefined,
  paths,
  definitions,
  tags: (spec.tags ?? []).filter((t) => !isExcluded(t.name)),
}
delete out.host
delete out.schemes

// ── 3.5 참조 무결성 ──────────────────────────────────────────────────
// 정의를 쳐낸 뒤 참조만 남아 있으면 뷰어가 조용히 빈 스키마를 그린다.
// "빈 화면"은 원인을 못 짚으므로 여기서 잡는다.
const serialized = JSON.stringify(out)
const referenced = new Set(
  [...serialized.matchAll(/#\/definitions\/([^"]+)/g)].map((m) => decodeURIComponent(m[1])),
)
const dangling = [...referenced].filter((name) => !(name in definitions))

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n')

// ── 4. 리포트 + 게이트 ────────────────────────────────────────────────
const tagReport = [...keptTags.entries()].sort((a, b) => b[1] - a[1])
console.log(`source     : ${source}`)
console.log(`out        : ${outPath}`)
console.log(`operations : kept ${kept}, dropped ${dropped} (${EXCLUDED_TAG_PREFIXES.join(', ')})`)
console.log(`tags       : ${tagReport.length}`)
console.log(`definitions: ${Object.keys(definitions).length} / ${Object.keys(allDefs).length}`)
for (const [tag, n] of tagReport) console.log(`  ${String(n).padStart(3)}  ${tag}`)

let failed = false

if (dangling.length > 0) {
  console.error(`\nGATE FAIL: ${dangling.length} dangling $ref — 정의가 없는 참조가 남았습니다`)
  for (const name of dangling.slice(0, 10)) console.error(`  #/definitions/${name}`)
  failed = true
}

if (expected !== null && kept !== expected) {
  console.error(`\nGATE FAIL: expected ${expected} operations, got ${kept}`)
  console.error('  스펙 범위가 바뀌었습니다. 무엇이 늘고 줄었는지 확인한 뒤 --expect 를 고치세요.')
  failed = true
}

if (failed) process.exit(1)
console.log(`\nrefs: ${referenced.size} resolved, 0 dangling`)
console.log('GATE OK')
