import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3001 },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
    },
  },
  
  // Hexagonal Architecture paths
  srcDir: 'src/presentation/',
  dir: {
    pages: 'screens' // Mapped as requested by the user
  },
  
  alias: {
    '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
    '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
    '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
  },

  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    pageTransition: { name: 'fade', mode: 'default' },
    head: {
      title: 'RuralNexus — Empowering Rural Resilience',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'RuralNexus is an NGO delivering agricultural innovation, action research, and rural development empowering communities.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&display=swap', as: 'style' },
        // Load non-blocking: media=print loads without blocking, onload switches to all
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&display=swap', media: 'print', onload: "this.media='all'" } as any,
      ]
    },
  },
})
