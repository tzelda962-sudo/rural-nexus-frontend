<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#imports'
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

// All 6 fetches in one parallel call — one round-trip instead of six
const { data: networkData } = useAsyncData('network-all', () =>
  Promise.all([
    repo.getTeamByType('ceo'),
    repo.getTeamByType('pa-manager'),
    repo.getTeamByType('advisory'),
    repo.getByContinent('Europe'),
    repo.getByContinent('Africa'),
    repo.getInterventionCountries(),
  ])
)

const ceo = computed(() => networkData.value?.[0] ?? [])
const paManagers = computed(() => networkData.value?.[1] ?? [])
const advisoryBoard = computed(() => networkData.value?.[2] ?? [])
const europePartners = computed(() => networkData.value?.[3] ?? [])
const africaPartners = computed(() => networkData.value?.[4] ?? [])
const interventionCountries = computed(() => networkData.value?.[5] ?? [])

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
        <!-- <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight tracking-tight">
          A Global Web of<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-leaf to-cyan italic">Research & Expertise</span>
        </h1> -->
        <p class="text-lg text-on-surface-variant max-w-3xl font-body leading-relaxed">
          RuralNexus is a transdisciplinary research network connecting universities, research institutes, communities, practitioners, and policy actors across Europe and Africa to co-create innovative solutions for sustainable, resilient, and inclusive rural futures. </p>
      </div>
    </section>

    <!-- ── Management Team ─────────────────────────────────────────── -->
    <section class="py-20 bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Leadership</p> -->
        <h2 class="text-3xl font-display font-bold mb-12">Management Team</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="member in [...(ceo ?? []), ...(paManagers ?? [])]"
            :key="member.id"
            class="p-8 bg-primary text-white rounded-[36px] flex items-start gap-6"
          >
            <!-- Avatar: photo if available, else initials -->
            <div class="w-20 h-20 hex-mask flex-shrink-0 overflow-hidden">
              <img
                v-if="member.avatar?.url"
                :src="member.avatar.url"
                :alt="member.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-white/20 flex items-center justify-center text-white font-display font-bold text-2xl"
              >
                {{ member.name.charAt(0) }}
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">{{ member.role }}</p>
              <p class="font-display font-bold text-xl mb-2">{{ member.name }}</p>
              <p v-if="member.bio" class="text-sm text-white/80 font-body leading-relaxed mb-3">{{ member.bio }}</p>
              <!-- Program areas -->
              <div v-if="member.programAreas?.length" class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="pa in member.programAreas"
                  :key="pa.id"
                  class="px-2 py-0.5 text-[10px] font-bold bg-leaf/30 text-leaf-300 rounded-full"
                >{{ pa.code }}: {{ pa.title }}</span>
              </div>
              <div v-if="member.expertise?.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="exp in member.expertise"
                  :key="exp.skill"
                  class="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full"
                >{{ exp.skill }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Advisory Board ──────────────────────────────────────────── -->
    <section class="py-20 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Experts & Advisors</p> -->
        <h2 class="text-3xl font-display font-bold mb-12">Collaborating Experts</h2>

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
              <p v-if="member.location" class="text-[10px] text-on-surface-variant opacity-50 mt-1 flex items-center gap-1">
                <MapPin class="w-3 h-3" /> {{ member.location }}
              </p>
            </div>
            <p v-if="member.bio" class="text-xs font-body text-on-surface-variant opacity-70 leading-relaxed">
              {{ member.bio }}
            </p>
            <div v-if="member.expertise?.length" class="flex flex-wrap gap-1" :class="member.bio ? '' : 'mt-auto'">
              <span
                v-for="exp in member.expertise"
                :key="exp.skill"
                class="px-2 py-0.5 text-[10px] font-medium bg-surface-container text-on-surface-variant rounded-full"
              >{{ exp.skill }}</span>
            </div>
            <a
              v-if="member.link?.linkUrl"
              :href="member.link.linkUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-auto text-[10px] font-bold uppercase tracking-widest text-primary hover:underline inline-flex items-center gap-1"
            >
              {{ member.link.linkLabel || 'Know more' }} →
            </a>
          </div>
        </div>

        <p class="mt-10 text-sm text-on-surface-variant font-body leading-relaxed opacity-70 max-w-3xl">
          Rural Nexus collaborates with a network of independent experts and associate consultants from diverse academic, technical, and professional backgrounds. These collaborations are project-based and support our interdisciplinary and action-oriented work across sustainability, rural development, and innovation systems.
        </p>
      </div>
    </section>

    <!-- ── Partner Institutions ────────────────────────────────────── -->
    <section class="py-20 bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Collaborating Institutions</p>
        <!-- <h2 class="text-3xl font-display font-bold mb-12">Past and Current Collaborators</h2> -->

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

        <p class="mb-10 text-xs text-on-surface-variant font-body leading-relaxed opacity-60 italic">
          Affiliations listed are for identification purposes only and do not imply institutional endorsement or formal partnership with employers or affiliated organisations.
        </p>

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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Where We Work</p>
        <h2 class="text-3xl font-display font-bold mb-4">Countries of Intervention</h2>
        <p class="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          RuralNexus has active field operations and research programmes across
          {{ interventionCountries?.length ?? 10 }} countries. Click a continent to zoom in, then click a highlighted country for programme details.
        </p>
      </div>

      <div class="px-4 sm:px-6 lg:px-8">
        <WorldInterventionMap :countries="interventionCountries ?? []" />
      </div>

      <!-- Country chips -->
      <div class="flex flex-wrap gap-2 justify-center mt-8 px-4 sm:px-6 lg:px-8">
        <span
          v-for="country in interventionCountries"
          :key="country.isoCode"
          class="px-4 py-1.5 text-xs font-bold bg-leaf/10 text-leaf rounded-full border border-leaf/20"
        >
          {{ country.name }}
        </span>
      </div>
    </section>

  </div>
</template>
