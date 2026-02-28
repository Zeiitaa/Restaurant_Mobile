<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon name="log-out-outline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="ion-padding">
        <p class="admin-subtitle">Admin Panel</p>
        <h1 class="admin-title">Daily Operations</h1>
        <p class="admin-date">{{ todayDate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row ion-padding-horizontal">
        <ion-card class="stat-card stat-card--blue">
          <ion-card-content>
            <ion-icon name="cash" class="stat-icon stat-icon--blue" />
            <p class="stat-label stat-label--blue">Monthly Sales</p>
            <div v-if="statsLoading" class="skeleton-text skeleton-text--blue"></div>
            <p v-else class="stat-value">{{ formatIDR(monthlySales?.total_revenue) }}</p>
            <p class="stat-sub">{{ monthlySales?.total_orders ?? 0 }} orders</p>
          </ion-card-content>
        </ion-card>

        <ion-card class="stat-card stat-card--amber">
          <ion-card-content>
            <ion-icon name="alert-circle" class="stat-icon stat-icon--amber" />
            <p class="stat-label stat-label--amber">Low Stock</p>
            <p class="stat-value stat-value--dark">{{ lowStockCount }}</p>
            <p class="stat-sub">items to restock</p>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Quick Nav Buttons -->
      <div class="ion-padding">
        <h3 class="section-title">Quick Actions</h3>
        <ion-list class="nav-list" lines="none">
          <ion-item button :detail="true" @click="$router.push('/admin/manage-menu')">
            <ion-icon name="restaurant" slot="start" color="primary" />
            <ion-label>Manage Menu</ion-label>
            <ion-badge slot="end" color="warning">{{ lowStockCount }} low</ion-badge>
          </ion-item>
          <ion-item button :detail="true" @click="$router.push('/admin/manage-table')">
            <ion-icon name="grid" slot="start" color="success" />
            <ion-label>Manage Tables</ion-label>
          </ion-item>
          <ion-item button :detail="true" @click="$router.push('/admin/manage-category')">
            <ion-icon name="pricetag" slot="start" color="tertiary" />
            <ion-label>Manage Categories</ion-label>
          </ion-item>
          <ion-item button :detail="true" @click="$router.push('/admin/manage-staff')">
            <ion-icon name="people" slot="start" color="secondary" />
            <ion-label>Manage Staff</ion-label>
          </ion-item>
          <ion-item button :detail="true" @click="$router.push('/admin/order-history')">
            <ion-icon name="receipt" slot="start" color="warning" />
            <ion-label>Order History</ion-label>
          </ion-item>
          <ion-item button :detail="true" @click="$router.push('/admin/stock-history')">
            <ion-icon name="bar-chart" slot="start" color="danger" />
            <ion-label>Stock History</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Top Menus -->
      <div class="ion-padding" v-if="topMenus.length">
        <h3 class="section-title">Top Selling Menus</h3>
        <ion-card class="top-menus-card">
          <ion-list lines="full">
            <ion-item v-for="(item, i) in topMenus.slice(0, 5)" :key="i">
              <ion-badge slot="start" :color="i === 0 ? 'warning' : (i === 1 ? 'medium' : 'light')" class="rank-badge">
                {{ i + 1 }}
              </ion-badge>
              <ion-label>
                <h3>{{ item.name }}</h3>
                <p>{{ item.total_sold }} sold</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonCard, IonCardContent, IonList, IonItem, IonLabel, IonBadge, IonRefresher, IonRefresherContent,
  alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import api from '@/helpers/api'
import router from '@/router'

const auth = useAuthStore()
const menuStore = useMenuStore()

const todayDate = new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })
const statsLoading = ref(true)
const monthlySales = ref<any>(null)
const topMenus = ref<any[]>([])

const lowStockCount = computed(() =>
  (menuStore.menu ?? []).filter((i: any) => i.daily_portion <= 5 || i.status === 'outOfStock').length
)

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val ?? 0)

const loadData = async () => {
  statsLoading.value = true
  const headers = { Authorization: `Bearer ${auth.token}` }
  try {
    const [salesRes, topRes] = await Promise.all([
      api.get('/orders/stats/monthly', { headers }),
      api.get('/orders/stats/top-menus', { headers }),
    ])
    monthlySales.value = salesRes.data
    topMenus.value = topRes.data
  } catch (e) { console.error(e) }
  finally { statsLoading.value = false }
  try { await menuStore.fetchMenu() } catch (e) { console.error(e) }
}

onMounted(loadData)

const doRefresh = async (event: any) => {
  await loadData()
  event.target.complete()
}

const logout = async () => {
  const alert = await alertController.create({
    header: 'Logout',
    message: 'Are you sure you want to logout?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Logout', handler: () => { auth.logout(); router.push('/') } }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.admin-subtitle { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ion-color-primary); margin: 0; }
.admin-title { font-size: 26px; font-weight: 900; margin: 4px 0 2px; color: var(--ion-color-dark); }
.admin-date { font-size: 13px; color: var(--ion-color-medium); margin: 0; }

.stats-row { display: flex; gap: 12px; margin-bottom: 4px; }
.stat-card {
  flex: 1;
  border-radius: 16px;
  margin: 0;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
}
.stat-card--blue { border-left: 4px solid var(--ion-color-primary); }
.stat-card--amber { border-left: 4px solid #f59e0b; }

.stat-icon { font-size: 24px; opacity: .85; }
.stat-icon--blue { color: var(--ion-color-primary); }
.stat-icon--amber { color: #d97706; }

.stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; margin: 3px 0 2px; }
.stat-label--blue { color: var(--ion-color-primary); }
.stat-label--amber { color: #d97706; }

.stat-value { font-size: 17px; font-weight: 900; color: var(--ion-color-dark); margin: 0; }
.stat-value--dark { color: var(--ion-color-dark); }
.stat-sub { font-size: 11px; color: var(--ion-color-medium); margin: 2px 0 0; }

.skeleton-text { height: 20px; width: 80px; border-radius: 6px; }
.skeleton-text--blue { background: rgba(61,156,245,.2); }

.section-title { font-size: 15px; font-weight: 800; margin: 0 0 10px; color: var(--ion-color-dark); }
.nav-list { border-radius: 14px; overflow: hidden; background: transparent; }
.top-menus-card { border-radius: 14px; margin: 0; }
.rank-badge { min-width: 28px; text-align: center; }

@media (prefers-color-scheme: dark) {
  .stat-card { background: #1e293b; }
  .admin-title { color: #f1f5f9; }
  .stat-value { color: #f1f5f9; }
}
</style>
