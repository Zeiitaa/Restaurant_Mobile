import { defineStore } from 'pinia'
import api from '@/helpers/api'
import { useToast } from 'vue-toastification'
import router from '@/router'

const toast = useToast()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null as string | null,
    profile: JSON.parse(localStorage.getItem('profile') || 'null') as any | null,
    tempEmail: localStorage.getItem('tempEmail') || null as string | null,
    token_reset: localStorage.getItem('token_reset') || null as string | null
  }),

  actions: {
    async fetchAuth(usn: string, pw: string) {
      try {
        const data = new FormData()
        data.set('grant_type', 'password')
        data.set('username', usn)
        data.set('password', pw)
        data.set('scope', '')

        const FAuth = await api.post('/auth/login', data, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })

        this.token = FAuth.data.access_token
        localStorage.setItem('token', this.token!)
        return FAuth
      } catch (error: any) {
        this.token = null
        localStorage.removeItem('token')
        toast.error(error.response?.data?.detail || 'Login Failed')
        throw error
      }
    },

    async fetchProfile() {
      try {
        const UProfile = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.profile = UProfile.data
        localStorage.setItem('profile', JSON.stringify(UProfile.data))
        return UProfile
      } catch (error: any) {
        this.profile = null
        localStorage.removeItem('profile')
        throw error
      }
    },

    async register(usn: string, email: string, pw: string, cpw: string) {
      try {
        await api.post('/auth/register', {
          username: usn,
          password: pw,
          email: email,
          confirm_password: cpw
        })
        await this.fetchAuth(usn, pw)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Error Registering your account')
        throw error
      }
    },

    async registerDetail(name: string, phone: string, address: string) {
      try {
        await api.post('/auth/register-detail', {
          name,
          phone_number: phone,
          address
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        toast.success('Account registered successfully!')
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Error Registering your account details')
        throw error
      }
    },

    async forgotPassword(email: string) {
      try {
        await api.post('/auth/forgot-password', { email })
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Error Handling your request')
        throw error
      }
    },

    async verifyOTP(email: string, otp: string) {
      try {
        const res = await api.post('/auth/verify-otp', { email, otp_code: otp })
        this.token_reset = res.data.reset_token
        localStorage.setItem('token_reset', this.token_reset!)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Error Verifying OTP')
        throw error
      }
    },

    async resetPassword(reset_token: string, new_password: string) {
      try {
        await api.post('/auth/reset-password', { reset_token, new_password })
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Error Resetting Password')
        throw error
      }
    },

    async logout() {
      this.token = null
      this.profile = null
      this.tempEmail = null
      this.token_reset = null
      localStorage.removeItem('token')
      localStorage.removeItem('profile')
      localStorage.removeItem('token_reset')
      router.push('/')
    }
  },

  getters: {
    isWaiters: (state) => state.profile?.role === 'waiters',
    isCustomer: (state) => state.profile?.role === 'customer',
    isAdmin: (state) => state.profile?.role === 'admin'
  }
})
