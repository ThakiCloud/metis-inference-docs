import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * 번호 주석(annotation) 헬퍼
 *
 * 유저 가이드용 스크린샷에 "빨간 테두리 박스 + (박스를 가리지 않는) 번호 뱃지"를 자동으로
 * 얹어 캡처하고, 같은 데이터로 설명 표(markdown)를 생성한다.
 *
 * 단일 소스 원칙: Marker[] 하나로 (1) 이미지 위 번호·테두리, (2) 가이드 설명 표를 동시에 생성.
 */

export interface Marker {
  /**
   * 번호 라벨. 계층형 문자열 가능: '1', '1-1', '2-3' 등.
   * 부모(영역) 번호는 영역 전체를, 자식(예: '2-1')은 하위 요소를 가리킨다.
   * 이미지의 뱃지와 설명 표의 번호가 이 값으로 매칭됨.
   */
  n: string | number
  /**
   * 빨간 테두리를 두를 요소의 셀렉터. CSS / text / role 엔진 모두 가능.
   * 예: 'role=button[name="Registry"]', 'input[placeholder*="Find" i]', 'text="Base models"'
   * 요소를 찾으면 그 bounding box 에 빨간 박스를 그린다 (가장 정확).
   */
  selector?: string
  /**
   * 여러 요소를 하나의 박스로 묶을 때. 각 셀렉터의 bounding box 합집합(최소 사각형)에 박스를 그린다.
   * 예: 인접한 버튼 여러 개(Start·Stop·Reboot)를 한 영역으로. 지정 시 selector 보다 우선한다.
   */
  selectors?: string[]
  /**
   * 셀렉터로 잡기 어려운 영역을 위한 수동 박스 (뷰포트 1920x1080 기준 px).
   * selector 가 실패하면 이 rect 로 빨간 박스를 그린다.
   */
  rect?: { x: number; y: number; w: number; h: number }
  /** selector/rect 둘 다 없을 때의 최후 fallback 좌표 (박스 없이 번호만) */
  x?: number
  y?: number
  /**
   * 번호 뱃지를 박스의 어느 바깥쪽에 둘지. 기본 'top'(박스 위쪽 바깥).
   * 'left'(왼쪽 바깥), 'right'(오른쪽 바깥 — 화면 왼쪽 끝 요소에 유용).
   */
  badgePos?: 'top' | 'left' | 'right'
  /** 자식 요소면 true → 점선(얇은) 박스로 그려 부모(실선)와 구분 */
  dashed?: boolean
  /** region 마커에 true 면, 결과 이미지를 이 영역(+뱃지 여백)으로 잘라낸다(드로어/모달만 캡처용). */
  crop?: boolean
  /**
   * 부모(영역) 마커에서 true 면, 결과 이미지를 '마지막 자식'이 아니라 **부모 영역 박스 전체**(섹션 전체)
   * 로 잘라낸다. 대시보드 카드/차트처럼 자식이 '제목'만 가리켜 기본 클립이 본문(숫자·차트)을 잘라내는
   * 경우에 쓴다. 이때 섹션 전체가 폴드 아래로 길면 스펙에서 뷰포트 높이를 키워(스크롤 없이) 전부 렌더한다.
   */
  fullSection?: boolean
  /**
   * true 면 이 마커를 '이미지에 그리지 않는다'(박스·번호 배지 모두 생략).
   * 부모 영역이 전체 폼처럼 커서 박스/채움이 화면을 뒤덮는 경우, 자식 번호만 남기고
   * 부모 박스를 이미지에서 빼는 용도. 설명 표(fragment)에는 영향 없음.
   */
  hideBox?: boolean
  /**
   * 부모(영역) 마커에서 true 면, 박스를 '실제 패널'에 딱 맞춘다.
   * 드로어/모달처럼 컨테이너 셀렉터([role="dialog"] 등)가 전체 오버레이/넓은 래퍼에 매칭돼
   * 영역이 과도하게 커지는 경우, selector/rect 대신 이 옵션으로 패널만 정확히 감싼다.
   * - 자식이 dialog/aria-modal 오버레이 안에 있으면: 오버레이 안에서 자식을 모두 품으면서
   *   전체 폭이 아닌 '가장 큰' 요소(= 모달 카드 / 드로어 시트)에 맞춘다. 화면 전체로 안 번진다.
   * - 오버레이가 없으면: 자식 공통 조상에서 전체 폭 직전까지 올라가 패널을 잡는다.
   * (selector/rect 가 있어도 fitChildren 가 우선한다.)
   */
  fitChildren?: boolean
  /**
   * SNB 트리 그룹 전용. 부모 박스를 '자식 버튼들의 합집합 + 상단 트리 라벨 포함 여백'으로 잡는다.
   * 상위 트리(예: Models)를 부모 영역으로, 하위 리소스(Model hub 등) 자식을 그 안에 표시할 때 사용.
   * (DOM 중첩에 의존하지 않는 순수 기하 방식 — 사이드바가 평면 구조여도 안전.)
   */
  treeParent?: boolean
  /** 설명 표 — 기능 (영역/그룹 단위, 예: '탭 필터') */
  feature: string
  /** 설명 표 — 항목 (구체 대상/라벨) */
  item: string
  /** 설명 표 — 설명 (개조식). 각 원소가 한 줄 불릿. 버튼은 유저 플로우를 빠짐없이. */
  description: string[]
  /**
   * 항목이 여러 개인 기능은 항목별로 행을 나눠 쓸 때 사용.
   * 있으면 표에서 item/description 대신 이 배열을 항목당 1행으로 렌더(번호·기능은 첫 행에만).
   */
  rows?: { item: string; desc: string }[]
}

/**
 * 한 화면(how-to 페이지)의 캡처 설정. 페이지 추가는 이 객체 하나만 늘리면 된다.
 */
export interface PageCapture {
  /** 식별자(로그용) */
  id: string
  /** Metis Hub 진입 후 클릭할 사이드바 버튼 이름들(순서대로). 예: ['Model registry'] */
  nav: string[]
  /** 저장 이미지 경로 — docs/public/images 기준 상대경로. 예: 'metis/hub/models/registry-annotated.png' */
  image: string
  /** 설명 fragment 경로 — docs 기준 상대경로. 예: 'ko/metis/hub/models/how-to/_generated/registry-features.md' */
  fragment: string
  /** 이미지 alt */
  alt: string
  /** 번호/박스/설명 마커 */
  markers: Marker[]
}

/**
 * 부모(영역) 단위 캡처 그룹.
 * 영역만 따로 캡처(부모 영역 박스 + 그 하위 요소 박스)하고, 부모별 섹션으로 설명한다.
 */
export interface CaptureGroup {
  /** 부모 번호 (1, 2 …) */
  num: number | string
  /** 섹션 제목 (예: 'Models Sidebar') */
  title: string
  /** 이 그룹 이미지 경로 — docs/public/images 기준 상대경로 */
  image: string
  /** 부모 영역 박스 마커 (n 은 num 과 동일하게) */
  region: Marker
  /** 하위 요소 마커들 (n: '1-1' 등) */
  children: Marker[]
  /**
   * 이 그룹을 캡처하기 직전에 수행할 추가 네비게이션(클릭) 단계.
   * 계층적 화면 단계를 그룹별로 따로 캡처할 때 사용한다.
   * 예) 액션 페이지: 그룹1=진입 버튼(목록 화면, nav 없음) → 그룹2=폼/드로어(nav: ['Upload dataset']).
   * cap.nav 이후 상태에서 그룹 순서대로 누적 적용되므로, 화면 단계가 단조 증가하도록(목록→폼) 그룹을 배치한다.
   * 'sel:' 토큰 지원(clickNav 와 동일).
   */
  nav?: string[]
  /**
   * 캡처 직전 이 셀렉터를 뷰포트 상단으로 스크롤한다(긴 폼의 폴드 아래 섹션 캡처용).
   * 엔진은 fullPage:false(현재 뷰포트)로 찍으므로, 폴드 아래 섹션은 먼저 스크롤해야 보인다.
   * 'sel:' 토큰 불필요 — Playwright 로케이터 문자열을 그대로 넣는다(예: 'text=Networking').
   */
  scrollTo?: string
  /**
   * true 면 fragment 생성 시 이 그룹의 `## 제목` 헤딩을 출력하지 않고 직전 섹션에 이어 붙인다.
   * 예) '생성 진입'(진입 버튼) 그룹을 별도 목차 항목으로 만들지 않고 '목록 조회 및 생성 페이지 진입' 섹션에 합칠 때.
   */
  noHeading?: boolean
  /**
   * 캡처 상단을 주석 박스(자식) 기준으로 잘라 세로 길이를 줄인다(연속 스크롤 화면에서 이미 보여준
   * top bar·상단 섹션을 다시 담지 않음). 미지정 시 noHeading 값을 따른다. 헤딩은 유지하되 상단만
   * 타이트하게 자르고 싶은 화면(예: Cluster 생성의 Networking/Node 섹션)에서 명시적으로 true 로 둔다.
   */
  tightTop?: boolean
  /**
   * true 면 하단을 마지막 주석까지 자르지 않고 '화면 전체(현재 뷰포트)'를 캡처한다.
   * 목록(테이블) 화면처럼 헤더 행만 주석하지만 표 전체·페이지네이션까지 보여야 하는 그룹에 사용.
   */
  fullHeight?: boolean
  /**
   * 하단 크롭 여백(px)을 늘린다. 기본은 '마지막 자식 박스 + 30px'까지만 담아
   * 라벨 아래 값/섹션 내용이 잘리는 경우, 이 값만큼 아래를 더 담는다(카드/섹션 전체 노출용).
   */
  padBottom?: number
}

/** 한 화면을 부모 그룹들로 나눠 캡처하는 설정 */
export interface GroupedCapture {
  id: string
  /** 앱 진입 후 클릭할 버튼 이름들 */
  nav: string[]
  /** 합쳐진 설명 fragment 경로 — docs 기준 상대경로 */
  fragment: string
  groups: CaptureGroup[]
  /**
   * 캡처 직전 이 셀렉터가 보일 때까지 대기. 로딩 스플래시/엉뚱한 페이지 캡처 방지용.
   * 'sel:' 접두사 허용. 미설정 시 게이트 없이 진행.
   */
  ready?: string
  /**
   * 이 캡처에 한해 뷰포트 높이를 키운다(긴 폼의 섹션이 한 화면에 잘리지 않게).
   * 미설정 시 기본 1080 유지. 캡처 후 1080 으로 되돌린다.
   */
  viewportHeight?: number
  /**
   * 이 캡처에 한해 뷰포트 너비를 키운다(칼럼이 많아 가로로 잘리는 넓은 표용).
   * 미설정 시 기본 1920 유지. 캡처 후 1920 으로 되돌린다.
   */
  viewportWidth?: number
  /**
   * true 면 그룹별 이미지를 '해당 섹션만 잘라서'가 아니라 '페이지 전체'로 캡처한다.
   * (부모 박스/자식 박스는 그 그룹 것만 그리되, 배경은 페이지 전체가 보이게.)
   * 최종 화면 상태는 cap.nav 로 먼저 도달시키고, 각 그룹은 nav 없이 전체 페이지를 찍는다.
   * viewportHeight 를 충분히 키워 페이지 전체가 한 화면에 담기게 한다.
   */
  fullPage?: boolean
}

const BADGE_SPAN =
  'display:inline-block;min-width:16px;padding:1px 8px;border-radius:9px;' +
  'background:#e8334a;color:#fff;font-weight:700;font-size:12px;line-height:1.6;'

/** 그룹(부모)별 섹션으로 구성된 fragment 생성 */
export function writeGroupedDescriptionsMd(outMd: string, cap: GroupedCapture): void {
  const badge = (n: string | number) => `<span style="${BADGE_SPAN}">${n}</span>`
  const parts: string[] = [
    '<!-- AUTO-GENERATED by tests/metis-annotated.spec.ts — 직접 수정하지 말 것.',
    '     설명은 tests/annotations/*.ts 의 Marker/Group 데이터에서 고치고 스펙을 다시 실행하세요. -->',
    '',
  ]
  for (const g of cap.groups) {
    // 그룹 제목을 h2 섹션으로 출력 → 문서 목차(TOC)에 단계별로 노출된다.
    // (이미지에는 그룹 번호 배지가 그려져 있고, 표는 N-N 자식 번호를 참조하므로 제목엔 번호를 넣지 않는다.)
    // noHeading 그룹은 헤딩 없이 직전 섹션에 이어 붙인다(예: '생성 진입'을 목록 섹션에 합침).
    if (!g.noHeading) {
      parts.push(`## ${g.title}`)
      parts.push('')
    }
    if (g.region.description?.length) {
      parts.push(g.region.description.map((d) => `${d}`).join(' '))
      parts.push('')
    }
    parts.push(
      `<img src="/images/${g.image}" alt="${g.title}" style="max-width:100%;border:1px solid var(--vp-c-divider);border-radius:8px;" />`,
    )
    parts.push('')
    if (g.children.length) {
      parts.push('| 번호 | 기능 | 항목 | 설명 |')
      parts.push('|:---:|------|------|------|')
      for (const c of g.children) {
        if (c.rows && c.rows.length) {
          // 항목별로 행을 나눠 렌더 (번호·기능은 첫 행에만)
          c.rows.forEach((r, i) => {
            const numCell = i === 0 ? badge(c.n) : ''
            const featCell = i === 0 ? c.feature : ''
            parts.push(`| ${numCell} | ${featCell} | ${r.item} | ${r.desc} |`)
          })
        } else {
          const desc = c.description.map((d) => `· ${d}`).join('<br>')
          parts.push(`| ${badge(c.n)} | ${c.feature} | ${c.item} | ${desc} |`)
        }
      }
      parts.push('')
    }
  }
  fs.mkdirSync(path.dirname(outMd), { recursive: true })
  fs.writeFileSync(outMd, parts.join('\n'), 'utf-8')
  console.log(`📝  ${path.basename(outMd)} (그룹 ${cap.groups.length}개)`)
}

interface ResolvedTarget {
  n: string | number
  dashed?: boolean
  box?: { x: number; y: number; w: number; h: number }
  px?: number
  py?: number
  badgePos: 'top' | 'left' | 'right'
  /** 셀렉터로 잡은 박스인지(= 실제 DOM 컨테이너). true 면 자동 확장하지 않고 박스를 그대로 신뢰한다. */
  fromSelector?: boolean
  /** 부모 박스를 자식 합집합에 맞춰 잡는다(드로어/모달용). */
  fitChildren?: boolean
  /** SNB 트리 그룹: 자식 합집합 + 상단 라벨 여백으로 잡는다. */
  treeParent?: boolean
  /** true 면 이 타깃의 박스·번호 배지를 그리지 않는다(클립 계산에는 계속 사용). 부모 영역 박스 숨김용. */
  hideBox?: boolean
  /** 박스 top 이 콘텐츠(스크롤) 영역 위로 벗어나 클립된 경우. 번호 배지를 박스 위가 아니라 안쪽 상단에 둔다. */
  clampedTop?: boolean
}

/** 각 Marker 를 박스/좌표로 변환. selector boundingBox 우선 → rect → (x,y) 점 */
async function resolveTargets(page: Page, markers: Marker[]): Promise<ResolvedTarget[]> {
  const out: ResolvedTarget[] = []
  for (const m of markers) {
    let box: ResolvedTarget['box'] | undefined
    let fromSelector = false
    if (m.selectors && m.selectors.length) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, any = false
      for (const s of m.selectors) {
        const bb = await page.locator(s).first().boundingBox().catch(() => null)
        if (bb) { any = true; minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y); maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height) }
      }
      if (any) { box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY }; fromSelector = true }
    }
    if (!box && m.selector) {
      const bb = await page.locator(m.selector).first().boundingBox().catch(() => null)
      if (bb) {
        box = { x: bb.x, y: bb.y, w: bb.width, h: bb.height }
        fromSelector = true
      }
    }
    if (!box && m.rect) box = { ...m.rect }

    // fitChildren/treeParent 부모: 실제 박스는 capAnnotated 에서 자식 기준으로 계산하므로 임시 박스로 등록.
    if (m.fitChildren || m.treeParent) {
      out.push({ n: m.n, box: box ?? { x: 0, y: 0, w: 0, h: 0 }, badgePos: m.badgePos ?? 'top', dashed: m.dashed, fitChildren: m.fitChildren, treeParent: m.treeParent, hideBox: m.hideBox })
    } else if (box) {
      out.push({ n: m.n, box, badgePos: m.badgePos ?? 'top', dashed: m.dashed, fromSelector })
    } else if (m.x != null && m.y != null) {
      out.push({ n: m.n, px: m.x, py: m.y, badgePos: m.badgePos ?? 'top', dashed: m.dashed })
    } else {
      console.log(`⚠️  마커 #${m.n} (${m.feature}) — 위치를 못 찾아 스킵`)
    }
  }
  return out
}

/**
 * 빨간 테두리 박스 + (박스를 가리지 않는) 번호 뱃지를 DOM 에 주입 → 캡처 → 제거.
 */
export async function capAnnotated(page: Page, outImage: string, markers: Marker[], opts: { tightTop?: boolean; fullHeight?: boolean; fullScreen?: boolean; fullPage?: boolean; padBottom?: number } = {}): Promise<void> {
  const targets = await resolveTargets(page, markers)

  // ── 부모 영역 보정 ──────────────────────────────────────────────────────
  // 부모-자식 패턴(점선 아닌 박스 1개 = 부모, 점선 박스 ≥1개 = 자식):
  //  1) fitChildren: 자식 요소들의 '공통 조상'(= 실제 드로어/모달 패널) 박스로 딱 맞춘다.
  //     → 헤더·본문·푸터를 모두 포함(헤더 잘림 없음). 셀렉터가 넓은 오버레이/래퍼에 잡히는 문제 회피.
  //     (공통 조상 계산 실패 시 자식 합집합으로 대체.)
  //  2) rect 부모: 헤더만 잡던 것 보정 위해 자식 합집합까지 확장.
  //  3) selector 부모(실제 컨테이너): 그대로 신뢰(확장 안 함).
  {
    const parents = targets.filter((t) => t.box && !t.dashed)
    const children = targets.filter((t) => t.box && t.dashed)
    const parent = parents.length === 1 ? parents[0] : undefined
    const vp = page.viewportSize()

    // (0) treeParent — SNB 트리 그룹: 자식(리소스 버튼) 합집합 + 상단 트리 라벨 여백
    let fitted = false
    if (parent && parent.treeParent && children.length >= 1) {
      const PADX = 8
      const PADBOTTOM = 8
      const PADTOP = 34 // 상단 트리 라벨(예: Models) 포함용
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const c of children) {
        const b = c.box!
        minX = Math.min(minX, b.x - PADX)
        minY = Math.min(minY, b.y - PADTOP)
        maxX = Math.max(maxX, b.x + b.w + PADX)
        maxY = Math.max(maxY, b.y + b.h + PADBOTTOM)
      }
      minX = Math.max(2, minX)
      minY = Math.max(2, minY)
      if (vp) {
        maxX = Math.min(vp.width - 2, maxX)
        maxY = Math.min(vp.height - 2, maxY)
      }
      parent.box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
      fitted = true
    }

    // (1) fitChildren — 공통 조상 박스
    if (parent && parent.fitChildren && !fitted) {
      const childSelectors = markers.filter((m) => m.dashed && m.selector).map((m) => m.selector!)
      const handles = []
      for (const sel of childSelectors) {
        const h = await page.locator(sel).first().elementHandle().catch(() => null)
        if (h) handles.push(h)
      }
      if (handles.length >= 1) {
        const box = await page
          .evaluate((els: Element[]) => {
            const vw = window.innerWidth
            // (A) 모달/드로어: 자식을 감싸는 dialog 오버레이를 먼저 찾고, 그 안에서 '실제 패널'만 박는다.
            //     오버레이/백드롭은 전체 화면이므로 제외하고, 자식을 모두 품으면서 전체 폭이 아닌
            //     '가장 큰' 요소를 패널로 본다 → 모달이면 가운데 카드, 드로어면 사이드 시트.
            //     (자식 셀렉터가 모달 밖까지 매칭돼 박스가 화면 전체로 번지던 문제 해결)
            const findOverlay = (el: Element | null): Element | null => {
              let e: Element | null = el
              while (e) {
                if (e.getAttribute('role') === 'dialog' || e.getAttribute('aria-modal') === 'true') return e
                e = e.parentElement
              }
              return null
            }
            const containsAll = (el: Element) => els.every((c) => el.contains(c))
            const overlay = findOverlay(els[0])
            if (overlay) {
              let best: Element | null = null
              let bestArea = 0
              const candidates: Element[] = [overlay, ...Array.from(overlay.querySelectorAll('*'))]
              for (const el of candidates) {
                const r = el.getBoundingClientRect()
                if (r.width <= 0 || r.height <= 0) continue
                if (r.width >= vw * 0.92) continue   // 전체 폭 오버레이/백드롭/래퍼 제외
                if (!containsAll(el)) continue        // 모달/드로어 내용을 모두 품는 요소만
                const area = r.width * r.height
                if (area > bestArea) { bestArea = area; best = el }
              }
              if (best) {
                const r = best.getBoundingClientRect()
                return { x: r.x, y: r.y, w: r.width, h: r.height }
              }
            }
            // (B) 오버레이가 없으면(role 미지정 등): 자식 공통 조상 → 전체 폭 직전까지 상승.
            let anc: Element | null = els[0]
            for (let i = 1; i < els.length && anc; i++) {
              while (anc && !anc.contains(els[i])) anc = anc.parentElement
            }
            if (!anc) return null
            while (anc.parentElement) {
              const par = anc.parentElement
              const pr = par.getBoundingClientRect()
              if (pr.width >= vw * 0.85 || par.getAttribute('role') === 'dialog') break
              anc = par
            }
            const r = anc.getBoundingClientRect()
            return { x: r.x, y: r.y, w: r.width, h: r.height }
          }, handles as unknown as Element[])
          .catch(() => null)
        for (const h of handles) await h.dispose().catch(() => {})
        if (box && box.w > 0 && box.h > 0) {
          const PAD = 6
          let x = Math.max(2, box.x - PAD)
          let y = Math.max(2, box.y - PAD)
          let r = box.x + box.w + PAD
          let b = box.y + box.h + PAD
          if (vp) {
            r = Math.min(vp.width - 2, r)
            b = Math.min(vp.height - 2, b)
          }
          parent.box = { x, y, w: r - x, h: b - y }
          fitted = true
        }
      }
    }

    // (2)(fallback) 자식 합집합 — rect 부모 확장, 또는 fitChildren 공통조상 실패 시
    const unionFit = parent && parent.fitChildren && !fitted && children.length >= 1
    const expand = parent && !parent.fitChildren && !parent.treeParent && !parent.fromSelector && !fitted && children.length >= 1
    if (parent && (unionFit || expand)) {
      const p = parent.box!
      const PAD = 12
      let minX = unionFit ? Infinity : p.x
      let minY = unionFit ? Infinity : p.y
      let maxX = unionFit ? -Infinity : p.x + p.w
      let maxY = unionFit ? -Infinity : p.y + p.h
      for (const c of children) {
        const b = c.box!
        minX = Math.min(minX, b.x - PAD)
        minY = Math.min(minY, b.y - PAD)
        maxX = Math.max(maxX, b.x + b.w + PAD)
        maxY = Math.max(maxY, b.y + b.h + PAD)
      }
      if (unionFit) minY -= 48 // 제목/설명 포함용 여백
      minX = Math.max(2, minX)
      minY = Math.max(2, minY)
      if (vp) {
        maxX = Math.min(vp.width - 2, maxX)
        maxY = Math.min(vp.height - 2, maxY)
      }
      p.x = minX
      p.y = minY
      p.w = maxX - minX
      p.h = maxY - minY
    }

    // (3) 콘텐츠 영역 클립 — 부모 박스가 스크롤 컨테이너(콘텐츠) 밖(상단 고정 바 등)으로
    //     넘치지 않게 세로로 클립한다. 긴 카드를 아래로 스크롤해 카드 top 이 화면 위로
    //     벗어났을 때, 박스 테두리가 top bar 까지 그려지는 문제를 막는다.
    if (parent && parent.box && parent.box.h > 0) {
      const anchorSel =
        markers.find((m) => !m.dashed && m.selector)?.selector ??
        markers.find((m) => m.dashed && m.selector)?.selector
      if (anchorSel) {
        const h = await page.locator(anchorSel).first().elementHandle().catch(() => null)
        if (h) {
          const clip = await h
            .evaluate((node: Element) => {
              let el: Element | null = node
              while (el && el.parentElement) {
                const s = getComputedStyle(el)
                const scrollableY =
                  (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
                  el.scrollHeight > el.clientHeight + 1
                if (scrollableY) {
                  const r = el.getBoundingClientRect()
                  return { top: r.top, bottom: r.bottom }
                }
                el = el.parentElement
              }
              return null
            })
            .catch(() => null)
          await h.dispose().catch(() => {})
          if (clip) {
            const b = parent.box
            const origTop = b.y
            const top = Math.max(b.y, clip.top)
            const bottom = Math.min(b.y + b.h, clip.bottom)
            b.y = top
            b.h = Math.max(0, bottom - top)
            // 박스 top 이 콘텐츠 경계까지 끌어올려졌으면(원래 더 위였음) 배지를 안쪽 상단에 둔다.
            if (top > origTop + 1) parent.clampedTop = true
          }
        }
      }
    }
  }

  await page.evaluate(({ items, hideParentBadge }: { items: ResolvedTarget[]; hideParentBadge: boolean }) => {
    const layer = document.createElement('div')
    layer.id = '__doc_badges__'
    layer.style.cssText =
      'position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483647;pointer-events:none;'

    const RED = '#e8334a'
    for (const t of items) {
      if (t.hideBox) continue // 부모 영역 등: 박스·배지 모두 생략(클립 계산에는 이미 반영됨)
      let badgeLeft: number
      let badgeTop: number
      let transform: string

      if (t.box) {
        // 부모(영역)=실선 굵게 + 채움 없음(영역이 넓어도 화면이 과도하게 붉어지지 않도록),
        // 자식=점선 얇게 + 옅은 음영(강조 대상을 음영으로 부각)으로 구분
        const rect = document.createElement('div')
        const border = t.dashed ? `2px dashed ${RED}` : `3px solid ${RED}`
        const fill = t.dashed ? 'rgba(232,51,74,0.12)' : 'transparent'
        const radius = t.dashed ? 6 : 10
        rect.style.cssText =
          `position:absolute;left:${t.box.x - 4}px;top:${t.box.y - 4}px;` +
          `width:${t.box.w + 8}px;height:${t.box.h + 8}px;` +
          `border:${border};border-radius:${radius}px;background:${fill};` +
          'box-shadow:0 0 0 1px rgba(255,255,255,0.7);'
        layer.appendChild(rect)

        // 번호는 박스 바깥에 (가리지 않도록)
        // 부모(영역, 실선) 번호는 항상 박스 '왼쪽 위 모서리' 바깥에 둔다.
        // 자식 번호는 왼쪽 변(중앙)을 따라 배치되므로, 부모를 변 중앙에 두면 겹친다.
        // badgePos:'right'(화면 왼쪽 끝 박스)일 때만 오른쪽 위 모서리로 보내 잘림을 막는다.
        const isParent = !t.dashed
        if (isParent) {
          // 박스 테두리·자식 배지(왼쪽 변)와 겹치지 않도록 모서리에서 바깥으로 한 칸 더 띄운다.
          const PARENT_GAP = 12
          // 박스 top 이 콘텐츠 경계로 클립됐거나(긴 카드를 아래로 스크롤) 화면 상단에 너무 붙어
          // 위쪽에 배지 공간이 없으면, 배지를 박스 '안쪽 상단'(왼쪽)에 둬서 top bar 침범·잘림을 막는다.
          const insideTop = t.clampedTop || t.box.y < 30
          const vTransform = insideTop ? '0' : '-100%'
          badgeTop = t.box.y
          if (t.badgePos === 'right') {
            badgeLeft = t.box.x + t.box.w + PARENT_GAP
            transform = `translate(0, ${vTransform})`
          } else {
            badgeLeft = t.box.x - PARENT_GAP
            transform = `translate(-100%, ${vTransform})`
          }
        } else if (t.badgePos === 'left') {
          badgeLeft = t.box.x - 6
          badgeTop = t.box.y + t.box.h / 2
          transform = 'translate(-100%, -50%)'
        } else if (t.badgePos === 'right') {
          badgeLeft = t.box.x + t.box.w + 6
          badgeTop = t.box.y + t.box.h / 2
          transform = 'translate(0, -50%)'
        } else {
          // 'top' — 박스 위쪽 바깥, 좌상단 근처
          badgeLeft = t.box.x + 10
          badgeTop = t.box.y - 6
          transform = 'translate(-50%, -100%)'
        }
      } else {
        // 박스 없는 fallback — 좌표에 번호만
        badgeLeft = t.px ?? 0
        badgeTop = t.py ?? 0
        transform = 'translate(-50%, -50%)'
      }

      // tightTop(연속 스크롤) 그룹은 부모(영역) 박스 상단이 잘려 배지가 슬리버로 남으므로,
      // 부모 번호 배지는 생략한다(테두리는 유지, 자식 번호로 설명은 충분).
      if (!t.dashed && hideParentBadge) continue
      // 계층형 라벨('1-1' 등)은 여러 글자라 알약(pill) 형태로
      const label = String(t.n)
      const b = document.createElement('div')
      b.textContent = label
      b.style.cssText =
        `position:absolute;left:${badgeLeft}px;top:${badgeTop}px;transform:${transform};` +
        'display:flex;align-items:center;justify-content:center;' +
        'min-width:26px;height:24px;padding:0 7px;box-sizing:border-box;border-radius:12px;' +
        `background:${RED};color:#fff;font-weight:700;font-size:13px;white-space:nowrap;` +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'box-shadow:0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,0.45);'
      layer.appendChild(b)
    }
    document.body.appendChild(layer)
  }, { items: targets, hideParentBadge: !!opts.tightTop })

  fs.mkdirSync(path.dirname(outImage), { recursive: true })
  // clip 계산 — 우선순위:
  //  (1) region 마커 crop:true → 드로어/모달만 잘라낸다(자식 합집합 우선, +여백).
  //  (2) fullHeight → 목록(테이블) 화면: 좌측 side navigation 메뉴 하단까지.
  //  (3) 그 외 → 하단은 마지막 자식까지, tightTop 이면 상단(섹션 카드/첫 자식)도 컷.
  let clip: { x: number; y: number; width: number; height: number } | undefined
  if (!opts.fullScreen) {
    // fullScreen: 크롭 없이 뷰포트(윈도우) 전체를 담는다 — 한 화면이 온전히 보이도록.
    const withBox = targets.filter((t) => t.box) as (ResolvedTarget & { box: NonNullable<ResolvedTarget['box']> })[]
    const parent = withBox.find((t) => !t.dashed)
    const kids = withBox.filter((t) => t.dashed)
    const vp = page.viewportSize() || { width: 1920, height: 1080 }
    if (markers[0]?.crop) {
      // 드로어/모달만: 자식(드로어 내부 요소) 합집합 우선, 없으면 부모 박스. 부모는 fitChildren 실패 시
      //  전체 화면으로 과대추정될 수 있어 자식을 우선한다.
      const src = kids.length >= 1 ? kids : withBox
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const t of src) {
        minX = Math.min(minX, t.box.x)
        minY = Math.min(minY, t.box.y)
        maxX = Math.max(maxX, t.box.x + t.box.w)
        maxY = Math.max(maxY, t.box.y + t.box.h)
      }
      if (minX < maxX && minY < maxY) {
        const M = 72 // 헤더/푸터·번호 뱃지·테두리가 잘리지 않도록 여백
        minX = Math.max(0, minX - M)
        minY = Math.max(0, minY - M)
        maxX = Math.min(vp.width, maxX + M)
        maxY = Math.min(vp.height, maxY + M)
        clip = { x: Math.round(minX), y: Math.round(minY), width: Math.round(maxX - minX), height: Math.round(maxY - minY) }
      }
    } else if (markers[0]?.fullSection && parent) {
      // 대시보드/모니터링 섹션: '마지막 자식(제목)'이 아니라 부모 영역 박스 전체(카드 본문·차트 포함)를 담는다.
      // 섹션이 폴드 아래로 길면 스펙에서 뷰포트 높이를 키워 전부 렌더했으므로 parent.box 가 full 이다.
      // 상단은 '가장 위 자식' 기준으로 잡아, fitChildren 이 공통 조상을 위로 넓게 잡아도(예: 카드까지)
      // 첫 주석 위의 무관한 영역은 담지 않는다. 자식이 없으면 부모 박스 상단을 쓴다.
      const TOPPAD = 48, PADB = 30
      const topAnchor = kids.length ? Math.min(...kids.map((k) => k.box.y)) : parent.box.y
      const top = Math.max(0, Math.round(topAnchor - TOPPAD))
      const bottom = Math.min(vp.height, Math.round(parent.box.y + parent.box.h + PADB))
      clip = { x: 0, y: top, width: vp.width, height: Math.max(240, bottom - top) }
    } else if (opts.fullPage) {
      // 페이지 전체: 섹션만 잘라내지 않고 y=0 부터 '본문 콘텐츠 하단'까지 담는다.
      //  (그룹 박스는 그 그룹 것만 그려지되, 배경은 페이지 전체가 보이게 한다.)
      //  본문(좌측 side nav 바깥, x>200)의 가장 낮은 요소 bottom 을 콘텐츠 하단으로 잡는다.
      // 전체 높이 wrapper(div/section)는 뷰포트 끝까지 늘어나 빈 여백을 만들므로 제외하고,
      // '실제 콘텐츠' 태그(표·차트·텍스트·입력)의 가장 낮은 bottom 을 콘텐츠 하단으로 잡는다.
      const contentBottom: number = await page.evaluate(() => {
        let max = 0
        for (const el of Array.from(document.querySelectorAll('table, canvas, svg, img, h1, h2, h3, h4, p, li, button, input, span'))) {
          const r = (el as HTMLElement).getBoundingClientRect()
          const txt = (el.textContent || '').trim()
          const meaningful = r.height > 8 && (txt.length > 0 || ['CANVAS', 'SVG', 'IMG', 'INPUT'].includes(el.tagName))
          if (r.left > 200 && r.width > 40 && meaningful && r.bottom > max && r.bottom < 6000) max = r.bottom
        }
        return Math.round(max)
      })
      const h = Math.min(vp.height, Math.max(600, (contentBottom || vp.height) + 40))
      clip = { x: 0, y: 0, width: vp.width, height: h }
    } else if (opts.fullHeight) {
      // 목록 화면: 하단을 마지막 주석까지 자르지 않되, 뷰포트 전체(폼 겸용 큰 viewportHeight 포함)를
      //  그대로 담으면 표 아래로 빈 공간이 길게 남는다. 그래서 '좌측 side navigation 메뉴가 모두
      //  보이는 높이'까지만 세로를 잡는다 — 왼쪽 열(x<250)의 마지막 메뉴 항목 bottom 을 기준으로 한다.
      // 좌측 side navigation 메뉴의 '마지막 항목' bottom 을 잡는다. 메뉴는 항목 수로 정해지는
      //  '절대 위치'(뷰포트 높이와 무관, 대략 y<1120)라, 하단 플랫폼 앱 독(뷰포트 맨 아래)은
      //  bottom<1120 조건으로 배제한다. 개별 항목만(짧은 높이) — 사이드바 컨테이너는 제외.
      const navBottom: number = await page.evaluate(() => {
        let max = 0
        for (const el of Array.from(document.querySelectorAll('a, span, li, p, [role="menuitem"]'))) {
          const r = (el as HTMLElement).getBoundingClientRect()
          const txt = (el.textContent || '').trim()
          if (txt && r.left >= 0 && r.left < 250 && r.height > 8 && r.height < 56 && r.bottom > max && r.bottom < 1120) {
            max = r.bottom
          }
        }
        return Math.round(max)
      })
      const h = Math.min(vp.height, Math.max(600, (navBottom || 1040) + 28))
      clip = { x: 0, y: 0, width: vp.width, height: h }
    } else if (withBox.length) {
      // 하단 기준: 자식 박스가 있으면 항상 '마지막 자식'까지만 담는다(섹션 카드처럼 부모가 아래로
      // 길어도 마지막 주석 뒤의 빈 영역·비관련 필드를 함께 담지 않도록). 자식이 없으면 부모(withBox).
      const bottomBoxes = kids.length ? kids : withBox
      const maxY = Math.max(...bottomBoxes.map((t) => t.box.y + t.box.h))
      const PADB = 30 + (opts.padBottom ?? 0)
      const bottom = Math.min(vp.height, Math.max(240, Math.round(maxY + PADB)))
      // tightTop: 연속(noHeading) 스크롤 그룹은 상단 chrome/이미 설명한 섹션을 다시 담지 않고
      //  위도 잘라 세로 길이를 줄인다. 상단 기준:
      //   - 부모 region 이 '실제 섹션 카드'(fitChildren 아님)면 그 카드 상단(섹션 제목 포함)까지만 잘라
      //     'Networking'·'Control Planes' 같은 섹션 헤더 맥락을 남긴다.
      //   - fitChildren(폼 전체로 넓은) 부모면 첫 자식 박스 기준으로 잘라 헤더 반복을 피한다.
      //  번호 배지가 박스 위/좌측에 붙으므로 여유(TOPPAD)를 둔다. 첫 그룹은 tightTop=false 로 y=0 유지.
      const TOPPAD = 46
      const topAnchor = parent && !parent.fitChildren ? parent.box.y : Math.min(...bottomBoxes.map((t) => t.box.y))
      const top = opts.tightTop ? Math.max(0, Math.round(topAnchor - TOPPAD)) : 0
      clip = { x: 0, y: top, width: vp.width, height: Math.max(240, bottom - top) }
    }
  }
  // 폰트 로딩 대기가 길어 기본 15초 actionTimeout 을 넘기는 경우가 있어 넉넉히 60초
  await page.screenshot({ path: outImage, fullPage: false, clip, timeout: 60000 })
  const boxes = targets.filter((t) => t.box).length
  console.log(`✅  ${path.basename(outImage)} (번호 ${targets.length}개 / 빨간박스 ${boxes}개)`)

  await page.evaluate(() => document.getElementById('__doc_badges__')?.remove())
}

/**
 * Marker[] 로부터 설명 표(markdown fragment)를 생성한다.
 * 컬럼: 번호 | 기능 | 항목 | 설명(개조식)
 */
export function writeDescriptionsMd(
  outMd: string,
  imagePublicPath: string,
  markers: Marker[],
  altText = '',
): void {
  // 번호는 입력한 배열 순서를 그대로 사용(계층형 문자열 정렬 이슈 방지).
  // 번호 칸은 빨간 배지(pill) 스타일 span 으로 렌더.
  const rows = markers
    .map((m) => {
      const desc = m.description.map((d) => `· ${d}`).join('<br>')
      const badge =
        `<span style="display:inline-block;min-width:16px;padding:1px 8px;border-radius:9px;` +
        `background:#e8334a;color:#fff;font-weight:700;font-size:12px;line-height:1.6;">${m.n}</span>`
      return `| ${badge} | ${m.feature} | ${m.item} | ${desc} |`
    })
    .join('\n')

  // 이미지는 마크다운 ![]() 대신 <img> 태그로 출력 (파일 부재 시 VitePress 서버 에러 방지)
  const md =
    `<!-- AUTO-GENERATED by tests/metis-annotated.spec.ts — 직접 수정하지 말 것.\n` +
    `     설명은 tests/annotations/*.ts 의 Marker 데이터에서 고치고 스펙을 다시 실행하세요. -->\n\n` +
    `<img src="${imagePublicPath}" alt="${altText}" style="max-width:100%;border:1px solid var(--vp-c-divider);border-radius:8px;" />\n\n` +
    `| 번호 | 기능 | 항목 | 설명 |\n` +
    `|:---:|------|------|------|\n` +
    `${rows}\n`

  fs.mkdirSync(path.dirname(outMd), { recursive: true })
  fs.writeFileSync(outMd, md, 'utf-8')
  console.log(`📝  ${path.basename(outMd)} (설명 ${markers.length}행)`)
}
