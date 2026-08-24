import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ScalarSpec from './ScalarSpec.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ScalarSpec', ScalarSpec)
  },
} satisfies Theme
