import { defineConfig } from 'vitepress'

// GitHub Pages project site → /metis-inference-docs/
const base = process.env.DOCS_BASE ?? '/metis-inference-docs/'

export default defineConfig({
  lang: 'ko-KR',
  title: 'Metis 추론 가이드',
  description: 'Metis AI Inference · Admin AI Inference 사용자 가이드',
  base,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,

  // 미터링·과금 섹션은 아직 검증되지 않아 사이트에서 뺀다.
  // 파일은 docs/admin/metering/ 에 그대로 있고, 이 한 줄을 지우면 되살아난다.
  // 되살릴 때는 사이드바의 "미터링·과금" 블록과 인바운드 링크도 함께 복구할 것
  // (같은 커밋에서 지웠으니 git 이력에서 그대로 꺼낼 수 있다).
  srcExclude: ['**/admin/metering/**'],

  head: [
    ['link', { rel: 'icon', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
  ],

  markdown: {
    lineNumbers: false,
    theme: { light: 'github-light', dark: 'github-dark' },
  },

  themeConfig: {
    outline: { level: [2, 3], label: '이 페이지 목차' },

    nav: [
      { text: '가이드', link: '/guide/', activeMatch: '/guide/' },
      { text: 'AI Inference', link: '/inference/', activeMatch: '/inference/' },
      { text: 'Admin', link: '/admin/', activeMatch: '/admin/' },
      { text: 'API 레퍼런스', link: '/api/', activeMatch: '/api/' },
      { text: '변경 이력', link: '/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '시작하기',
          items: [
            { text: '개요', link: '/guide/' },
            { text: '빠른 시작 — 60초 첫 추론', link: '/guide/quickstart' },
            { text: '핵심 개념', link: '/guide/concepts' },
            { text: '워크로드 타입', link: '/guide/workload-types' },
          ],
        },
        {
          text: '추론 호출하기',
          collapsed: false,
          items: [
            { text: '엔드포인트 URL', link: '/guide/inference/endpoint-url' },
            { text: '인증', link: '/guide/inference/authentication' },
            { text: 'OpenAI 호환 API', link: '/guide/inference/openai-compatible' },
            { text: '스트리밍', link: '/guide/inference/streaming' },
            { text: '콜드 스타트와 Scale-to-Zero', link: '/guide/inference/cold-start' },
            { text: '클라이언트 예제', link: '/guide/inference/clients' },
            { text: '에러 처리', link: '/guide/inference/errors' },
            { text: '사용 한도', link: '/guide/inference/limits' },
            { text: '콘솔 프록시 API', link: '/guide/inference/console-proxy' },
          ],
        },
      ],

      '/inference/': [
        {
          text: 'AI Inference 앱',
          items: [
            { text: '소개', link: '/inference/' },
            { text: '대시보드', link: '/inference/dashboard' },
          ],
        },
        {
          text: '서버리스 엔드포인트',
          collapsed: false,
          items: [
            { text: '엔드포인트 조회', link: '/inference/serverless/list' },
            { text: 'Docker 엔드포인트 생성', link: '/inference/serverless/create-docker' },
            { text: 'vLLM 엔드포인트 생성', link: '/inference/serverless/create-vllm' },
            { text: 'CPU vLLM 엔드포인트 생성', link: '/inference/serverless/create-vllm-cpu' },
            { text: 'Rebellions vLLM 엔드포인트 생성', link: '/inference/serverless/create-vllm-rbln' },
            { text: 'Service URL 확인', link: '/inference/serverless/service-url' },
            { text: '프롬프트 전송·로그 보기', link: '/inference/serverless/prompt-and-logs' },
            { text: '엔드포인트 수정', link: '/inference/serverless/edit' },
            { text: '일시정지·재개', link: '/inference/serverless/pause-resume' },
            { text: '엔드포인트 삭제', link: '/inference/serverless/delete' },
          ],
        },
        {
          text: '리소스',
          collapsed: false,
          items: [
            { text: '워크로드', link: '/inference/workloads' },
            { text: '볼륨', link: '/inference/volumes' },
            { text: '템플릿', link: '/inference/templates' },
            { text: '프로젝트', link: '/inference/projects' },
            { text: '벤치마크', link: '/inference/benchmarks' },
          ],
        },
        {
          text: '사용량·설정',
          collapsed: false,
          items: [
            { text: '사용량과 비용', link: '/inference/usage' },
            { text: '레지스트리 자격 증명', link: '/inference/settings/registry-credentials' },
            { text: 'SSH 키', link: '/inference/settings/ssh-keys' },
          ],
        },
      ],

      '/admin/': [
        {
          text: 'Admin AI Inference 앱',
          items: [
            { text: '소개', link: '/admin/' },
            { text: '일반 앱과의 차이', link: '/admin/differences' },
          ],
        },
        {
          text: '엔드포인트 운영',
          collapsed: false,
          items: [
            { text: '전체 엔드포인트 조회', link: '/admin/serverless/list' },
            { text: '엔드포인트 수정', link: '/admin/serverless/edit' },
            { text: '일시정지·재개', link: '/admin/serverless/pause-resume' },
            { text: '엔드포인트 삭제', link: '/admin/serverless/delete' },
            { text: 'Sanity Check', link: '/admin/serverless/sanity-check' },
            { text: '최근 활동', link: '/admin/serverless/activities' },
          ],
        },
        {
          text: '모니터링',
          collapsed: false,
          items: [
            { text: '노드', link: '/admin/monitoring/nodes' },
            { text: '사용량 추세', link: '/admin/monitoring/usage-trend' },
            { text: '연결된 클러스터', link: '/admin/monitoring/clusters' },
            { text: '의존성(SBOM)', link: '/admin/monitoring/dependencies' },
          ],
        },
        // 미터링·과금 섹션은 검증 전이라 숨겨 두었다. srcExclude 와 함께 복구할 것.
        {
          text: '카탈로그·관리',
          collapsed: false,
          items: [
            { text: 'vLLM 카탈로그', link: '/admin/catalog/vllm' },
            { text: '프로젝트 관리', link: '/admin/management/projects' },
            { text: '사용자 스토리지 쿼터', link: '/admin/management/storage-quota' },
            { text: '시스템 설정', link: '/admin/management/settings' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API 레퍼런스',
          items: [
            { text: '개요', link: '/api/' },
            { text: '인증', link: '/api/authentication' },
            { text: '공통 규약', link: '/api/conventions' },
            { text: '에러 코드', link: '/api/errors' },
            { text: '전체 스펙 (OpenAPI)', link: '/api/reference' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ThakiCloud/metis-inference-docs' },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '검색', buttonAriaLabel: '검색' },
          modal: {
            noResultsText: '검색 결과가 없습니다',
            resetButtonTitle: '검색어 지우기',
            footer: { selectText: '선택', navigateText: '이동', closeText: '닫기' },
          },
        },
      },
    },

    docFooter: { prev: '이전', next: '다음' },
    darkModeSwitchLabel: '테마',
    lightModeSwitchTitle: '라이트 모드로',
    darkModeSwitchTitle: '다크 모드로',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
    lastUpdatedText: '최종 수정',

    footer: {
      message: 'Metis AI Inference 사용자 가이드',
      copyright: 'Copyright © 2026 ThakiCloud',
    },
  },
})
