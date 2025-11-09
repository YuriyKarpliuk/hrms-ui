<template>
  <div>
    <div v-if="type === 'languages'">
      <h4 class="text-gray-300 mb-3 text-lg font-semibold">Languages</h4>
      <div v-for="(l, i) in data" :key="i" class="flex flex-col gap-2 mb-3 bg-gray-900/50 p-3 rounded-lg">
        <div class="flex gap-2">
          <select v-model="l.language" class="input flex-1">
            <option disabled value="">Select language</option>
            <option v-for="lang in languagesList" :key="lang" :value="lang">{{ lang }}</option>
          </select>
          <select v-model="l.level" class="input flex-1">
            <option disabled value="">Select level</option>
            <option v-for="level in levelsList" :key="level" :value="level">{{ level }}</option>
          </select>
          <button @click="data.splice(i, 1)" class="text-red-400 hover:text-red-300">🗑️</button>
        </div>
      </div>
      <button @click="data.push({ language: '', level: '' })" class="btn-orange mt-2">➕ Add Language</button>
    </div>

    <div v-else-if="type === 'education'">
      <h4 class="text-gray-300 mb-3 text-lg font-semibold">Education</h4>
      <div v-for="(e, i) in data" :key="i" class="grid gap-2 mb-4 bg-gray-900/50 p-3 rounded-lg">
        <label class="text-gray-400 text-sm">Degree</label>
        <select v-model="e.degree" class="input">
          <option disabled value="">Select degree</option>
          <option v-for="d in degreeList" :key="d" :value="d">{{ d }}</option>
        </select>

        <label class="text-gray-400 text-sm mt-2">Field</label>
        <select v-model="e.field" class="input">
          <option disabled value="">Select field</option>
          <option v-for="f in fieldList" :key="f" :value="f">{{ f }}</option>
        </select>

        <label class="text-gray-400 text-sm mt-2">Institution</label>
        <input v-model="e.institution" placeholder="Institution name" class="input" />

        <label class="text-gray-400 text-sm mt-2">Graduation Year</label>
        <select v-model="e.year" class="input">
          <option disabled value="">Select year</option>
          <option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
        </select>

        <button @click="data.splice(i, 1)" class="text-red-400 hover:text-red-300 mt-2">🗑️ Remove</button>
      </div>
      <button @click="data.push({ degree: '', field: '', institution: '', year: '' })" class="btn-orange">➕ Add Education</button>
    </div>

    <div v-else-if="type === 'workExperience'">
      <h4 class="text-gray-300 mb-3 text-lg font-semibold">Work Experience</h4>
      <div v-for="(w, i) in data" :key="i" class="mb-4 border border-gray-700 p-3 rounded-lg bg-gray-900/50">
        <label class="text-gray-400 text-sm">Company</label>
        <input v-model="w.company" placeholder="Company" class="input mb-2" />

        <label class="text-gray-400 text-sm">Role</label>
        <input v-model="w.role" placeholder="Role" class="input mb-2" />

        <label class="text-gray-400 text-sm">Years of experience</label>
        <input v-model.number="w.years" placeholder="Years" type="number" class="input mb-2" min="0"/>

        <label class="text-gray-400 text-sm">Responsibilities</label>
        <textarea v-model="w.responsibilitiesStr" placeholder="Responsibilities (comma-separated)" class="input"></textarea>

        <button @click="data.splice(i, 1)" class="text-red-400 hover:text-red-300 mt-2">🗑️ Remove</button>
      </div>
      <button @click="data.push({ company: '', role: '', years: 0, responsibilitiesStr: '' })" class="btn-orange">➕ Add Experience</button>
    </div>

    <div v-else-if="type === 'profile'">
      <h4 class="text-gray-300 mb-3 text-lg font-semibold">Profile Details</h4>
      <textarea v-model="data.bio" placeholder="Short bio..." class="input mb-3" />
      <input v-model="data.linkedin" placeholder="LinkedIn URL" class="input mb-2" />
      <input v-model="data.portfolio" placeholder="Portfolio URL" class="input mb-2" />
      <textarea v-model="skillsInput" placeholder="Skills (comma-separated)" class="input mb-2"></textarea>
      <textarea v-model="hobbiesInput" placeholder="Hobbies (comma-separated)" class="input mb-2"></textarea>
      <textarea v-model="certInput" placeholder="Certifications (comma-separated)" class="input mb-2"></textarea>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <button @click="$emit('cancel')" class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">Cancel</button>
      <button @click="save" class="btn-orange">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ type: string; data: any }>()
const emit = defineEmits(['save', 'cancel'])

const skillsInput = ref('')
const hobbiesInput = ref('')
const certInput = ref('')

const languagesList = [
  'Ukrainian', 'English', 'Polish', 'German', 'French', 'Spanish', 'Italian',
  'Chinese', 'Japanese', 'Korean', 'Turkish', 'Czech', 'Slovak', 'Romanian', 'Arabic',
  'Dutch', 'Portuguese', 'Finnish', 'Greek', 'Hungarian'
]
const levelsList = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Fluent', 'Native']

const degreeList = ['Bachelor', 'Master', 'PhD', 'Associate', 'Diploma', 'Certificate']
const fieldList = [
  'Computer Science', 'Software Engineering', 'Human Resources', 'Management',
  'Finance', 'Marketing', 'Design', 'Law', 'Data Science', 'Psychology', 'Economics'
]
const yearsList = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => new Date().getFullYear() - i)

watch(() => props.data, () => {
  if (props.type === 'profile') {
    skillsInput.value = (props.data.skills || []).join(', ')
    hobbiesInput.value = (props.data.hobbies || []).join(', ')
    certInput.value = (props.data.certifications || []).join(', ')
  }
}, { immediate: true })

function save() {
  if (props.type === 'profile') {
    props.data.skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean)
    props.data.hobbies = hobbiesInput.value.split(',').map(s => s.trim()).filter(Boolean)
    props.data.certifications = certInput.value.split(',').map(s => s.trim()).filter(Boolean)
  }
  if (props.type === 'workExperience') {
    props.data.forEach((w: any) => {
      w.responsibilities = w.responsibilitiesStr
        ? w.responsibilitiesStr.split(',').map((r: string) => r.trim()).filter(Boolean)
        : []
      delete w.responsibilitiesStr
    })
  }
  emit('save', props.data)
}
</script>

<style scoped>
.input {
  @apply w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm;
}
.btn-orange {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded;
}
</style>
