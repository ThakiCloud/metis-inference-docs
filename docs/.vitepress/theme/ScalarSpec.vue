<script setup lang="ts">
/**
 * Scalar OpenAPI 레퍼런스를 VitePress 페이지 안에 마운트한다.
 *
 * 클라이언트 전용이다 — SSR 중에는 window 가 없어 마운트할 수 없으므로
 * onMounted 이후에 동적 import 한다. 실패하면 조용히 죽지 않고 스펙 원본
 * 링크를 남긴다(가장 흔한 실패가 "빈 화면"인데, 그건 원인을 못 짚는다).
 */
import { onMounted, ref, useTemplateRef } from 'vue'
import { useData } from 'vitepress'

const props = withDefaults(
  defineProps<{ url?: string }>(),
  { url: 'metis-inference.openapi.json' },
)

const container = useTemplateRef<HTMLElement>('container')
const failed = ref('')
const specUrl = ref('')
const { isDark, site } = useData()

onMounted(async () => {
  const base = site.value.base ?? '/'
  specUrl.value = props.url.startsWith('/') ? props.url : base + props.url

  try {
    const { createApiReference } = await import('@scalar/api-reference')
    createApiReference(container.value!, {
      url: specUrl.value,
      darkMode: isDark.value,
      hideDarkModeToggle: true,
      hideClientButton: true,
      layout: 'modern',
      showSidebar: true,
      // 공개 문서라 "Try it" 서버 기본값을 비워 둔다.
      // 실 호스트는 독자가 자기 환경 주소를 넣어야 한다.
      hideTestRequestButton: false,
    })
  } catch (error) {
    failed.value = error instanceof Error ? error.message : String(error)
  }
})
</script>

<template>
  <div v-if="failed" class="scalar-fallback">
    <p>API 레퍼런스 뷰어를 불러오지 못했습니다.</p>
    <p><code>{{ failed }}</code></p>
    <p>
      원본 OpenAPI 스펙은 그대로 받을 수 있습니다 —
      <a :href="specUrl" download>metis-inference.openapi.json</a>
    </p>
  </div>
  <div v-else ref="container" class="scalar-root" />
</template>

<style scoped>
.scalar-root {
  margin-top: 1rem;
  min-height: 60vh;
}

.scalar-fallback {
  margin-top: 2rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--vp-c-danger-soft);
  border-radius: 8px;
  background: var(--vp-c-danger-soft);
}

.scalar-fallback code {
  word-break: break-all;
}
</style>
