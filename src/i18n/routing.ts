import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
	// 支持的语言列表（依据 0_meta/zenith-inc_wiki/languages.json，按 priority 排序）
	locales: ['en', 'pt', 'es', 'id'],

	// 默认语言
	defaultLocale: 'en',

	// URL 前缀策略：默认语言无前缀
	localePrefix: 'as-needed',

	// 启用自动语言检测
	localeDetection: true,
})

// 导出类型
export type Locale = (typeof routing.locales)[number]
