import path from 'path';
import { defineUserConfig } from 'vuepress-vite';
import type { DefaultThemeOptions, ViteBundlerOptions } from 'vuepress-vite';
import sidebar from './sidebar';
import notFound from './notFound';

const config = defineUserConfig<DefaultThemeOptions, ViteBundlerOptions>({
	bundler: '@vuepress/vite',
	templateDev: path.join(__dirname, 'templates', 'index.dev.html'),
	templateSSR: path.join(__dirname, 'templates', 'index.ssr.html'),
	lang: 'es-XL',
	title: 'Guía de discord.js',
	description: 'La guía oficial de discord.js traducida a español.',
	head: [
		['meta', { charset: 'utf-8' }],
		['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
		['link', { rel: 'icon', href: '/favicon.png' }],
		['meta', { name: 'theme-color', content: '#3eaf7c' }],
		['meta', { name: 'twitter:card', content: 'summary' }],
		['meta', { property: 'og:title', content: 'Guía de discord.js' }],
		['meta', { property: 'og:description', content: 'La guía oficial de discord.js traducida a español.' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:url', content: 'https://guia.aguacate.ml/' }],
		['meta', { property: 'og:locale', content: 'es_XL' }],
		['meta', { property: 'og:image', content: 'https://guia.aguacate.ml/metaimg.png' }],
	],
	theme: path.join(__dirname, 'theme', 'index.ts'),
	themeConfig: {
		contributors: false,
		sidebar,
		repo: 'discordPrisma/guide',
		docsDir: 'guide',
		sidebarDepth: 1, // estaba en 3, 'toy probando
		editLinks: true,
		editLinkText: 'Editar esta página',
		lastUpdated: 'Última actualización',
		navbar: [
			{
				text: 'Voz',
				link: '/voz/',
			},
			{
				text: 'Documentación',
				link: 'https://discord.js.org/#/docs/main/stable/general/welcome',
			},
		],
		themePlugins: {
			mediumZoom: false,
		},
		backToHome: 'Regresar al inicio',
		notFound
	},
	plugins: [],
});

export default config;
