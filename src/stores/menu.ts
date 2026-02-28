import { defineStore } from 'pinia'
import api from '@/helpers/api'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menu: JSON.parse(localStorage.getItem('menu') || 'null') as any[] | null,
    menuAvailable: JSON.parse(localStorage.getItem('menuAvailable') || 'null') as any[] | null
  }),

  actions: {
    async fetchMenu() {
      try {
        const res = await api.get('/menu/')
        this.menu = res.data
        localStorage.setItem('menu', JSON.stringify(res.data))
      } catch (error) {
        throw error
      }
    },

    async fetchMenuById(id: number) {
      try {
        const res = await api.get(`/menu/${id}`)
        return res.data
      } catch (error) {
        throw error
      }
    },

    async fetchMenuAvailable() {
      try {
        const res = await api.get('/menu/available')
        this.menuAvailable = res.data
        localStorage.setItem('menuAvailable', JSON.stringify(res.data))
      } catch (error) {
        throw error
      }
    }
  }
})
