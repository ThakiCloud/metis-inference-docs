import { Page, expect } from '@playwright/test'

/**
 * Suite IAM External Mode 네비게이션 헬퍼
 *
 * Suite IAM에서는 Agent Ops 내부 페이지 이동 시 브라우저 URL이 /desktop에서 변경되지 않음.
 * 따라서 page.goto() 대신 사이드바 링크 클릭으로 네비게이션하고,
 * page.waitForURL() 대신 UI 요소 기반으로 페이지 로딩을 확인해야 함.
 */

/**
 * 사이드바 링크 셀렉터
 */
export const SIDEBAR_LINKS = {
  HOME: 'a[href="/"]',
  CHAT: 'a[href="/chat"]',
  AGENTS: 'a[href="/agents"]',
  DATASOURCES: 'a[href="/datasources"]',
  MCP: 'a[href="/mcp"]',
} as const

/**
 * Agents 페이지로 이동
 * - 사이드바의 agents 링크 클릭
 * - "Agents" 헤딩 또는 "Create agent" 버튼이 보일 때까지 대기
 */
export async function navigateToAgentsPage(page: Page): Promise<void> {
  const agentsLink = page.locator(SIDEBAR_LINKS.AGENTS).first()
  const isVisible = await agentsLink.isVisible({ timeout: 5000 }).catch(() => false)

  if (isVisible) {
    await agentsLink.click()
    await page.waitForLoadState('networkidle')

    // Agents 페이지 UI 요소가 보일 때까지 대기
    await page
      .getByRole('heading', { name: /agents/i, level: 2 })
      .or(page.getByRole('button', { name: /create agent|에이전트 생성/i }))
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })

    console.log('[Navigation] Agents 페이지 이동 완료')
  } else {
    console.log('[Navigation] Agents 링크가 보이지 않음 - 이미 Agents 페이지일 수 있음')
  }
}

/**
 * 에이전트 생성 페이지로 이동
 * - Agents 페이지에서 "Create agent" 버튼 클릭
 * - "Create agent" 헤딩 또는 "Agent name" 입력 필드가 보일 때까지 대기
 */
export async function navigateToAgentCreatePage(page: Page): Promise<void> {
  // 먼저 Agents 페이지로 이동
  await navigateToAgentsPage(page)

  // Create agent 버튼 클릭
  const createButton = page.getByRole('button', { name: /create agent|에이전트 생성/i }).first()

  await expect(createButton).toBeVisible({ timeout: 5000 })
  await createButton.click()

  await page.waitForLoadState('networkidle')

  // Create agent 페이지 UI 요소가 보일 때까지 대기
  await page
    .getByRole('heading', { name: /create agent|에이전트 생성/i, level: 2 })
    .or(page.getByRole('textbox', { name: /agent name|에이전트 이름/i }))
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })

  console.log('[Navigation] Agent Create 페이지 이동 완료')
}

/**
 * 에이전트 상세 페이지 로딩 대기
 * - 에이전트 생성 후 상세 페이지로 이동했는지 확인
 * - "Delete" 버튼 또는 탭패널이 보일 때까지 대기
 */
export async function waitForAgentDetailPage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')

  // 에이전트 상세 페이지 UI 요소가 보일 때까지 대기
  await page
    .getByRole('button', { name: /delete|삭제/i })
    .or(page.locator('[role="tabpanel"]'))
    .or(page.getByRole('tab', { name: /information|정보/i }))
    .first()
    .waitFor({ state: 'visible', timeout: 15000 })

  console.log('[Navigation] Agent Detail 페이지 로딩 완료')
}

/**
 * Agents 목록 페이지 로딩 대기
 * - 에이전트 삭제 후 목록 페이지로 돌아왔는지 확인
 * - "Agents" 헤딩 또는 테이블이 보일 때까지 대기
 */
export async function waitForAgentsListPage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')

  // Agents 목록 페이지 UI 요소가 보일 때까지 대기
  await page
    .getByRole('heading', { name: /agents/i, level: 2 })
    .or(page.getByRole('button', { name: /create agent|에이전트 생성/i }))
    .or(page.locator('table'))
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })

  console.log('[Navigation] Agents 목록 페이지 로딩 완료')
}

/**
 * Chat 페이지로 이동
 */
export async function navigateToChatPage(page: Page): Promise<void> {
  const chatLink = page.locator(SIDEBAR_LINKS.CHAT).first()
  const isVisible = await chatLink.isVisible({ timeout: 5000 }).catch(() => false)

  if (isVisible) {
    await chatLink.click()
    await page.waitForLoadState('networkidle')

    // Chat 페이지 UI 요소가 보일 때까지 대기
    await page
      .getByRole('heading', { name: /chat/i })
      .or(page.locator('[role="dialog"]'))
      .or(page.locator('main'))
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })

    console.log('[Navigation] Chat 페이지 이동 완료')
  }
}

/**
 * Datasources 페이지로 이동
 */
export async function navigateToDatasourcesPage(page: Page): Promise<void> {
  const datasourcesLink = page.locator(SIDEBAR_LINKS.DATASOURCES).first()
  const isVisible = await datasourcesLink.isVisible({ timeout: 5000 }).catch(() => false)

  if (isVisible) {
    await datasourcesLink.click()
    await page.waitForLoadState('networkidle')

    // Datasources 페이지 UI 요소가 보일 때까지 대기
    await page
      .getByRole('heading', { name: /data sources|데이터 소스/i })
      .or(page.getByRole('button', { name: /create|생성/i }))
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })

    console.log('[Navigation] Datasources 페이지 이동 완료')
  }
}

/**
 * MCP 페이지로 이동
 */
export async function navigateToMcpPage(page: Page): Promise<void> {
  const mcpLink = page.locator(SIDEBAR_LINKS.MCP).first()
  const isVisible = await mcpLink.isVisible({ timeout: 5000 }).catch(() => false)

  if (isVisible) {
    await mcpLink.click()
    await page.waitForLoadState('networkidle')

    // MCP 페이지 UI 요소가 보일 때까지 대기
    await page
      .getByRole('heading', { name: /mcp/i })
      .or(page.locator('main'))
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })

    console.log('[Navigation] MCP 페이지 이동 완료')
  }
}
