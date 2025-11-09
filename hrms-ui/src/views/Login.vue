<script setup lang="ts">
import { ref } from 'vue';
import { login } from '../services/authService';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    await login(username.value, password.value);
    router.push('/dashboard');
  } catch (err: any) {
    console.error('Login error:', err);
    error.value = 'Invalid credentials or Keycloak unavailable';
  }
};
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-800 p-8 rounded-xl shadow-xl w-96">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">Login to KADRify</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input
          v-model="username"
          placeholder="Username"
          class="w-full p-2 rounded border bg-gray-700 text-white"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full p-2 rounded border bg-gray-700 text-white"
        />
        <button
          type="submit"
          class="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
        >
          Login
        </button>
      </form>
      <p v-if="error" class="text-red-400 text-center mt-3">{{ error }}</p>
    </div>
  </div>
</template>
