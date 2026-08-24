import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config()

/**
 * 문서 캡처용 Playwright 설정.
 *
 * 접속 정보는 .env 로만 주입한다(커밋 금지). 기본값을 코드에 박지 않는다 —
 * 기본값이 있으면 누군가는 그게 유효한 줄 알고 쓰게 된다.
 *
 *   cp .env.example .env   # 값을 채우고
 *   npm run capture
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL

if (!baseURL) {
  throw new Error(
    'PLAYWRIGHT_BASE_URL 이 없습니다. .env.example 을 .env 로 복사하고 콘솔 주소를 채우세요.',
  )
}

export default defineConfig({
  testDir: './tests',

  // 캡처는 순서와 화면 상태가 중요하다. 병렬로 돌리면 서로의 화면을 흔든다.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],

  use: {
    baseURL,
    // 문서 캡처는 항상 라이트 모드로 고정한다. 다크 캡처가 섞이면 문서가 지저분해진다.
    colorScheme: 'light',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  timeout: 90_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results/',
})
