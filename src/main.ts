import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Dark Mode */
import '@ionic/vue/css/palettes/dark.system.css'

/* Theme variables */
import './theme/variables.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router)
  .use(Toast, {
    position: POSITION.TOP_CENTER,
    timeout: 3000
  })

router.isReady().then(() => {
  app.mount('#app')
})
