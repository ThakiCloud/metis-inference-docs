/**
 * 주석 캡처 — 앱 창만 잘라내고, 설명이 필요한 곳에 빨간 박스와 번호 배지를 얹는다.
 *
 * 시각 규격은 기존 사용자 가이드와 같다.
 *   부모(영역) = 3px 실선 · 자식(요소) = 2px 점선 + 옅은 채움 · 배지 = 빨간 알약
 *
 * 실행:
 *   E_URL=... E_DOMAIN=... E_USER=... E_PASS=... node tests/annotate.mjs [slug ...]
 *
 * 촬영 직전 DOM 치환은 capture.mjs 와 동일하다 — 공개 저장소이므로 조직명·주소·ID 를 지운다.
 */
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const { E_URL, E_DOMAIN = '', E_USER, E_PASS } = process.env
if (!E_URL || !E_USER || !E_PASS) { console.error('E_URL / E_USER / E_PASS 필요'); process.exit(2) }

const only = new Set(process.argv.slice(2))
const want = (s) => only.size === 0 || only.has(s)
const RED = '#e8334a'

const RULES = [
  [/\b[0-9a-f]{12}-\d{2,5}\.[a-z0-9.-]+\.[a-z]{2,}\b/gi, 'your-endpoint-host'],
  [/\b[a-z0-9-]+\.thakicloud\.(net|com|site)\b/gi, 'your-console-host'],
  [/\bs3:\/\/[^\s"'<>]+/gi, 's3://models/example'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '00000000-0000-0000-0000-000000000000'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}\b/gi, 'cluster-01'],
  [/\bproject-[0-9a-f-]{8,}\b/gi, 'project-example'],
  [/\b[0-9a-f]{12}\b/gi, 'pod00000000'],
  [/-[0-9a-f]{8}-[0-9a-f]{6,12}\b/gi, '-pod00000000'],
  [/\bETRI\b/g, 'ACME'], [/etri/gi, 'acme'], [/\btkai\b/gi, 'platform'],
]

async function sanitize(page) {
  await page.evaluate((rs) => {
    const c = rs.map(([s, f, t]) => [new RegExp(s, f), t])
    const ap = (x) => { let o = x; for (const [re, t] of c) o = o.replace(re, t); return o }
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const n = []
    while (w.nextNode()) n.push(w.currentNode)
    for (const t of n) { const v = ap(t.nodeValue || ''); if (v !== t.nodeValue) t.nodeValue = v }
    for (const el of document.querySelectorAll('input,textarea')) {
      if (el.type === 'password') continue
      const v = ap(el.value || ''); if (v !== el.value) el.value = v
      if (el.placeholder) el.placeholder = ap(el.placeholder)
    }
  }, RULES.map(([re, to]) => [re.source, re.flags, to]))
}

/** 데스크톱 배경과 플랫폼 상단바를 뺀, 앱 창만의 사각형. */
async function windowClip(page) {
  const box = await page.evaluate(() => {
    let best = null
    for (const el of document.querySelectorAll('div,section')) {
      const r = el.getBoundingClientRect()
      if (r.width < 800 || r.height < 500 || r.top < 30) continue
      const t = el.innerText || ''
      if (!/Dashboard|Serverless|Docker/.test(t)) continue
      if (!best || r.width * r.height > best.w * best.h) {
        best = { x: r.x, y: r.y, w: r.width, h: r.height }
      }
    }
    return best
  })
  if (!box) return undefined
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.w), height: Math.round(box.h) }
}

/**
 * 마커를 그린다.
 *  { n, selector | rect, dashed?, badgePos? }
 * 좌표는 뷰포트 기준으로 그리고, 스크린샷 clip 이 알아서 잘라낸다.
 */
async function drawMarkers(page, markers, clip) {
  const resolved = []
  for (const m of markers) {
    let box = m.rect
    if (m.selector) {
      const loc = page.locator(m.selector).first()
      if (!(await loc.count())) { console.log(`    marker ${m.n}: 대상 없음 (${m.selector})`); continue }
      const bb = await loc.boundingBox().catch(() => null)
      if (!bb) { console.log(`    marker ${m.n}: 화면 밖`); continue }
      box = { x: bb.x, y: bb.y, w: bb.width, h: bb.height }
    }
    if (!box) continue
    resolved.push({ n: String(m.n), box, dashed: !!m.dashed, badgePos: m.badgePos || 'top' })
  }

  await page.evaluate(({ items, RED, clip }) => {
    document.getElementById('__doc_badges__')?.remove()
    const layer = document.createElement('div')
    layer.id = '__doc_badges__'
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;'

    for (const t of items) {
      const box = document.createElement('div')
      const border = t.dashed ? `2px dashed ${RED}` : `3px solid ${RED}`
      const fill = t.dashed ? 'rgba(232,51,74,0.12)' : 'transparent'
      const radius = t.dashed ? 6 : 10
      box.style.cssText =
        `position:absolute;left:${t.box.x}px;top:${t.box.y}px;width:${t.box.w}px;height:${t.box.h}px;` +
        `border:${border};border-radius:${radius}px;background:${fill};` +
        'box-shadow:0 0 0 1px rgba(255,255,255,0.7);box-sizing:border-box;'
      layer.appendChild(box)

      let left, top, transform = 'translate(-50%, -50%)'
      if (t.badgePos === 'left') { left = t.box.x - 4; top = t.box.y + t.box.h / 2 }
      else if (t.badgePos === 'right') { left = t.box.x + t.box.w + 4; top = t.box.y + t.box.h / 2 }
      else { left = t.box.x + 14; top = t.box.y }
      // 창 밖으로 나가면 안쪽으로 당긴다 — 잘린 배지는 번호를 못 읽는다.
      const minX = (clip?.x ?? 0) + 16
      if (left < minX) left = minX

      const b = document.createElement('div')
      b.textContent = t.n
      b.style.cssText =
        `position:absolute;left:${left}px;top:${top}px;transform:${transform};` +
        'display:flex;align-items:center;justify-content:center;' +
        'min-width:26px;height:24px;padding:0 7px;box-sizing:border-box;border-radius:12px;' +
        `background:${RED};color:#fff;font-weight:700;font-size:13px;white-space:nowrap;` +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'box-shadow:0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,0.45);'
      layer.appendChild(b)
    }
    document.body.appendChild(layer)
  }, { items: resolved, RED, clip })

  return resolved.length
}

async function clearMarkers(page) {
  await page.evaluate(() => document.getElementById('__doc_badges__')?.remove())
}

async function shoot(page, slug, sub, markers) {
  await page.waitForTimeout(1200)
  await sanitize(page)
  const clip = await windowClip(page)
  const drawn = markers?.length ? await drawMarkers(page, markers, clip) : 0
  const path = join('docs/public/images', sub, `${slug}.png`)
  mkdirSync(dirname(path), { recursive: true })
  await page.screenshot({ path, clip })
  await clearMarkers(page)
  console.log(`  ${slug}  (마커 ${drawn}개)`)
}

async function nav(page, label) {
  // 열린 드로어가 사이드바를 덮으면 클릭이 30초를 기다리다 죽는다 — 먼저 치운다.
  let lastErr
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.locator('aside, nav').locator(`text="${label}"`).first().click({ force: true, timeout: 8000 })
      await page.waitForTimeout(3500)
      return
    } catch (e) {
      lastErr = e
      for (const sel of ['button:has-text("Cancel")', 'button:has-text("Close")']) {
        const b = page.locator(sel).last()
        if (await b.count()) { await b.click({ force: true }).catch(() => {}); break }
      }
      await page.waitForTimeout(2000)
    }
  }
  throw lastErr
}

async function openApp(page, name, admin = false) {
  await page.goto(E_URL + '/desktop', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2500)
  if (admin) {
    await page.locator('[aria-label="Desktop icons"]').locator('text=Admin Center').first().dblclick({ force: true })
    await page.waitForTimeout(2500)
  }
  const all = page.locator(`text=${name}`)
  for (let i = (await all.count()) - 1; i >= 0; i--) {
    try {
      await all.nth(i).dblclick({ force: true, timeout: 4000 })
      await page.waitForTimeout(6000)
      if ((await page.locator('body').innerText()).includes('Dashboard')) return
    } catch { /* 다음 후보 */ }
  }
  throw new Error('앱 열기 실패')
}

/**
 * 텍스트와 크기로 사각형을 찾는다.
 *
 * xpath `ancestor::div[N]` 은 DOM 이 조금만 달라져도 엉뚱한 조상을 잡는다(실제로 잡았다).
 * 대신 "이 문구들을 모두 담고 있으면서 크기 조건을 만족하는 가장 작은 요소"로 찾는다.
 * 조건에 안 맞으면 null 을 돌려주고, 호출부는 그 마커를 건너뛴다 — 엉뚱한 곳에 박스를
 * 그리느니 안 그리는 편이 낫다.
 */
async function findRect(page, { contains = [], minW = 0, maxW = 1e9, minH = 0, maxH = 1e9, within = null }) {
  return page.evaluate(({ contains, minW, maxW, minH, maxH, within }) => {
    const res = contains.map((s) => new RegExp(s, 'i'))
    let best = null
    for (const el of document.querySelectorAll('div,aside,nav,section,table,form')) {
      const r = el.getBoundingClientRect()
      if (r.width < minW || r.width > maxW || r.height < minH || r.height > maxH) continue
      if (within && (r.x < within.x - 2 || r.x + r.width > within.x + within.w + 2)) continue
      const t = el.innerText || ''
      if (!res.every((re) => re.test(t))) continue
      if (!best || r.width * r.height < best.w * best.h) best = { x: r.x, y: r.y, w: r.width, h: r.height }
    }
    return best
  }, { contains, minW, maxW, minH, maxH, within })
}

/** 사이드바 — 메뉴 항목을 담은 가장 좁은 세로 컨테이너. */
const sidebarRect = (page) =>
  findRect(page, { contains: ['Dashboard', 'Volumes|Projects|Nodes'], minW: 120, maxW: 420, minH: 300 })

/** 오른쪽에서 열리는 드로어 — 제목과 Cancel 버튼을 함께 담은 패널. */
const drawerRect = (page, title) =>
  findRect(page, { contains: [title, 'Cancel'], minW: 300, maxW: 800, minH: 400 })

const TABLE = 'table'
const E_EP = process.env.E_EP || ''

/** 캡처 대상 행. E_EP 가 있으면 그 이름의 행, 없으면 첫 행. */
async function targetRow(page) {
  const rows = page.locator('table tbody tr')
  if (E_EP) {
    const n = await rows.count()
    for (let i = 0; i < n; i++) {
      const name = (await rows.nth(i).locator('td').nth(2).innerText()).split('\n')[0].trim()
      if (name === E_EP) return rows.nth(i)
    }
    console.log(`    (E_EP=${E_EP} 인 행이 없어 첫 행을 쓴다)`)
  }
  return rows.first()
}

/** 드로어는 Escape 가 안 먹는다 — Cancel 버튼으로 닫는다. */
async function closeDrawer(page) {
  for (const sel of ['button:has-text("Cancel")', 'button:has-text("Close")']) {
    const b = page.locator(sel).last()
    if (await b.count()) { await b.click({ force: true }).catch(() => {}); break }
  }
  await page.waitForTimeout(1800)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, colorScheme: 'light', deviceScaleFactor: 2 })
const page = await context.newPage()

await page.goto(E_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2000)
if (E_DOMAIN && (await page.locator('#domain').count())) await page.fill('#domain', E_DOMAIN)
await page.fill('#username', E_USER); await page.fill('#password', E_PASS)
await page.click('button:has-text("Login")'); await page.waitForTimeout(7000)
if (page.url().includes('/login')) throw new Error('로그인 실패')
console.log('로그인 완료\n[AI Inference]')

await openApp(page, 'AI inference')

if (want('dashboard-overview')) {
  await nav(page, 'Dashboard')
  await shoot(page, 'dashboard-overview', 'inference', [
    { n: 1, rect: await sidebarRect(page), badgePos: 'right' },
    { n: 2, rect: await findRect(page, { contains: ['Cluster', 'Project'], minW: 400, minH: 120, maxH: 400 }), dashed: true },
    { n: 3, rect: await findRect(page, { contains: ['Capacity', 'Memory'], minW: 400, minH: 120, maxH: 400 }), dashed: true },
    { n: 4, rect: await findRect(page, { contains: ['Workload Summary'], minW: 250, minH: 120, maxH: 400 }), dashed: true },
    { n: 5, rect: await findRect(page, { contains: ['Recent Activities'], minW: 500, minH: 150 }) },
  ])
}

if (want('serverless-list')) {
  await nav(page, 'Rebellions')
  await shoot(page, 'serverless-list', 'inference', [
    { n: 1, rect: await sidebarRect(page), badgePos: 'right' },
    { n: 2, selector: 'input[placeholder*="filter" i]', dashed: true, badgePos: 'left' },
    { n: 3, selector: 'button:has-text("Create endpoint")', dashed: true, badgePos: 'left' },
    { n: 4, selector: TABLE },
  ])
}

if (want('serverless-create-vllm-rbln')) {
  await nav(page, 'Rebellions')
  await page.locator('button:has-text("Create endpoint")').first().click(); await page.waitForTimeout(4000)
  await shoot(page, 'serverless-create-vllm-rbln', 'inference', [
    { n: 1, rect: await findRect(page, { contains: ['Basic Information', 'Model'], minW: 500, minH: 300 }) },
    { n: 2, selector: 'input[placeholder^="e.g."]', dashed: true, badgePos: 'left' },
    { n: 3, selector: 'input[placeholder*="models" i]', dashed: true, badgePos: 'left' },
    { n: 4, rect: await findRect(page, { contains: ['Summary', 'Create'], minW: 200, maxW: 600, minH: 150, maxH: 420 }), dashed: true },
  ])
}

if (want('serverless-action-menu') || want('serverless-service-url-panel')) {
  await nav(page, 'Rebellions')
  await (await targetRow(page)).locator('td').last().locator('button').first().click()
  await page.waitForTimeout(1500)
  if (want('serverless-action-menu')) {
    await shoot(page, 'serverless-action-menu', 'inference', [
      { n: 1, selector: '[role=menu]', badgePos: 'left' },
    ])
  }
  if (want('serverless-service-url-panel')) {
    try {
      await page.getByRole('menuitem').filter({ hasText: /service\s*url/i }).first().click()
      await page.waitForTimeout(3500)
      const drawer = await drawerRect(page, 'Service URL')
      await shoot(page, 'serverless-service-url-panel', 'inference', [
        { n: 1, rect: drawer, badgePos: 'left' },
        { n: 2, rect: await findRect(page, { contains: ['^Name$|Name'], minW: 200, maxW: 620, minH: 40, maxH: 140, within: drawer }), dashed: true, badgePos: 'left' },
        { n: 3, rect: await findRect(page, { contains: ['Service URL', 'your-endpoint-host'], minW: 150, maxW: 640, minH: 30, maxH: 200, within: drawer }), dashed: true, badgePos: 'left' },
      ])
      await page.keyboard.press('Escape'); await page.waitForTimeout(1200)
    } catch (e) { console.log('  SKIP service-url:', e.message.split('\n')[0].slice(0, 70)) }
  }
}

// 프롬프트 전송 · 로그 보기 — 실행 중인 엔드포인트가 있어야 메뉴 항목이 열린다.
for (const [slug, item, title] of [
  ['serverless-prompt-panel', /send\s*prompt/i, 'Send prompt'],
  ['serverless-logs-panel', /view\s*logs/i, 'Logs'],
]) {
  if (!want(slug)) continue
  try {
    await nav(page, 'Rebellions')
    await (await targetRow(page)).locator('td').last().locator('button').first().click()
    await page.waitForTimeout(1600)
    await page.getByRole('menuitem').filter({ hasText: item }).first().click()
    await page.waitForTimeout(5000)
    if (slug === 'serverless-logs-panel') {
      const tab = page.locator('button:has-text("Container logs")').last()
      if (await tab.count()) { await tab.click({ force: true }).catch(() => {}); await page.waitForTimeout(5000) }
    }
    const drawer = await drawerRect(page, title)
    const markers = [{ n: 1, rect: drawer, badgePos: 'left' }]
    if (slug === 'serverless-prompt-panel') {
      markers.push({ n: 2, selector: 'textarea', dashed: true, badgePos: 'left' })
      markers.push({ n: 3, rect: await findRect(page, { contains: ['Max Tokens', 'Temperature', 'Top P'], minW: 180, maxW: 760, minH: 60, maxH: 900, within: drawer }), dashed: true, badgePos: 'left' })
      markers.push({ n: 4, selector: 'button:has-text("Send")', dashed: true, badgePos: 'left' })
    } else {
      markers.push({ n: 2, rect: await findRect(page, { contains: ['Name', 'Status'], minW: 180, maxW: 760, minH: 40, maxH: 220, within: drawer }), dashed: true, badgePos: 'left' })
      markers.push({ n: 3, rect: await findRect(page, { contains: ['Pod events', 'Container logs'], minW: 180, maxW: 700, minH: 24, maxH: 130, within: drawer }), dashed: true, badgePos: 'left' })
    }
    await shoot(page, slug, 'inference', markers)
    await closeDrawer(page)
  } catch (e) {
    console.log(`  SKIP ${slug}: ${e.message.split('\n')[0].slice(0, 80)}`)
    if (process.env.DEBUG_SHOT) {
      await page.screenshot({ path: `/tmp/fail-${slug}.png` })
      console.log('    URL:', page.url())
      console.log('    BODY:', (await page.locator('body').innerText()).split('\n').map(x=>x.trim()).filter(Boolean).slice(28,60).join(' | ').slice(0,400))
    }
    await closeDrawer(page)
  }
}

// 워크로드 터미널 — running 상태의 행에서만 열린다.
if (want('workloads-terminal')) {
  try {
    await nav(page, 'Workloads')
    const rows = page.locator('table tbody tr')
    let idx = -1
    const n = await rows.count()
    for (let i = 0; i < n; i++) if (/running/i.test(await rows.nth(i).innerText())) { idx = i; break }
    if (idx < 0) throw new Error('running 상태 워크로드가 없다')
    await rows.nth(idx).locator('td').last().locator('button').first().click()
    await page.waitForTimeout(1600)
    await page.getByRole('menuitem').filter({ hasText: /^\s*terminal\s*$/i }).first().click()
    await page.waitForTimeout(9000)
    await shoot(page, 'workloads-terminal', 'inference', [
      { n: 1, rect: await findRect(page, { contains: ['Connected|Disconnected'], minW: 600, minH: 260 }) },
    ])
  } catch (e) { console.log(`  SKIP workloads-terminal: ${e.message.split('\n')[0].slice(0, 80)}`) }
}

console.log('\n[Admin AI Inference]')
await openApp(page, 'AI inference', true)

if (want('admin-overview')) {
  await nav(page, 'Dashboard')
  await shoot(page, 'admin-overview', 'admin', [
    { n: 1, rect: await sidebarRect(page), badgePos: 'right' },
    { n: 2, rect: await findRect(page, { contains: ['Capacity', 'Memory'], minW: 400, minH: 120, maxH: 400 }), dashed: true },
    { n: 3, rect: await findRect(page, { contains: ['Workload Summary'], minW: 250, minH: 120, maxH: 400 }), dashed: true },
  ])
}

for (const [label, slug] of [
  ['Docker', 'admin-endpoint-list'],
  ['Nodes', 'admin-monitoring-nodes'],
  ['Usage Trend', 'admin-monitoring-usage-trend'],
  ['Connected Clusters', 'admin-monitoring-clusters'],
  ['Dependencies', 'admin-monitoring-dependencies'],
  ['Projects', 'admin-management-projects'],
]) {
  if (!want(slug)) continue
  try {
    await nav(page, label)
    await shoot(page, slug, 'admin', [{ n: 1, rect: await sidebarRect(page), badgePos: 'right' }])
  } catch (e) { console.log(`  SKIP ${slug}: ${e.message.split('\n')[0].slice(0, 70)}`) }
}

await browser.close()
console.log('\n완료')
