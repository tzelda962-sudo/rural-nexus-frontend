<script setup lang="ts">
import { ref, computed } from "vue";
import type { Component } from "vue";
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview';
import {
  Droplets,
  Sprout,
  ShieldAlert,
  BookOpen,
  Tractor,
  Heart,
  ArrowRight,
  FileText,
  Download,
  Calendar,
  MapPin,
  ExternalLink,
  Layers,
  Rocket,
  Globe,
  Target,
  Zap,
  Users,
  Check,
  Info,
  BarChart3,
  MessageSquareQuote,
  Quote,
} from "lucide-vue-next";

type EventsPageGlobal = {
  header: {
    eyebrow?: string
    headlinePrefix?: string
    headlineEmphasis?: string
    body?: string
  }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;

const { data: rawPage } = useAsyncData('events-page-global', () =>
  $fetch<EventsPageGlobal>(`${apiBase}/api/globals/events-page`),
)

const { previewData: pageData } = usePayloadLivePreview<EventsPageGlobal>(rawPage)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Action Hub — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

const ICON_MAP: Record<string, Component> = {
  Droplets,
  Sprout,
  ShieldAlert,
  BookOpen,
  Tractor,
  Heart,
  Layers,
  Rocket,
  Globe,
  Target,
  Zap,
  Users,
  Check,
  FileText,
  Info,
  BarChart3,
  MapPin,
  MessageSquareQuote,
  Quote,
  ExternalLink,
  ArrowRight,
};

const activeTab = ref("projects");

const tabs = [
  { id: "projects", label: "Active Projects", icon: Sprout },
  { id: "publications", label: "Publications", icon: FileText },
  { id: "news", label: "News & Events", icon: Calendar },
];

function pubDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function newsDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

type Initiative = {
  title: string;
  slug: string;
  description: string;
  stat?: string | null;
  location?: string | null;
  status?: string | null;
  icon?: string | null;
  program: {
    id: string;
    title: string;
    slug: string;
    code: string;
    color: string;
  };
};
const { data: initiativesData } = useAsyncData("hub-initiatives", () =>
  $fetch<{ docs: Initiative[] }>(`${apiBase}/api/initiatives?showcase=true`),
);

const projects = computed(() =>
  (initiativesData.value?.docs ?? []).map((i, idx) => ({
    id: `${i.program.slug}-${idx}`,
    title: i.title,
    description: i.description,
    stat: i.stat ?? "",
    location: i.location ?? "",
    status: i.status ?? "Active",
    icon: ICON_MAP[i.icon ?? ""] ?? Layers,
    programSlug: i.program.slug,
    slug: i.slug,
  })),
);

type PayloadPub = {
  id: string;
  title: string;
  slug: string;
  author?: string | null;
  category: string;
  publishedDate: string;
  summary: string;
  pdf?: { url?: string } | null;
};
const { data: pubsData } = useAsyncData("hub-publications", () =>
  $fetch<{ docs: PayloadPub[] }>(
    `${apiBase}/api/publications?limit=50&sort=-publishedDate&depth=1`,
  ),
);

const publications = computed(() =>
  (pubsData.value?.docs ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    author: p.author ?? "",
    category: p.category,
    date: pubDate(p.publishedDate),
    summary: p.summary,
    pdfUrl: (p.pdf as { url?: string } | null)?.url,
  })),
);

type PayloadNewsEvent = {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  summary: string;
  image?: { url?: string } | null;
};
const { data: newsData } = useAsyncData("hub-news", () =>
  $fetch<{ docs: PayloadNewsEvent[] }>(
    `${apiBase}/api/news-events?limit=20&sort=-date&depth=1`,
  ),
);

const newsItems = computed(() =>
  (newsData.value?.docs ?? []).map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    type: n.category,
    date: newsDate(n.date),
    summary: n.summary,
    imageUrl: n.image?.url,
  })),
);

const typeColors: Record<string, string> = {
  Workshop: "bg-primary/10 text-primary",
  Publication: "bg-leaf/10 text-leaf",
  "Field Report": "bg-cyan/10 text-cyan",
  Funding: "bg-amber-500/10 text-amber-600",
  Policy: "bg-sunset/10 text-sunset",
  News: "bg-primary/10 text-primary",
};
</script>

<template>
  <div class="flex flex-col bg-surface min-h-screen">
    <!-- Hero -->
    <section class="relative overflow-hidden bg-primary py-24 text-white">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div
          class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"
        ></div>
        <div
          class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"
        ></div>
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p
            class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6"
          >
            {{ pageData?.header?.eyebrow ?? 'Development Hub' }}
          </p>
          <h1
            class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8"
          >
            {{ pageData?.header?.headlinePrefix ?? 'The' }} <span class="text-leaf-300 italic">{{ pageData?.header?.headlineEmphasis ?? 'Action Hub' }}</span>
          </h1>
          <p
            class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance"
          >
            {{ pageData?.header?.body ?? 'A comprehensive repository for RuralNexus projects, research publications, and international gatherings designed to drive food system transformation.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Sub-navigation Tabs -->
    <section
      class="sticky top-[72px] z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/10"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-8 py-4 overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold text-sm tracking-widest uppercase whitespace-nowrap"
            :class="
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            "
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="flex-grow py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- MODULE: Projects -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="activeTab === 'projects'"
            class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <article
              v-for="proj in projects"
              :key="proj.id"
              class="group bg-surface-container-lowest p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div class="flex items-center justify-between mb-8">
                <div
                  class="w-14 h-14 hex-mask bg-primary/5 group-hover:bg-primary transition-colors flex items-center justify-center text-primary group-hover:text-white"
                >
                  <component :is="proj.icon" class="w-6 h-6" />
                </div>
                <span
                  class="text-[10px] font-bold px-3 py-1 bg-surface-container-low rounded-full uppercase tracking-widest text-on-surface-variant"
                >
                  {{ proj.status }}
                </span>
              </div>
              <h3 class="text-lg font-display font-bold text-on-surface mb-3">
                {{ proj.title }}
              </h3>
              <p
                class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-8"
              >
                {{ proj.description }}
              </p>

              <div
                class="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant mb-6 opacity-50 uppercase tracking-widest"
              >
                <MapPin class="w-3 h-3" /> {{ proj.location }}
              </div>

              <div class="border-t border-outline-variant/10 pt-6">
                <p class="text-xl font-display font-bold text-primary mb-0.5">
                  {{ proj.stat }}
                </p>
                <p
                  class="text-[11px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest"
                >
                  {{ proj.stat }}
                </p>
              </div>
            </article>
          </div>
        </Transition>

        <!-- MODULE: Publications -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="activeTab === 'publications'"
            class="grid grid-cols-1 gap-6"
          >
            <div
              v-for="pub in publications"
              :key="pub.id"
              class="p-8 bg-surface-container-lowest rounded-[32px] border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group"
            >
              <div class="flex items-center gap-8">
                <div
                  class="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 group-hover:text-primary group-hover:bg-primary/5 transition-all"
                >
                  <FileText class="w-8 h-8" />
                </div>
                <div>
                  <span
                    class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block"
                    >{{ pub.category }}</span
                  >
                  <h3
                    class="text-xl font-display font-bold text-on-surface mb-2 tracking-tight"
                  >
                    {{ pub.title }}
                  </h3>
                  <p
                    class="text-sm text-on-surface-variant font-body opacity-70 mb-1 leading-relaxed"
                  >
                    {{ pub.summary }}
                  </p>
                  <p
                    class="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest"
                  >
                    {{ pub.author }} • {{ pub.date }}
                  </p>
                </div>
              </div>
              <div class="flex-shrink-0 flex flex-col gap-2">
                <a
                  v-if="pub.pdfUrl"
                  :href="pub.pdfUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all"
                >
                  <Download class="w-4 h-4" /> Download PDF
                </a>
                <NuxtLink
                  :to="`/publications/${pub.slug}`"
                  class="flex items-center gap-3 px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  Read Abstract
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>

        <!-- MODULE: News & Events -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="activeTab === 'news'" class="grid md:grid-cols-2 gap-8">
            <article
              v-for="event in newsItems"
              :key="event.id"
              class="flex flex-col bg-surface-container-lowest rounded-[44px] overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div class="p-10 flex-grow">
                <div class="flex justify-between items-start mb-10">
                  <span
                    class="rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    :class="
                      typeColors[event.type] ?? 'bg-primary/5 text-primary'
                    "
                  >
                    {{ event.type }}
                  </span>
                  <div
                    class="flex items-center gap-2 text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest"
                  >
                    <Calendar class="w-3.5 h-3.5" /> {{ event.date }}
                  </div>
                </div>
                <h3
                  class="text-2xl font-display font-bold text-on-surface mb-4 leading-snug group-hover:text-primary transition-colors"
                >
                  {{ event.title }}
                </h3>
                <p
                  class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-10"
                >
                  {{ event.summary }}
                </p>

                <div
                  class="flex items-center justify-end mt-auto pt-8 border-t border-outline-variant/10"
                >
                  <NuxtLink
                    :to="`/news/${event.slug}`"
                    class="flex items-center gap-3 text-xs font-bold text-primary uppercase tracking-widest group/btn"
                  >
                    Read More
                    <ArrowRight
                      class="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    />
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>
        </Transition>
      </div>
    </main>

    <!-- Global CTA -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="font-display text-3xl font-bold mb-6 tracking-tight">
          Catalysing Change Through Collaboration
        </h2>
        <p
          class="text-lg text-on-surface-variant font-body opacity-70 mb-10 leading-relaxed"
        >
          We welcome proposals for co-hosting events, contributing to research
          publications, or partnering on field implementation projects.
        </p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-[22px] font-bold shadow-xl hover:shadow-2xl transition-all"
        >
          Initiate Contact <ExternalLink class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.balance {
  text-wrap: balance;
}
</style>
