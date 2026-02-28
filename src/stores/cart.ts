import { defineStore } from 'pinia'
import api from '@/helpers/api'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]') as any[]
  }),

  getters: {
    subtotal: (state) =>
      state.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
    tax(): number {
      return (this as any).subtotal * 0.1
    },
    total(): number {
      return (this as any).subtotal + (this as any).tax
    },
    cartCount: (state) =>
      state.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
  },

  actions: {
    async placeOrder(tableId: number, staffId: number, guestName: string, discount: number) {
      const orderData = {
        table_id: tableId,
        staff_id: staffId,
        guest_name: guestName,
        items: this.items.map((item: any) => ({
          menu_id: item.id,
          quantity: item.quantity,
          notes: item.notes || '',
          order_type: item.orderType === 'dine-in' ? 'dinein' : 'takeaway'
        })),
        discount
      }
      try {
        const response = await api.post('/orders/', orderData)
        if (response.data) {
          this.clearCart()
          return response.data
        }
      } catch (error) {
        throw error
      }
    },

    addToCart(data: { item: any; quantity: number; type?: string; notes?: string }) {
      const { item, quantity, type, notes } = data
      const existingItem = this.items.find(
        (i: any) =>
          i.id === item.id &&
          i.orderType === (type || 'dine-in') &&
          i.notes === (notes || '')
      )
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          ...item,
          quantity,
          orderType: type || 'dine-in',
          notes: notes || ''
        })
      }
      this.saveToLocalStorage()
    },

    updateQuantity(index: number, change: number) {
      const item = this.items[index]
      if (item) {
        item.quantity += change
        if (item.quantity <= 0) this.items.splice(index, 1)
      }
      this.saveToLocalStorage()
    },

    removeFromCart(index: number) {
      this.items.splice(index, 1)
      this.saveToLocalStorage()
    },

    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    }
  }
})
