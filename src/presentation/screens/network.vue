<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRuntimeConfig, useAsyncData } from '#imports'
import {
  HttpPartnersRepository,
  type Partner,
  type TeamMemberApi,
  type InterventionCountry,
} from '@infrastructure/repositories/HttpPartnersRepository'
import MapTilerInterventionMap from '../components/MapTilerInterventionMap.vue'
import DetailModal from '../components/DetailModal.vue'
import ImageLightbox from '../components/ImageLightbox.vue'
import { Globe, GraduationCap, FlaskConical, Handshake, MapPin, ExternalLink } from 'lucide-vue-next'

useHead({ title: 'Our Network — RuralNexus' })

const config = useRuntimeConfig()
const repo = new HttpPartnersRepository(config.public.apiBase as string)

// All 7 fetches in one parallel call — one round-trip instead of seven
const { data: networkData } = useAsyncData('network-all', () =>
  Promise.all([
    repo.getTeamByType('ceo'),
    repo.getTeamByType('pa-manager'),
    repo.getTeamByType('advisory'),
    repo.getByContinent('Europe'),
    repo.getByContinent('Africa'),
    repo.getByContinent('Global'),
    repo.getInterventionCountries(),
  ])
)

const ceo = computed(() => networkData.value?.[0] ?? [])
const paManagers = computed(() => networkData.value?.[1] ?? [])
const advisoryBoard = computed(() => networkData.value?.[2] ?? [])
const europePartners = computed(() => networkData.value?.[3] ?? [])
const africaPartners = computed(() => networkData.value?.[4] ?? [])
const globalPartners = computed(() => networkData.value?.[5] ?? [])
const interventionCountries = computed(() => networkData.value?.[6] ?? [])

function typeIcon(type: Partner['type']) {
  const map: Record<string, typeof Globe> = {
    University: GraduationCap,
    'Research Institute': FlaskConical,
    NGO: Handshake,
    'Funding Agency': Globe,
  }
  return map[type] ?? Globe
}

// ── Detail modals & lightbox ───────────────────────────────────────
const selectedPartner = ref<Partner | null>(null)
const selectedManager = ref<TeamMemberApi | null>(null)
const selectedExpert = ref<TeamMemberApi | null>(null)
const lightboxImage = ref<{ url: string; alt: string } | null>(null)
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
            <button
              type="button"
              class="w-20 h-20 hex-mask flex-shrink-0 overflow-hidden"
              :class="member.avatar?.url ? 'cursor-zoom-in' : 'cursor-default'"
              @click="member.avatar?.url && (lightboxImage = { url: member.avatar.url, alt: member.name })"
            >
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
            </button>
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">{{ member.role }}</p>
              <p class="font-display font-bold text-xl mb-2">{{ member.name }}</p>
              <p v-if="member.bio" class="text-sm text-white/80 font-body leading-relaxed mb-3 line-clamp-3">{{ member.bio }}</p>
              <!-- Program areas -->
              <div v-if="member.programAreas?.length" class="flex flex-wrap gap-1.5 mb-3">
                <NuxtLink
                  v-for="pa in member.programAreas"
                  :key="pa.id"
                  :to="`/programs/${pa.slug}`"
                  class="px-2 py-0.5 text-[10px] font-bold bg-leaf/30 text-leaf-300 rounded-full hover:bg-leaf/50 transition-colors"
                >{{ pa.code }}: {{ pa.title }}</NuxtLink>
              </div>
              <div v-if="member.expertise?.length" class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="exp in member.expertise"
                  :key="exp.skill"
                  class="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full"
                >{{ exp.skill }}</span>
              </div>
              <button
                type="button"
                class="text-[10px] font-bold uppercase tracking-widest text-leaf-300 hover:underline inline-flex items-center gap-1"
                @click="selectedManager = member"
              >
                Read more →
              </button>
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
            <p v-if="member.bio" class="text-xs font-body text-on-surface-variant opacity-70 leading-relaxed line-clamp-3">
              {{ member.bio }}
            </p>
            <div v-if="member.expertise?.length" class="flex flex-wrap gap-1" :class="member.bio ? '' : 'mt-auto'">
              <span
                v-for="exp in member.expertise"
                :key="exp.skill"
                class="px-2 py-0.5 text-[10px] font-medium bg-surface-container text-on-surface-variant rounded-full"
              >{{ exp.skill }}</span>
            </div>
            <button
              type="button"
              class="mt-auto text-[10px] font-bold uppercase tracking-widest text-primary hover:underline inline-flex items-center gap-1"
              @click="selectedExpert = member"
            >
              {{ member.link?.linkLabel || 'Know more' }} →
            </button>
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
            <button
              v-for="partner in europePartners"
              :key="partner.id"
              type="button"
              class="p-5 bg-surface-container rounded-[20px] flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all group"
              @click="selectedPartner = partner"
            >
              <component :is="typeIcon(partner.type)" class="w-6 h-6 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              <p class="font-bold text-sm text-on-surface leading-tight">{{ partner.abbreviation || partner.name }}</p>
              <p class="text-[10px] text-on-surface-variant opacity-60 flex items-center gap-1">
                <MapPin class="w-3 h-3" /> {{ partner.country }}
              </p>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {{ partner.type }}
              </span>
            </button>
          </div>
        </div>

        <p class="mb-10 text-xs text-on-surface-variant font-body leading-relaxed opacity-60 italic">
          Affiliations listed are for identification purposes only and do not imply institutional endorsement or formal partnership with employers or affiliated organisations.
        </p>

        <!-- Africa -->
        <div :class="globalPartners.length ? 'mb-14' : ''">
          <h3 class="text-lg font-display font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-3">
            <span class="h-px flex-1 bg-outline-variant/30"></span>
            Africa
            <span class="h-px flex-1 bg-outline-variant/30"></span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              v-for="partner in africaPartners"
              :key="partner.id"
              type="button"
              class="p-5 bg-surface-container rounded-[20px] flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all group"
              @click="selectedPartner = partner"
            >
              <component :is="typeIcon(partner.type)" class="w-6 h-6 text-leaf opacity-60 group-hover:opacity-100 transition-opacity" />
              <p class="font-bold text-sm text-on-surface leading-tight">{{ partner.abbreviation || partner.name }}</p>
              <p class="text-[10px] text-on-surface-variant opacity-60 flex items-center gap-1">
                <MapPin class="w-3 h-3" /> {{ partner.country }}
              </p>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-leaf/10 text-leaf">
                {{ partner.type }}
              </span>
            </button>
          </div>
        </div>

        <!-- Global -->
        <div v-if="globalPartners.length">
          <h3 class="text-lg font-display font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-3">
            <span class="h-px flex-1 bg-outline-variant/30"></span>
            Global
            <span class="h-px flex-1 bg-outline-variant/30"></span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              v-for="partner in globalPartners"
              :key="partner.id"
              type="button"
              class="p-5 bg-surface-container rounded-[20px] flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all group"
              @click="selectedPartner = partner"
            >
              <component :is="typeIcon(partner.type)" class="w-6 h-6 text-cyan opacity-60 group-hover:opacity-100 transition-opacity" />
              <p class="font-bold text-sm text-on-surface leading-tight">{{ partner.abbreviation || partner.name }}</p>
              <p class="text-[10px] text-on-surface-variant opacity-60 flex items-center gap-1">
                <MapPin class="w-3 h-3" /> {{ partner.country }}
              </p>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan/10 text-cyan">
                {{ partner.type }}
              </span>
            </button>
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
        <MapTilerInterventionMap :countries="interventionCountries ?? []" />
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

    <!-- ── Partner detail modal ──────────────────────────────────────── -->
    <DetailModal :open="!!selectedPartner" @close="selectedPartner = null">
      <template v-if="selectedPartner">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              v-if="selectedPartner.logo?.url"
              :src="selectedPartner.logo.url"
              :alt="selectedPartner.name"
              class="w-full h-full object-contain"
            />
            <component v-else :is="typeIcon(selectedPartner.type)" class="w-7 h-7 text-primary opacity-70" />
          </div>
          <div class="min-w-0">
            <p class="font-display font-bold text-xl leading-tight">{{ selectedPartner.name }}</p>
            <p v-if="selectedPartner.abbreviation" class="text-xs text-on-surface-variant opacity-60 mt-0.5">{{ selectedPartner.abbreviation }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">{{ selectedPartner.type }}</span>
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant flex items-center gap-1">
            <MapPin class="w-3 h-3" /> {{ selectedPartner.country }} · {{ selectedPartner.continent }}
          </span>
        </div>
        <p v-if="selectedPartner.description" class="text-sm text-on-surface-variant font-body leading-relaxed mb-5">
          {{ selectedPartner.description }}
        </p>
        <a
          v-if="selectedPartner.website"
          :href="selectedPartner.website"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          Visit website <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </template>
    </DetailModal>

    <!-- ── Management team detail modal ────────────────────────────────── -->
    <DetailModal :open="!!selectedManager" variant="primary" @close="selectedManager = null">
      <template v-if="selectedManager">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-16 h-16 hex-mask flex-shrink-0 overflow-hidden">
            <img
              v-if="selectedManager.avatar?.url"
              :src="selectedManager.avatar.url"
              :alt="selectedManager.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-white/20 flex items-center justify-center text-white font-display font-bold text-2xl"
            >
              {{ selectedManager.name.charAt(0) }}
            </div>
          </div>
          <div class="min-w-0">
            <p class="font-display font-bold text-xl leading-tight">{{ selectedManager.name }}</p>
            <p class="text-xs font-bold uppercase tracking-wider text-white/60 mt-1">{{ selectedManager.role }}</p>
          </div>
        </div>
        <p v-if="selectedManager.bio" class="text-sm text-white/80 font-body leading-relaxed mb-5">
          {{ selectedManager.bio }}
        </p>
        <div v-if="selectedManager.programAreas?.length" class="flex flex-wrap gap-1.5 mb-5">
          <NuxtLink
            v-for="pa in selectedManager.programAreas"
            :key="pa.id"
            :to="`/programs/${pa.slug}`"
            class="px-2 py-0.5 text-[10px] font-bold bg-leaf/30 text-leaf-300 rounded-full hover:bg-leaf/50 transition-colors"
          >{{ pa.code }}: {{ pa.title }}</NuxtLink>
        </div>
        <div v-if="selectedManager.expertise?.length" class="flex flex-wrap gap-1.5 mb-5">
          <span
            v-for="exp in selectedManager.expertise"
            :key="exp.skill"
            class="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full"
          >{{ exp.skill }}</span>
        </div>
        <a
          v-if="selectedManager.link?.linkUrl"
          :href="selectedManager.link.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white hover:underline"
        >
          {{ selectedManager.link.linkLabel || 'Visit website' }} <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </template>
    </DetailModal>

    <!-- ── Expert detail modal ───────────────────────────────────────── -->
    <DetailModal :open="!!selectedExpert" @close="selectedExpert = null">
      <template v-if="selectedExpert">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-16 h-16 hex-mask bg-leaf/15 flex items-center justify-center text-leaf font-display font-bold text-2xl flex-shrink-0">
            {{ selectedExpert.name.charAt(0) }}
          </div>
          <div class="min-w-0">
            <p class="font-display font-bold text-xl leading-tight">{{ selectedExpert.name }}</p>
            <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant opacity-60 mt-1">{{ selectedExpert.role }}</p>
            <p v-if="selectedExpert.location" class="text-xs text-on-surface-variant opacity-50 mt-1 flex items-center gap-1">
              <MapPin class="w-3 h-3" /> {{ selectedExpert.location }}
            </p>
          </div>
        </div>
        <p v-if="selectedExpert.bio" class="text-sm text-on-surface-variant font-body leading-relaxed mb-5">
          {{ selectedExpert.bio }}
        </p>
        <div v-if="selectedExpert.expertise?.length" class="flex flex-wrap gap-1.5 mb-5">
          <span
            v-for="exp in selectedExpert.expertise"
            :key="exp.skill"
            class="px-2 py-0.5 text-[10px] font-medium bg-surface-container text-on-surface-variant rounded-full"
          >{{ exp.skill }}</span>
        </div>
        <a
          v-if="selectedExpert.link?.linkUrl"
          :href="selectedExpert.link.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          {{ selectedExpert.link.linkLabel || 'Visit portal' }} <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </template>
    </DetailModal>

    <!-- ── Team member image lightbox ───────────────────────────────── -->
    <ImageLightbox
      :open="!!lightboxImage"
      :src="lightboxImage?.url ?? ''"
      :alt="lightboxImage?.alt"
      @close="lightboxImage = null"
    />

  </div>
</template>
