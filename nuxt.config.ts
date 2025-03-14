// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/ionic'],
  
  ionic: {
    integrations: {
      
    },
    css: {
      
    },
    config: {
      
    }
  },
  
  ssr: false,
  css: ['@/assets/sass/global.scss'],


  app: {
    head: {
      title: 'Attachi 🧠',
    }
  },

  // this is needed to prevent vite from crashing
  // on undefined window object
  vite: {
    define: { global: 'window' },
    },
})
