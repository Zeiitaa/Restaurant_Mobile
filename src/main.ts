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

/* Ionicons — register all icons used across the app */
import { addIcons } from 'ionicons'
import {
  restaurant, logOutOutline, addCircle, flame, wallet, person,
  cash, alertCircle, grid, pricetag, people, receipt, barChart,
  add, createOutline, addCircleOutline, trashOutline, restaurantOutline,
  pricetagOutline, wine, iceCream, pizza, gridOutline, peopleOutline,
  receiptOutline, barChartOutline, personOutline, lockClosedOutline,
  eyeOffOutline, eyeOutline, arrowForward, mailOutline, arrowBack,
  shieldCheckmarkOutline, callOutline, locationOutline, shieldCheckmark,
  alertCircleOutline, checkmarkCircleOutline, checkmarkDone,
  cart, searchOutline, close, remove,
  checkmarkDoneCircle, checkmarkCircle, card, qrCode
} from 'ionicons/icons'

addIcons({
  restaurant,
  'log-out-outline': logOutOutline,
  'add-circle': addCircle,
  flame,
  wallet,
  person,
  cash,
  'alert-circle': alertCircle,
  grid,
  pricetag,
  people,
  receipt,
  'bar-chart': barChart,
  add,
  'create-outline': createOutline,
  'add-circle-outline': addCircleOutline,
  'trash-outline': trashOutline,
  'restaurant-outline': restaurantOutline,
  'pricetag-outline': pricetagOutline,
  wine,
  'ice-cream': iceCream,
  pizza,
  'grid-outline': gridOutline,
  'people-outline': peopleOutline,
  'receipt-outline': receiptOutline,
  'bar-chart-outline': barChartOutline,
  'person-outline': personOutline,
  'lock-closed-outline': lockClosedOutline,
  'eye-off-outline': eyeOffOutline,
  'eye-outline': eyeOutline,
  'arrow-forward': arrowForward,
  'mail-outline': mailOutline,
  'arrow-back': arrowBack,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'call-outline': callOutline,
  'location-outline': locationOutline,
  'shield-checkmark': shieldCheckmark,
  'alert-circle-outline': alertCircleOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'checkmark-done': checkmarkDone,
  cart,
  'search-outline': searchOutline,
  close,
  remove,
  'checkmark-done-circle': checkmarkDoneCircle,
  'checkmark-circle': checkmarkCircle,
  card,
  'qr-code': qrCode,
})

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
