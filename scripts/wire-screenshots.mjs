#!/usr/bin/env node
/**
 * `<!-- SCREENSHOT: slug -->` 자리에 실제 캡처를 끼운다.
 *
 * 이미지가 없는 자리는 그대로 둔다 — 없는 그림을 참조하는 것이 빈 자리보다 나쁘다.
 * 이미 끼워진 자리는 다시 건드리지 않는다(멱등).
 *
 *   node scripts/wire-screenshots.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const DOCS = join(ROOT, 'docs')
const IMAGES = join(DOCS, 'public', 'images')
const dry = process.argv.includes('--dry')

/** 슬러그 → 대체 텍스트. 스크린리더와 이미지 로드 실패 시 보이는 문구다. */
const ALT = {
  'dashboard-overview': 'AI Inference 대시보드 — 클러스터 정보, 용량, 워크로드·볼륨 요약, 최근 활동',
  'serverless-list': '서버리스 엔드포인트 목록 — 상태·이름·모델·GPU·레플리카·포트·생성일과 행 액션',
  'serverless-action-menu': '엔드포인트 행 액션 메뉴',
  'serverless-service-url-panel': 'Service URL 패널 — 엔드포인트 이름과 호출 주소, 복사 버튼',
  'serverless-prompt-panel': '프롬프트 전송 패널',
  'serverless-logs-panel': '로그 보기 패널',
  'serverless-create-docker': 'Docker 엔드포인트 생성 폼',
  'serverless-create-vllm': 'vLLM 엔드포인트 생성 폼',
  'serverless-create-vllm-cpu': 'CPU vLLM 엔드포인트 생성 폼',
  'serverless-create-vllm-rbln': 'Rebellions vLLM 엔드포인트 생성 폼',
  'serverless-edit': '엔드포인트 편집 폼',
  'serverless-delete-confirm': '엔드포인트 삭제 확인 창',
  'serverless-pause-resume': '엔드포인트 일시정지·재개',
  'templates-list': '템플릿 목록',
  'workloads-list': '워크로드 목록',
  'workloads-detail': '워크로드 상세',
  'workloads-terminal': '워크로드 파드 터미널',
  'volumes-list': '볼륨 목록',
  'projects-list': '프로젝트 목록',
  'usage-dashboard': '사용량 화면',
  'benchmarks-list': '벤치마크 목록',
  'settings-registry-credentials': '레지스트리 자격 증명 설정',
  'settings-ssh-keys': 'SSH 공개키 설정',
  'admin-overview': 'Admin AI Inference 대시보드 — 테넌트 전체 용량과 요약',
  'admin-vs-inference-nav': '관리자 앱과 일반 앱의 사이드바 비교',
  'admin-endpoint-list': '관리자 앱의 테넌트 전체 엔드포인트 목록',
  'admin-endpoint-edit': '관리자 앱의 엔드포인트 편집',
  'admin-endpoint-pause-resume': '관리자 앱의 엔드포인트 일시정지·재개',
  'admin-endpoint-delete-confirm': '관리자 앱의 엔드포인트 삭제 확인',
  'admin-endpoint-sanity-check': 'Sanity Check 결과',
  'admin-recent-activities': '테넌트 전체 최근 활동',
  'admin-monitoring-nodes': '노드 모니터링 — 클러스터 노드의 자원 현황',
  'admin-monitoring-usage-trend': '사용량 추세',
  'admin-monitoring-clusters': '연결된 클러스터 목록',
  'admin-monitoring-dependencies': '의존성(SBOM) 목록',
  'admin-management-projects': '관리자 앱의 프로젝트 관리',
  'admin-management-storage-quota': '사용자 스토리지 쿼터',
  'admin-management-settings': '시스템 설정',
  'admin-catalog-vllm': 'vLLM 카탈로그',
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'public') continue
    const full = join(dir, name)
    statSync(full).isDirectory() ? walk(full, out) : name.endsWith('.md') && out.push(full)
  }
  return out
}

/** 슬러그에 해당하는 이미지를 하위 폴더에서 찾는다. */
function findImage(slug) {
  for (const sub of ['inference', 'admin', '']) {
    const rel = join(sub, `${slug}.png`)
    if (existsSync(join(IMAGES, rel))) return '/images/' + rel.replace(/\\/g, '/')
  }
  return null
}

let wired = 0
let missing = []

for (const file of walk(DOCS)) {
  const rel = relative(ROOT, file)
  let text = readFileSync(file, 'utf8')
  const before = text

  text = text.replace(/<!--\s*SCREENSHOT:\s*([a-z0-9-]+)\s*-->/gi, (whole, slug) => {
    const src = findImage(slug)
    if (!src) { missing.push({ rel, slug }); return whole }
    wired++
    const alt = ALT[slug] ?? slug
    return `![${alt}](${src})`
  })

  if (text !== before && !dry) writeFileSync(file, text)
}

console.log(`끼운 캡처: ${wired}`)
if (missing.length) {
  console.log(`\n아직 이미지가 없는 자리 ${missing.length}개:`)
  for (const m of missing) console.log(`  ${m.slug}  (${m.rel})`)
}
if (dry) console.log('\n(--dry: 파일을 쓰지 않았습니다)')
