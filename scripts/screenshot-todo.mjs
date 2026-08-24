#!/usr/bin/env node
/**
 * 아직 캡처가 안 들어간 자리를 센다.
 *
 * 문서에 `<!-- SCREENSHOT: slug -->` 주석이 남아 있으면 그 자리는 아직 그림이 없다는 뜻이다.
 * 캡처 작업의 할 일 목록이자, "다 넣었다"는 주장을 코드가 확인하는 지점이다.
 *
 *   node scripts/screenshot-todo.mjs            # 남은 자리 목록
 *   node scripts/screenshot-todo.mjs --require-none   # 하나라도 남으면 exit 1
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const DOCS = join(ROOT, 'docs')
const IMAGES = join(DOCS, 'public', 'images')
const requireNone = process.argv.includes('--require-none')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (name === 'node_modules' || name.startsWith('.')) continue
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (name.endsWith('.md')) out.push(full)
  }
  return out
}

const pending = []
const placed = []

for (const file of walk(DOCS)) {
  const rel = relative(ROOT, file)
  const text = readFileSync(file, 'utf8')

  for (const m of text.matchAll(/<!--\s*SCREENSHOT:\s*([a-z0-9-]+)\s*-->/gi)) {
    pending.push({ file: rel, slug: m[1] })
  }
  for (const m of text.matchAll(/!\[[^\]]*\]\((\/images\/[^)]+)\)/g)) {
    placed.push({ file: rel, src: m[1] })
  }
}

// 이미 넣은 이미지가 실제로 존재하는지 — 깨진 그림은 빈 화면보다 나쁘다.
const broken = placed.filter(({ src }) => !existsSync(join(DOCS, 'public', src.replace(/^\//, ''))))

const byFile = new Map()
for (const p of pending) {
  if (!byFile.has(p.file)) byFile.set(p.file, [])
  byFile.get(p.file).push(p.slug)
}

if (byFile.size > 0) {
  console.log('캡처가 필요한 자리\n')
  for (const [file, slugs] of [...byFile].sort()) {
    console.log(`  ${file}`)
    for (const s of slugs) console.log(`      ${s}`)
  }
  console.log()
}

if (broken.length > 0) {
  console.log('⛔ 참조하는데 파일이 없는 이미지\n')
  for (const b of broken) console.log(`  ${b.file} → ${b.src}`)
  console.log()
}

const imageCount = existsSync(IMAGES) ? walkFiles(IMAGES).length : 0
function walkFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    statSync(full).isDirectory() ? walkFiles(full, out) : out.push(full)
  }
  return out
}

console.log(`대기 ${pending.length}자리 / 배치 ${placed.length}장 / 보유 이미지 ${imageCount}개`)

if (broken.length > 0) {
  console.error('\nGATE FAIL: 존재하지 않는 이미지를 참조합니다.')
  process.exit(1)
}
if (requireNone && pending.length > 0) {
  console.error(`\nGATE FAIL: 캡처 대기 ${pending.length}자리가 남았습니다.`)
  process.exit(1)
}
console.log('GATE OK')
