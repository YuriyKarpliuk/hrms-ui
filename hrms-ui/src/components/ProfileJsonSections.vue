<template>
  <div class="space-y-8">

    <SectionCard title=" Languages" @edit="openModal('languages')" :editable="true">
      <div v-if="langs.length" class="flex flex-wrap gap-2">
        <span v-for="(l, i) in langs" :key="i" class="px-3 py-1 rounded-full bg-gray-700 text-sm text-gray-200">
          {{ l.language }} <span class="text-gray-400 text-xs">• {{ l.level }}</span>
        </span>
      </div>
      <p v-else class="text-gray-500 italic">No languages added.</p>
    </SectionCard>

    <SectionCard title="🎓 Education" @edit="openModal('education')" :editable="true">
      <div v-if="edu.length" class="grid md:grid-cols-2 gap-4">
        <div v-for="(e, i) in edu" :key="i" class="bg-gray-900/40 p-4 border border-gray-700 rounded-lg">
          <h4 class="font-semibold text-gray-200">{{ e.degree }}</h4>
          <p class="text-sm text-gray-400">{{ e.institution }} ({{ e.year }})</p>
          <p v-if="e.field" class="text-xs text-gray-500 mt-1">Field: {{ e.field }}</p>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">No education records yet.</p>
    </SectionCard>

    <SectionCard title="💼 Work Experience" @edit="openModal('workExperience')" :editable="true">
      <div v-if="exp.length">
        <div v-for="(w, i) in exp" :key="i" class="border border-gray-700 bg-gray-900/40 p-4 rounded-lg mb-3">
          <h4 class="font-semibold text-gray-200">{{ w.role }}</h4>
          <p class="text-sm text-gray-400">{{ w.company }} ({{ w.years }} years)</p>
          <ul v-if="w.responsibilities?.length" class="list-disc ml-5 text-sm text-gray-300 mt-2">
            <li v-for="(r, rIdx) in w.responsibilities" :key="rIdx">{{ r }}</li>
          </ul>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">No work experience yet.</p>
    </SectionCard>

    <SectionCard title="👤 Profile" @edit="openModal('profile')" :editable="true">
      <div v-if="hasProfile" class="grid md:grid-cols-2 gap-4 text-sm">
        <div v-if="profile.skills?.length" class="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <h4 class="font-semibold text-gray-200 mb-1">Skills</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="(s, i) in profile.skills" :key="i" class="px-2 py-0.5 rounded bg-gray-700 text-xs text-gray-200">{{ s }}</span>
          </div>
        </div>

        <div v-if="profile.certifications?.length" class="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <h4 class="font-semibold text-gray-200 mb-1">Certifications</h4>
          <ul class="list-disc ml-5 text-gray-300 text-sm">
            <li v-for="(c, i) in profile.certifications" :key="i">{{ c }}</li>
          </ul>
        </div>

        <div v-if="profile.hobbies?.length" class="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <h4 class="font-semibold text-gray-200 mb-1">Hobbies</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="(h, i) in profile.hobbies" :key="i" class="px-2 py-0.5 rounded bg-gray-700 text-xs text-gray-200">{{ h }}</span>
          </div>
        </div>

        <div v-if="socials.length" class="bg-gray-900/40 rounded-lg p-3 border border-gray-700 md:col-span-2">
          <h4 class="font-semibold text-gray-200 mb-1">Links</h4>
          <div class="flex flex-wrap gap-3">
            <a v-for="(s, i) in socials" :key="i" :href="s.url" target="_blank" class="text-orange-400 hover:text-orange-300 underline">
              {{ s.label }}
            </a>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">No profile info yet.</p>
    </SectionCard>

    <Modal v-if="modalVisible" :title="modalTitle" @close="closeModal">
      <EditForm
        :type="modalType"
        :data="modalData"
        @save="handleSave"
        @cancel="closeModal"
      />
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '../lib/api'
import SectionCard from './SectionCard.vue'
import Modal from './Modal.vue'
import EditForm from './EditForm.vue'

interface Language { language: string; level: string }
interface Education { degree: string; field: string; institution: string; year?: number }
interface WorkExperience { company: string; role: string; years?: number; responsibilities?: string[] }
interface Profile { skills?: string[]; hobbies?: string[]; certifications?: string[]; linkedin?: string; github?: string; portfolio?: string }

const props = defineProps<{
  employeeId?: number
  languages?: Language[]
  education?: Education[]
  workExperience?: WorkExperience[]
  profile?: Profile
}>()

const langs = computed(() => props.languages || [])
const edu = computed(() => props.education || [])
const exp = computed(() => props.workExperience || [])
const profile = computed(() => props.profile || {})
const socials = computed(() => {
  const p = profile.value
  const links: any[] = []
  if (p.linkedin) links.push({ label: 'LinkedIn', url: p.linkedin })
  if (p.github) links.push({ label: 'GitHub', url: p.github })
  if (p.portfolio) links.push({ label: 'Portfolio', url: p.portfolio })
  return links
})
const hasProfile = computed(() =>
  profile.value.skills?.length ||
  profile.value.hobbies?.length ||
  profile.value.certifications?.length ||
  socials.value.length
)

const modalVisible = ref(false)
const modalType = ref<'languages' | 'education' | 'workExperience' | 'profile'>('languages')
const modalData = ref<any>(null)
const modalTitle = computed(() => ({
  languages: 'Edit Languages',
  education: 'Edit Education',
  workExperience: 'Edit Work Experience',
  profile: 'Edit Profile Info',
}[modalType.value]))

function openModal(type: typeof modalType.value) {
  modalType.value = type
modalData.value = JSON.parse(JSON.stringify(props[type]))
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

async function handleSave(data: any) {
  try {
    const payload: Record<string, any> = {}
    payload[`${modalType.value}Json`] = data
    await api.patch(`/api/v1/employees/${props.employeeId}`, payload)
    window.location.reload()
  } catch (err) {
    console.error('Failed to save section:', err)
  } finally {
    closeModal()
  }
}
</script>
