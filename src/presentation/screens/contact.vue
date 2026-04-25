<template>
  <div class="flex flex-col min-h-screen bg-surface">
    <!-- Header -->
    <section class="py-20 bg-gradient-to-br from-primary-container to-primary text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div class="w-16 h-16 hex-mask bg-white/10 mx-auto flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <h1 class="text-4xl md:text-5xl font-display font-bold mb-6">{{ pageData?.header?.headline ?? 'Partner With Us' }}</h1>
        <p class="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-body">
          {{ pageData?.header?.body ?? 'Whether you are a farming cooperative, a global funding body, or a fellow research institution, RuralNexus is ready to collaborate.' }}
        </p>
      </div>
    </section>

    <!-- Content -->
    <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">

        <!-- Contact Form Side -->
        <div class="bg-surface-container-lowest p-8 md:p-12 rounded-2xl ambient-shadow">
          <h2 class="text-3xl font-display font-bold mb-2">{{ pageData?.formSection?.heading ?? 'Send an Inquiry' }}</h2>
          <p class="text-on-surface-variant font-body mb-8">{{ pageData?.formSection?.subheading ?? 'Our PA5 Consultancy team aims to respond to all inquiries within 48 hours.' }}</p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-on-surface mb-2">First Name</label>
                <input v-model="form.firstName" type="text" class="w-full bg-surface-container-low border border-transparent focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg px-4 py-3 outline-none transition-all" placeholder="Jane" required>
              </div>
              <div>
                <label class="block text-sm font-semibold text-on-surface mb-2">Last Name</label>
                <input v-model="form.lastName" type="text" class="w-full bg-surface-container-low border border-transparent focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg px-4 py-3 outline-none transition-all" placeholder="Doe" required>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-on-surface mb-2">Email</label>
              <input v-model="form.email" type="email" class="w-full bg-surface-container-low border border-transparent focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg px-4 py-3 outline-none transition-all" placeholder="jane@example.org" required>
            </div>

            <div>
              <label class="block text-sm font-semibold text-on-surface mb-2">Organization <span class="text-on-surface-variant font-normal opacity-50">(optional)</span></label>
              <input v-model="form.organization" type="text" class="w-full bg-surface-container-low border border-transparent focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg px-4 py-3 outline-none transition-all" placeholder="EU Agritech Fund">
            </div>

            <div>
              <label class="block text-sm font-semibold text-on-surface mb-2">Interest Area</label>
              <select v-model="form.interestArea" class="w-full bg-surface-container-low border border-transparent focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg px-4 py-3 outline-none appearance-none transition-all">
                <template v-if="interestOptions.length > 0">
                  <option v-for="opt in interestOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </template>
                <template v-else>
                  <option>Project Acquisition (PA1)</option>
                  <option>Research Partnership (PA3)</option>
                  <option>Capacity Building / Training (PA4)</option>
                  <option>Sustainability Auditing (PA5)</option>
                  <option>Other</option>
                </template>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-on-surface mb-2">Message</label>
              <textarea v-model="form.message" rows="4" class="w-full bg-surface-container-low border border-transparent focus:border-cyan focus:ring-1 focus:ring-cyan rounded-lg px-4 py-3 outline-none resize-none transition-all" placeholder="How can we help?" required></textarea>
            </div>

            <p v-if="status === 'error'" class="text-sm text-red-600 font-medium">{{ errorMsg }}</p>

            <button type="submit" :disabled="status === 'sending'" class="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-all flex justify-center items-center gap-2 group disabled:opacity-60">
              <span v-if="status === ''">Submit Inquiry</span>
              <span v-else-if="status === 'sending'" class="animate-pulse">Sending...</span>
              <span v-else-if="status === 'success'" class="text-leaf-300">Message Sent Successfully!</span>
              <span v-else>Submit Inquiry</span>
              <svg v-if="status === ''" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>

        <!-- Location Side -->
        <div class="flex flex-col justify-center space-y-12">
          <div>
            <h3 class="text-sm uppercase tracking-widest font-bold text-on-surface-variant mb-6">Global Headquarters</h3>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 hex-mask bg-cyan/20 text-cyan flex items-center justify-center flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <p class="font-display font-bold text-xl mb-1">RuralNexus Innovation Center</p>
                <p class="text-on-surface-variant font-body mb-4">{{ pageData?.infoSection?.address ?? '123 Agritech Valley, Innovation District\nGeneva, 1000, Switzerland' }}</p>
                <a href="#" class="text-primary font-bold text-sm hover:underline">Get Directions &rarr;</a>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm uppercase tracking-widest font-bold text-on-surface-variant mb-6">Direct Contacts</h3>
            <div class="space-y-6">
              <template v-if="departments.length > 0">
                <div v-for="dept in departments" :key="dept.title" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center overflow-hidden bg-surface-container-low text-on-surface-variant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p class="font-bold text-on-surface">{{ dept.title }}</p>
                    <p class="text-sm text-on-surface-variant">{{ dept.email }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center overflow-hidden bg-surface-container-low text-on-surface-variant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p class="font-bold text-on-surface">Press & Dissemination (PA2)</p>
                    <p class="text-sm text-on-surface-variant">press@ruralnexus.org</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center overflow-hidden bg-surface-container-low text-on-surface-variant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <div>
                    <p class="font-bold text-on-surface">Research & Methodology (PA3)</p>
                    <p class="text-sm text-on-surface-variant">research@ruralnexus.org</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview';

type ContactPageGlobal = {
  header?: { eyebrow?: string; headline?: string; body?: string }
  formSection?: {
    heading?: string
    subheading?: string
    interestAreaOptions?: { label: string; value: string }[]
  }
  infoSection?: {
    address?: string
    departments?: { title: string; email: string }[]
  }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const { data: rawPage } = await useAsyncData('contact-page-global', () =>
  $fetch<ContactPageGlobal>(`${apiBase}/api/globals/contact-page`),
)

const { previewData: pageData } = usePayloadLivePreview(rawPage)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Contact — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

const interestOptions = computed(() => pageData.value?.formSection?.interestAreaOptions ?? [])
const departments = computed(() => pageData.value?.infoSection?.departments ?? [])

const status = ref<'sending' | 'success' | 'error' | ''>('')
const errorMsg = ref('')

const defaultInterest = computed(() =>
  interestOptions.value[0]?.value ?? 'Project Acquisition (PA1)'
)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  interestArea: defaultInterest.value,
  message: '',
})

async function handleSubmit() {
  status.value = 'sending'
  errorMsg.value = ''
  try {
    await $fetch(`${apiBase}/api/contact`, {
      method: 'POST',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        organization: form.organization || undefined,
        interestArea: form.interestArea,
        message: form.message,
      },
    })
    status.value = 'success'
    Object.assign(form, { firstName: '', lastName: '', email: '', organization: '', interestArea: defaultInterest.value, message: '' })
    setTimeout(() => { status.value = '' }, 4000)
  } catch {
    status.value = 'error'
    errorMsg.value = 'Something went wrong. Please try again or email us directly.'
  }
}
</script>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}
</style>
