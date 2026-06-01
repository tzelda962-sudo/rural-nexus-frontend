<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import {
  Droplets, Sprout, ShieldAlert, BookOpen, Tractor, Heart,
  Layers, Rocket, Globe, Target, Zap, Users, Check, FileText,
  Info, BarChart3, MapPin, MessageSquareQuote, Quote, ExternalLink,
} from 'lucide-vue-next'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

useHead({ title: 'Active Projects — RuralNexus' })

const ICON_MAP: Record<string, Component> = {
  Droplets, Sprout, ShieldAlert, BookOpen, Tractor, Heart,
  Layers, Rocket, Globe, Target, Zap, Users, Check, FileText,
  Info, BarChart3, MapPin, MessageSquareQuote, Quote, ExternalLink,
}

type Initiative = {
  title: string; slug: string; description: string
  stat?: string | null; location?: string | null; status?: string | null; icon?: string | null
  program: { id: string; title: string; slug: string; code: string; color: string }
}

const { data: initiativesData } = await useAsyncData('projects-initiatives', () =>
  $fetch<{ docs: Initiative[] }>(`${apiBase}/api/initiatives?showcase=true`),
)

const projects = computed(() =>
  (initiativesData.value?.docs ?? []).map((i, idx) => ({
    id: `${i.program.slug}-${idx}`,
    title: i.title,
    description: i.description,
    stat: i.stat ?? '',
    location: i.location ?? '',
    status: i.status ?? 'Active',
    icon: ICON_MAP[i.icon ?? ''] ?? Layers,
    programSlug: i.program.slug,
    slug: i.slug,
  })),
)
</script>

<template>
  <div class="flex flex-col bg-surface min-h-screen">
    <!-- Hero -->
    <section class="relative overflow-hidden bg-primary py-24 text-white">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">What We Do</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            Active <span class="text-leaf-300 italic">Projects</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance">
            Field initiatives and development projects currently underway across our program areas.
          </p>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <main class="flex-grow py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article
            v-for="proj in projects"
            :key="proj.id"
            class="group bg-surface-container-lowest p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div class="flex items-center justify-between mb-8">
              <div class="w-14 h-14 hex-mask bg-primary/5 group-hover:bg-primary transition-colors flex items-center justify-center text-primary group-hover:text-white">
                <component :is="proj.icon" class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-bold px-3 py-1 bg-surface-container-low rounded-full uppercase tracking-widest text-on-surface-variant">
                {{ proj.status }}
              </span>
            </div>
            <h3 class="text-lg font-display font-bold text-on-surface mb-3">{{ proj.title }}</h3>
            <p class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-8">
              {{ proj.description }}
            </p>
            <div class="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant mb-6 opacity-50 uppercase tracking-widest">
              <MapPin class="w-3 h-3" /> {{ proj.location }}
            </div>
            <div class="border-t border-outline-variant/10 pt-6">
              <p class="text-xl font-display font-bold text-primary mb-0.5">{{ proj.stat }}</p>
              <p class="text-[11px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">Impact metric</p>
            </div>
          </article>
        </div>
      </div>
    </main>

    <!-- CTA -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="font-display text-3xl font-bold mb-6 tracking-tight">Catalysing Change Through Collaboration</h2>
        <p class="text-lg text-on-surface-variant font-body opacity-70 mb-10 leading-relaxed">
          We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects.
        </p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-[22px] font-bold shadow-xl hover:shadow-2xl transition-all">
          Initiate Contact <ExternalLink class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.balance { text-wrap: balance; }
</style>
