import { defineStore } from 'pinia'
import api from '@/helpers/api'
import { useAuthStore } from './auth'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    category: JSON.parse(localStorage.getItem('category') || 'null') as any[] | null
  }),

  actions: {
    async fetchCategory() {
      try {
        const res = await api.get('/category/')
        this.category = res.data
        localStorage.setItem('category', JSON.stringify(res.data))
      } catch (error) {
        throw error
      }
    },

    async fetchCategoryById(id: number) {
      try {
        const res = await api.get(`/category/${id}`)
        return res.data
      } catch (error) {
        throw error
      }
    },

    async createCategory(name: string) {
      const auth = useAuthStore()
      try {
        await api.post('/category/', { name }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      } catch (error) {
        throw error
      }
    },

    async updateCategory(id: number, name: string) {
      const auth = useAuthStore()
      try {
        await api.patch(`/category/${id}`, { name }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      } catch (error) {
        throw error
      }
    }
  }
})
