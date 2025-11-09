<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white text-center px-6 overflow-x-hidden">
    <div class="max-w-4xl mt-20 animate-fadeIn">
      <img src="https://cdn-icons-png.flaticon.com/512/9420/9420212.png"
           alt="HR illustration"
           class="w-28 h-28 mx-auto mb-6 opacity-90" />
      <h1 class="text-5xl font-extrabold mb-4 tracking-tight">
        <span class="text-orange-500">KADR</span>ify
      </h1>
      <p class="text-xl mb-8">
        Simplify HR. Amplify People.
      </p>
      <p class="text-gray-300 mb-10 leading-relaxed">
        KADRify is a human-centered HR management platform that helps organizations streamline
        employee workflows — from onboarding and leave tracking to payroll and analytics —
        in one intuitive system. Focus less on paperwork and more on people.
      </p>

      <div class="space-x-4">
        <router-link
          to="/login"
          class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-orange-500/20">
          Login
        </router-link>
        <a
          href="#features"
          class="border border-gray-400 hover:bg-gray-700 px-8 py-3 rounded-lg transition font-semibold">
          Learn More
        </a>
      </div>
    </div>

    <section id="features" class="mt-32 grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="p-6 bg-gray-800/50 rounded-2xl shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-1 duration-300"
      >
        <img :src="feature.icon" alt="" class="w-12 h-12 mb-4 mx-auto opacity-80" />
        <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
        <p class="text-gray-400 text-sm leading-relaxed">{{ feature.text }}</p>
      </div>
    </section>

    <section class="mt-32 max-w-6xl text-center">
      <h2 class="text-3xl font-bold mb-10">How KADRify Works</h2>
      <div class="grid md:grid-cols-3 gap-10">
        <div class="p-6 bg-gray-800/40 rounded-xl hover:bg-gray-800 transition">
          <img src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png" class="w-16 h-16 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-3">1. Centralize</h3>
          <p class="text-gray-400 text-sm">
            Bring all employee data and HR processes into one secure, organized workspace.
          </p>
        </div>
        <div class="p-6 bg-gray-800/40 rounded-xl hover:bg-gray-800 transition">
          <img src="https://cdn-icons-png.flaticon.com/512/4253/4253268.png" class="w-16 h-16 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-3">2. Automate</h3>
          <p class="text-gray-400 text-sm">
            Automate repetitive HR tasks like leave approvals, attendance tracking, and payroll calculations.
          </p>
        </div>
        <div class="p-6 bg-gray-800/40 rounded-xl hover:bg-gray-800 transition">
          <img src="https://cdn-icons-png.flaticon.com/512/4151/4151456.png" class="w-16 h-16 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-3">3. Empower</h3>
          <p class="text-gray-400 text-sm">
            Empower managers and employees with transparency, analytics, and self-service access.
          </p>
        </div>
      </div>
    </section>

    <section class="mt-32 flex flex-col md:flex-row items-center justify-center max-w-6xl gap-12">
      <img
        src="https://cdn-icons-png.flaticon.com/512/7974/7974456.png"
        alt="Team illustration"
        class="w-72 h-72 md:w-96 md:h-96 object-contain"
      />
      <div class="text-left max-w-lg">
        <h2 class="text-3xl font-bold mb-4">Why Choose KADRify?</h2>
        <ul class="space-y-4 text-gray-300 leading-relaxed">
            <li><span class="text-orange-400">🧩</span> Centralized HR management with a simple, intuitive interface.</li>
            <li><span class="text-green-400">🔒</span> Secure, role-based access for all team members.</li>
            <li><span class="text-blue-400">📱</span> Responsive design that adapts to any device.</li>
            <li><span class="text-purple-400">🚀</span> Scalable to fit organizations of any size or structure.</li>
            <li><span class="text-yellow-400">📊</span> Real-time insights to support smart, people-focused decisions.</li>
        </ul>
      </div>
    </section>

    <section class="mt-32 text-center max-w-5xl">
      <h2 class="text-3xl font-bold mb-6">Our Mission</h2>
      <p class="text-gray-300 text-lg leading-relaxed">
        At KADRify, our mission is to help companies create a workplace where people thrive.
        We believe HR should be effortless, transparent, and human-centered — where technology
        supports collaboration, not complexity. With KADRify, teams spend less time managing data
        and more time growing together.
      </p>
    </section>

    <section class="mt-32 mb-20 bg-orange-500 text-white py-12 px-6 rounded-2xl shadow-lg text-center max-w-5xl">
      <h2 class="text-3xl font-bold mb-4">Ready to Empower Your Team?</h2>
      <p class="mb-8 text-lg text-orange-100">
        Start transforming your HR processes today with KADRify — simple, secure, and designed for people.
      </p>
      <router-link
        to="/login"
        class="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-100 transition">
        Get Started
      </router-link>
    </section>

    <footer class="mt-auto py-6 text-sm text-gray-500 border-t border-gray-700 w-full text-center">
      © 2025 <span class="text-orange-400 font-semibold">KADRify</span>. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    title: "Employee Management",
    text: "Manage employee profiles, positions, and departments all in one place.",
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    title: "Leave Tracking",
    text: "Simplify leave requests and approvals with automated notifications and calendars.",
    icon: "https://cdn-icons-png.flaticon.com/512/4521/4521314.png",
  },
  {
    title: "Payroll Automation",
    text: "Ensure accurate, on-time payments with streamlined payroll processing.",
    icon: "https://cdn-icons-png.flaticon.com/512/4470/4470499.png",
  },
  {
    title: "Timesheet Control",
    text: "Monitor attendance, working hours, and overtime easily and transparently.",
    icon: "https://cdn-icons-png.flaticon.com/512/4371/4371973.png",
  },
  {
    title: "Analytics Dashboard",
    text: "Visualize team performance and trends through interactive HR dashboards.",
    icon: "https://cdn-icons-png.flaticon.com/512/747/747376.png",
  },
  {
    title: "Secure Access",
    text: "Protect sensitive data with advanced security and role-based permissions.",
    icon: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
  },
];
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 1s ease-out;
}
</style>
