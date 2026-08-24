import { expect, test as setup } from '@playwright/test'

/**
 * 로그인해서 storageState 를 남긴다. 캡처 스펙들은 이 상태를 공유한다.
 *
 * 자격 정보는 .env 에서만 온다 — 코드에 기본값을 두지 않는다. 값이 없으면
 * 조용히 넘어가지 않고 즉시 실패시킨다(로그인 안 된 화면을 캡처해 문서에 넣는
 * 사고가 가장 흔하다).
 *
 * 관리자 화면을 캡처하려면 ROLE=admin 으로 돌린다.
 *   ROLE=admin npx playwright test --project=chromium
 */
const ROLE = process.env.ROLE === 'admin' ? 'admin' : 'user'
const AUTH_FILE = 'tests/.auth/user.json'

const LOGIN_ID = ROLE === 'admin' ? process.env.TEST_USER_ADMIN : process.env.TEST_USER
const PASSWORD = ROLE === 'admin' ? process.env.TEST_PASS_ADMIN : process.env.TEST_PASS
const DOMAIN = process.env.TEST_DOMAIN ?? ''
const MFA_CODE = process.env.MFA_CODE ?? ''

setup('authenticate', async ({ page }) => {
  if (!LOGIN_ID || !PASSWORD) {
    throw new Error(
      `ROLE=${ROLE} 에 필요한 계정 정보가 .env 에 없습니다 ` +
        `(${ROLE === 'admin' ? 'TEST_USER_ADMIN / TEST_PASS_ADMIN' : 'TEST_USER / TEST_PASS'}).`,
    )
  }

  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')

  // 이미 로그인된 세션이면 로그인 폼 대신 콘솔로 리다이렉트된다.
  if (!page.url().includes('/login')) {
    await forceLightTheme(page)
    await page.context().storageState({ path: AUTH_FILE })
    return
  }

  // Domain 필드는 환경에 따라 있기도 없기도 하다. 없으면 조용히 건너뛴다.
  if (DOMAIN) {
    const domainInput = page
      .getByRole('textbox', { name: /domain/i })
      .or(page.getByPlaceholder(/domain/i))
    if (await domainInput.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
      await domainInput.first().fill(DOMAIN)
    }
  }

  const idInput = page.locator('#username').or(page.locator('input[type="text"]').first())
  await expect(idInput.first()).toBeVisible({ timeout: 10_000 })
  await idInput.first().fill(LOGIN_ID)

  const pwInput = page.locator('#password').or(page.locator('input[type="password"]').first())
  await expect(pwInput.first()).toBeVisible({ timeout: 5_000 })
  await pwInput.first().fill(PASSWORD)

  await page.locator('button[type="submit"]').first().click()

  // MFA 를 쓰는 환경에서만 동작한다. MFA_CODE 가 없으면 MFA 없는 환경으로 본다.
  if (MFA_CODE) {
    await page.waitForTimeout(2_500)
    const next = page.getByRole('button', { name: /^Next$/i }).first()
    if (await next.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await next.click().catch(() => {})
      await page.waitForTimeout(2_000)
      const code = page.locator('input[name="code"]').or(page.getByPlaceholder(/enter code/i))
      await code.first().fill(MFA_CODE).catch(() => {})
      await page.getByRole('button', { name: /^Next$/i }).first().click().catch(() => {})
      await page.waitForTimeout(1_500)
    }
  }

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 })

  await forceLightTheme(page)
  await page.context().storageState({ path: AUTH_FILE })
})

/**
 * 캡처는 항상 라이트 모드로. 앱이 localStorage 로 테마를 기억하므로
 * 값을 바꾸고 새로고침해야 반영된다.
 */
async function forceLightTheme(page: import('@playwright/test').Page): Promise<void> {
  try {
    await page.evaluate(() => localStorage.setItem('thaki_suite_theme', 'light'))
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1_000)
  } catch {
    // 테마 키가 없는 환경이면 그대로 진행한다.
  }
}
