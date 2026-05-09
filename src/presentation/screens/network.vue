<script setup lang="ts">
import { useRuntimeConfig, useLazyAsyncData } from '#imports'
import {
  HttpPartnersRepository,
  type Partner,
  type TeamMemberApi,
  type InterventionCountry,
} from '@infrastructure/repositories/HttpPartnersRepository'
import WorldInterventionMap from '../components/WorldInterventionMap.vue'
import { Globe, GraduationCap, FlaskConical, Handshake, MapPin } from 'lucide-vue-next'

useHead({ title: 'Our Network — RuralNexus' })

const config = useRuntimeConfig()
const repo = new HttpPartnersRepository(config.public.apiBase as string)

const { data: ceo } = useLazyAsyncData('network-ceo', () => repo.getTeamByType('ceo'))
const { data: paManagers } = useLazyAsyncData('network-pac', () => repo.getTeamByType('pa-manager'))
const { data: advisoryBoard } = useLazyAsyncData('network-advisory', () => repo.getTeamByType('advisory'))
const { data: europePartners } = useLazyAsyncData('partners-europe', () => repo.getByContinent('Europe'))
const { data: africaPartners } = useLazyAsyncData('partners-africa', () => repo.getByContinent('Africa'))
const { data: interventionCountries } = useLazyAsyncData('intervention-countries', () => repo.getInterventionCountries())

function typeIcon(type: Partner['type']) {
  const map: Record<string, typeof Globe> = {
    University: GraduationCap,
    'Research Institute': FlaskConical,
    NGO: Handshake,
    'Funding Agency': Globe,
  }
  return map[type] ?? Globe
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-surface">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <section class="py-24 bg-surface-container-low relative overflow-hidden">
      <div class="absolute top-0 right-0 w-1/3 h-full hex-mask bg-primary opacity-5 -mr-24"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <p class="text-sm font-bold uppercase tracking-widest text-primary mb-4">Our Network</p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight tracking-tight">
          A Global Web of<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-leaf to-cyan italic">Research & Expertise</span>
        </h1>
        <p class="text-lg text-on-surface-variant max-w-3xl font-body leading-relaxed">
          RuralNexus operates through a decentralized network of management, consulting experts, and partner institutions across Europe and Africa, united by a shared commitment to inter-transdisciplinary rural development.
        </p>
      </div>
    </section>

    <!-- ── Management Team ─────────────────────────────────────────── -->
    <section class="py-20 bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Leadership</p>
        <h2 class="text-3xl font-display font-bold mb-12">Management Team</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- CEO -->
          <div
            v-for="member in ceo"
            :key="member.id"
            class="col-span-full lg:col-span-2 p-8 bg-primary text-white rounded-[36px] flex items-start gap-6"
          >
            <div class="w-16 h-16 hex-mask bg-white/20 flex-shrink-0 flex items-center justify-center text-white font-display font-bold text-2xl">
              {{ member.name.charAt(0) }}
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">{{ member.role }}</p>
              <p class="font-display font-bold text-xl mb-2">{{ member.name }}</p>
              <p v-if="member.bio" class="text-sm text-white/80 font-body leading-relaxed">{{ member.bio }}</p>
            </div>
          </div>

          <!-- PA Managers -->
          <div
            v-for="member in paManagers"
            :key="member.id"
            class="p-6 bg-surface-container rounded-[28px] flex flex-col gap-3"
          >
            <div class="w-12 h-12 hex-mask bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {{ member.name.charAt(0) }}
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{{ member.role }}</p>
              <p class="font-display font-bold text-base">{{ member.name }}</p>
              <p v-if="member.bio" class="text-xs text-on-surface-variant font-body leading-relaxed mt-1 opacity-70">{{ member.bio }}</p>
            </div>
            <div v-if="member.expertise?.length" class="flex flex-wrap gap-1 mt-auto">
              <span
                v-for="exp in member.expertise"
                :key="exp.skill"
                class="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full"
              >{{ exp.skill }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Advisory Board ──────────────────────────────────────────── -->
    <section class="py-20 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Experts & Advisors</p>
        <h2 class="text-3xl font-display font-bold mb-12">Advisory Board</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div
            v-for="member in advisoryBoard"
            :key="member.id"
            class="p-6 bg-surface rounded-[24px] flex flex-col gap-3 hover:shadow-lg transition-all"
          >
            <div class="w-10 h-10 hex-mask bg-leaf/15 flex items-center justify-center text-leaf font-bold">
              {{ member.name.charAt(0) }}
            </div>
            <div>
              <p class="font-display font-bold text-sm leading-snug">{{ member.name }}</p>
              <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-60 mt-1">{{ member.role }}</p>
            </div>
            <div v-if="member.expertise?.length" class="flex flex-wrap gap-1 mt-auto">
              <span
                v-for="exp in member.expertise"
                :key="exp.skill"
                class="px-2 py-0.5 text-[10px] font-medium bg-surface-container text-on-surface-variant rounded-full"
              >{{ exp.skill }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Partner Institutions ────────────────────────────────────── -->
    <section class="py-20 bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Collaborating Institutions</p>
        <h2 class="text-3xl font-display font-bold mb-12">Past and Current Collaborators</h2>

        <!-- Europe -->
        <div class="mb-14">
          <h3 class="text-lg font-display font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-3">
            <span class="h-px flex-1 bg-outline-variant/30"></span>
            Europe
            <span class="h-px flex-1 bg-outline-variant/30"></span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="partner in europePartners"
              :key="partner.id"
              class="p-5 bg-surface-container rounded-[20px] flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <component :is="typeIcon(partner.type)" class="w-6 h-6 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              <p class="font-bold text-sm text-on-surface leading-tight">{{ partner.abbreviation || partner.name }}</p>
              <p class="text-[10px] text-on-surface-variant opacity-60 flex items-center gap-1">
                <MapPin class="w-3 h-3" /> {{ partner.country }}
              </p>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {{ partner.type }}
              </span>
            </div>
          </div>
        </div>

        <!-- Africa -->
        <div>
          <h3 class="text-lg font-display font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-3">
            <span class="h-px flex-1 bg-outline-variant/30"></span>
            Africa
            <span class="h-px flex-1 bg-outline-variant/30"></span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div
              v-for="partner in africaPartners"
              :key="partner.id"
              class="p-5 bg-surface-container rounded-[20px] flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <component :is="typeIcon(partner.type)" class="w-6 h-6 text-leaf opacity-60 group-hover:opacity-100 transition-opacity" />
              <p class="font-bold text-sm text-on-surface leading-tight">{{ partner.abbreviation || partner.name }}</p>
              <p class="text-[10px] text-on-surface-variant opacity-60 flex items-center gap-1">
                <MapPin class="w-3 h-3" /> {{ partner.country }}
              </p>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-leaf/10 text-leaf">
                {{ partner.type }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Geographic Intervention Map ────────────────────────────── -->
    <section class="py-20 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Where We Work</p>
        <h2 class="text-3xl font-display font-bold mb-4">Countries of Intervention</h2>
        <p class="text-on-surface-variant font-body mb-10 max-w-2xl leading-relaxed">
          RuralNexus has active field operations and research programmes across
          {{ interventionCountries?.length ?? 10 }} countries. Hover over a highlighted country to see active programmes, or click a region to zoom in.
        </p>

        <div class="max-w-2xl mx-auto">
          <WorldInterventionMap :countries="interventionCountries ?? []" />
        </div>

        <!-- Country chips -->
        <div class="flex flex-wrap gap-2 justify-center mt-8">
          <span
            v-for="country in interventionCountries"
            :key="country.isoCode"
            class="px-4 py-1.5 text-xs font-bold bg-leaf/10 text-leaf rounded-full border border-leaf/20"
          >
            {{ country.name }}
          </span>
        </div>
      </div>
    </section>

  </div>
</template>
