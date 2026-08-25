/**
 * 문서용 화면 캡처.
 *
 * 실행 (자격 정보는 환경변수로만 — 파일에 쓰지 않는다):
 *   E_URL=https://<console> E_DOMAIN=<domain> E_USER=<id> E_PASS=<pw> \
 *     node tests/capture.mjs [slug ...]
 *
 * 촬영 직전에 DOM 을 치환해 조직명·프로젝트명·클러스터 ID·엔드포인트 주소를 지운다.
 * 이 저장소는 공개이고, 텍스트 게이트는 PNG 안을 읽지 못한다.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const { E_URL, E_DOMAIN = '', E_USER, E_PASS } = process.env
if (!E_URL || !E_USER || !E_PASS) {
  console.error('E_URL / E_USER / E_PASS 가 필요합니다. E_DOMAIN 은 로그인 폼에 Domain 필드가 있을 때만.')
  process.exit(2)
}

const OUT = 'docs/public/images'
const only = new Set(process.argv.slice(2))
const want = (slug) => only.size === 0 || only.has(slug)

const RULES = [
  [/\b[0-9a-f]{12}-\d{2,5}\.[a-z0-9.-]+\.[a-z]{2,}\b/gi, 'your-endpoint-host'],
  [/\b[a-z0-9-]+\.thakicloud\.(net|com|site)\b/gi, 'your-console-host'],
  [/\bs3:\/\/[^\s"'<>]+/gi, 's3://models/example'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '00000000-0000-0000-0000-000000000000'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}\b/gi, 'cluster-01'],
  [/\bproject-[0-9a-f-]{8,}\b/gi, 'project-example'],
  [/\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g, '10.0.0.1'],
  [/\bETRI\b/g, 'ACME'],
  [/etri/gi, 'acme'],
  [/\btkai\b/gi, 'platform'],
]

async function sanitize(page) {
  await page.evaluate(
    (rs) => {
      const c = rs.map(([s, f, t]) => [new RegExp(s, f), t])
      const ap = (x) => { let o = x; for (const [re, t] of c) o = o.replace(re, t); return o }
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const nodes = []
      while (w.nextNode()) nodes.push(w.currentNode)
      for (const n of nodes) { const v = ap(n.nodeValue || ''); if (v !== n.nodeValue) n.nodeValue = v }
      for (const el of document.querySelectorAll('input, textarea')) {
        if (el.type === 'password') continue
        const v = ap(el.value || ''); if (v !== el.value) el.value = v
        if (el.placeholder) el.placeholder = ap(el.placeholder)
      }
      for (const el of document.querySelectorAll('[title]')) el.setAttribute('title', ap(el.getAttribute('title')))
    },
    RULES.map(([re, to]) => [re.source, re.flags, to]),
  )
}

async function shot(page, slug, sub) {
  const path = join(OUT, sub, `${slug}.png`)
  mkdirSync(dirname(path), { recursive: true })
  await page.waitForTimeout(1200)
  await sanitize(page)
  await page.screenshot({ path })
  console.log('  captured', path)
}

/** 사이드바 항목을 클릭한다. 앱 창 안의 nav 만 대상으로 한다. */
async function nav(page, label) {
  const item = page.locator('aside, nav').locator(`text="${label}"`).first()
  await item.click({ force: true, timeout: 15000 })
  await page.waitForTimeout(3500)
}

/** 데스크톱에서 앱 아이콘을 연다. 마지막 매칭이 Admin Center 안의 것이다. */
async function openApp(page, name, { admin = false } = {}) {
  await page.goto(E_URL + '/desktop', { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2500)
  const icons = page.locator('[aria-label="Desktop icons"]')
  if (admin) {
    await icons.locator('text=Admin Center').first().dblclick({ force: true })
    await page.waitForTimeout(2500)
  }
  const all = page.locator(`text=${name}`)
  const n = await all.count()
  for (let i = n - 1; i >= 0; i--) {
    try {
      await all.nth(i).dblclick({ force: true, timeout: 4000 })
      await page.waitForTimeout(6000)
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
      if (body.includes('Dashboard')) return
    } catch { /* 다음 후보 */ }
  }
  throw new Error(`앱을 열지 못했습니다: ${name}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: 'light',
  deviceScaleFactor: 2,
})
const page = await context.newPage()

// ── 로그인 ────────────────────────────────────────────────────────────
await page.goto(E_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2000)
if (E_DOMAIN && (await page.locator('#domain').count())) await page.fill('#domain', E_DOMAIN)
await page.fill('#username', E_USER)
await page.fill('#password', E_PASS)
await page.click('button:has-text("Login")')
await page.waitForTimeout(7000)
if (page.url().includes('/login')) throw new Error('로그인 실패 — 자격 정보를 확인하세요')
console.log('로그인 완료')

// ── AI Inference 앱 ───────────────────────────────────────────────────
// 목록은 데이터가 있는 화면에서 찍는다 — 빈 목록은 설명이 안 된다.
const USER_SCREENS = [
  ['Dashboard', 'dashboard-overview'],
  ['Rebellions', 'serverless-list'],
  ['Templates', 'templates-list'],
  ['Workloads', 'workloads-list'],
  ['Volumes', 'volumes-list'],
  ['Projects', 'projects-list'],
]

/** 생성 폼: 목록에서 Create endpoint 버튼을 누른다. */
const CREATE_FORMS = [
  ['Docker', 'serverless-create-docker'],
  ['CPU', 'serverless-create-vllm-cpu'],
  ['Rebellions', 'serverless-create-vllm-rbln'],
]

const INTERACTIVE = ['serverless-action-menu', 'serverless-service-url-panel', 'serverless-prompt-panel', 'serverless-logs-panel']

if ([...USER_SCREENS.map(([, s]) => s), ...CREATE_FORMS.map(([, s]) => s), ...INTERACTIVE].some(want)) {
  console.log('\n[AI Inference]')
  await openApp(page, 'AI inference')

  for (const [label, slug] of USER_SCREENS) {
    if (!want(slug)) continue
    try { await nav(page, label); await shot(page, slug, 'inference') }
    catch (e) { console.log(`  SKIP ${slug}: ${e.message.split('\n')[0]}`) }
  }

  for (const [label, slug] of CREATE_FORMS) {
    if (!want(slug)) continue
    try {
      await nav(page, label)
      await page.locator('button:has-text("Create endpoint")').first().click({ timeout: 15000 })
      await page.waitForTimeout(4000)
      await shot(page, slug, 'inference')
    } catch (e) { console.log(`  SKIP ${slug}: ${e.message.split('\n')[0]}`) }
  }

  // 행 액션 메뉴와 거기서 열리는 패널들 — 이 문서의 핵심(Service URL)이 여기 있다.
  if (INTERACTIVE.some(want)) {
    try {
      await nav(page, 'Rebellions')
      const actionBtn = page.locator('table tbody tr').first().locator('td').last().locator('button').first()
      await actionBtn.click({ timeout: 15000 })
      await page.waitForTimeout(1500)
      if (want('serverless-action-menu')) await shot(page, 'serverless-action-menu', 'inference')

      for (const [menuLabel, slug] of [
        [/service\s*url/i, 'serverless-service-url-panel'],
        [/prompt/i, 'serverless-prompt-panel'],
        [/log/i, 'serverless-logs-panel'],
      ]) {
        if (!want(slug)) continue
        try {
          const open = await page.locator('table tbody tr').first().locator('td').last().locator('button').first()
          if (!(await page.getByRole('menuitem').count())) { await open.click(); await page.waitForTimeout(1200) }
          await page.getByRole('menuitem').filter({ hasText: menuLabel }).first().click({ timeout: 8000 })
          await page.waitForTimeout(3500)
          await shot(page, slug, 'inference')
          await page.keyboard.press('Escape')
          await page.waitForTimeout(1200)
        } catch (e) { console.log(`  SKIP ${slug}: ${e.message.split('\n')[0]}`) }
      }
    } catch (e) { console.log(`  SKIP action menu: ${e.message.split('\n')[0]}`) }
  }
}

// ── Admin AI Inference 앱 ─────────────────────────────────────────────
const ADMIN_SCREENS = [
  ['Dashboard', 'admin-overview'],
  ['Docker', 'admin-endpoint-list'],
  ['Nodes', 'admin-monitoring-nodes'],
  ['Usage Trend', 'admin-monitoring-usage-trend'],
  ['Connected Clusters', 'admin-monitoring-clusters'],
  ['Dependencies', 'admin-monitoring-dependencies'],
  ['Projects', 'admin-management-projects'],
]

if (ADMIN_SCREENS.some(([, s]) => want(s))) {
  console.log('\n[Admin AI Inference]')
  await openApp(page, 'AI inference', { admin: true })
  for (const [label, slug] of ADMIN_SCREENS) {
    if (!want(slug)) continue
    try { await nav(page, label); await shot(page, slug, 'admin') }
    catch (e) { console.log(`  SKIP ${slug}: ${e.message.split('\n')[0]}`) }
  }
}

await browser.close()
console.log('\n완료')
