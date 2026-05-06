<script setup lang="ts">
type SiteSettings = {
  brand?: { name?: string; tagline?: string }
  footer?: {
    quickLinks?: { label: string; path: string }[]
    contactPhone?: string
    contactEmail?: string
    contactAddress?: string
    copyrightText?: string
  }
  social?: { platform: string; url: string }[]
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const { data: settings } = await useAsyncData('site-settings', () =>
  $fetch<SiteSettings>(`${apiBase}/api/globals/site-settings`),
)

const currentYear = new Date().getFullYear()

const copyrightText = computed(() => {
  const raw = settings.value?.footer?.copyrightText ?? `© {year} RuralNexus. All rights reserved.`
  return raw.replace('{year}', String(currentYear))
})

const quickLinks = computed(() =>
  settings.value?.footer?.quickLinks ?? [
    { label: 'Home', path: '/' },
    { label: 'Who We Are', path: '/about' },
    { label: 'Impact Reports', path: '/impact' },
    { label: 'Field Dispatches', path: '/stories' },
    { label: 'Methodology Repository', path: '/research' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ]
)

const socialLinks = computed(() => settings.value?.social ?? [])

const SOCIAL_ICONS: Record<string, string> = {
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
}
</script>

<template>
  <footer class="bg-primary-container text-white pt-16 pb-8 border-t-[8px] border-leaf relative overflow-hidden">
    <!-- Decorative Watermark Graphic -->
    <div class="absolute -bottom-24 -right-24 w-96 h-96 hex-mask bg-primary opacity-20 pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <!-- Branding Col -->
        <div>
           <div class="flex items-center mb-4">
            <img src="/light-logo.png" alt="RuralNexus" class="h-10 w-auto" />
          </div>
          <p class="text-sm text-white/90 leading-relaxed font-body">
            {{ settings?.brand?.tagline ?? 'Empowering Rural Resilience. Action Research, Innovation, and Development for resilient food systems.' }}
          </p>
          <!-- Social links -->
          <div v-if="socialLinks.length > 0" class="flex gap-3 mt-6">
            <a
              v-for="s in socialLinks"
              :key="s.platform"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              :title="s.platform"
              v-html="SOCIAL_ICONS[s.platform] ?? ''"
            />
          </div>
        </div>

        <!-- Links Col -->
        <div>
          <h4 class="font-display font-semibold text-white mb-4">Quick Links</h4>
          <ul class="space-y-2 text-sm text-white/90">
            <li v-for="link in quickLinks" :key="link.path">
              <NuxtLink :to="link.path" class="hover:text-leaf transition-colors text-white/70">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Col -->
        <div>
          <h4 class="font-display font-semibold text-white mb-4">Contact Info</h4>
          <ul class="space-y-2 text-sm text-white/90">
            <li v-if="settings?.footer?.contactPhone" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              {{ settings.footer.contactPhone }}
            </li>
            <li v-if="settings?.footer?.contactEmail" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              <a :href="`mailto:${settings.footer.contactEmail}`" class="hover:text-leaf transition-colors">{{ settings.footer.contactEmail }}</a>
            </li>
            <li v-if="settings?.footer?.contactAddress" class="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {{ settings.footer.contactAddress }}
            </li>
            <!-- Fallback if no settings yet -->
            <template v-if="!settings?.footer?.contactPhone && !settings?.footer?.contactEmail">
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +1 (555) 123-4567
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                info@ruralnexus.org
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                123 Innovation Drive, Agro Hub
              </li>
            </template>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/70">
        <p>{{ copyrightText }}</p>
        <div class="flex gap-4 mt-4 md:mt-0">
          <button class="hover:text-leaf transition-colors">Accessibility Options</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}
</style>
