import { defineStore } from 'pinia'
import api from '@/helpers/api'
import { useAuthStore } from './auth'

export const useTableStore = defineStore('table', {
  state: () => ({
    table: JSON.parse(localStorage.getItem('table') || 'null') as any[] | null,
    tableAvailable: JSON.parse(localStorage.getItem('tableAvailable') || '[]') as any[]
  }),

  actions: {
    async fetchTable() {
      try {
        const res = await api.get('/table/')
        this.table = res.data
        localStorage.setItem('table', JSON.stringify(res.data))
      } catch (error) {
        throw error
      }
    },

    async fetchTableAvailable() {
      try {
        const res = await api.get('/table/available')
        this.tableAvailable = res.data
        localStorage.setItem('tableAvailable', JSON.stringify(res.data))
      } catch (error) {
        console.error(error)
      }
    },

    async fetchTableById(code: string) {
      try {
        const res = await api.get(`/table/${code}`)
        return res.data
      } catch (error) {
        throw error
      }
    },

    async updateTable(code: string) {
      try {
        await api.patch(`/table/${code}`)
      } catch (error) {
        throw error
      }
    },

    async createTable(code: string, status: string, capacity: number) {
      const auth = useAuthStore()
      try {
        await api.post('/table/', { table_code: code, status, capacity }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      } catch (error) {
        throw error
      }
    }
  }
})
