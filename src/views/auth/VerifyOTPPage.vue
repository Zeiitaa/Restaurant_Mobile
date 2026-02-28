<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-bg">

        <div class="brand-header">
          <div class="brand-icon">
            <ion-icon name="restaurant" style="font-size:26px;color:#fff" />
          </div>
          <h1 class="brand-title">RestoKita</h1>
          <p class="brand-subtitle">Forgot Password Recovery</p>
        </div>

        <div class="card">
          <div class="card-head">
            <h2 class="card-title">Enter Verification Code</h2>
            <p class="card-subtitle">We've sent a 6-digit code to your email. Please enter it below.</p>
          </div>

          <form @submit.prevent="handleVerify">
            <div class="otp-row" @paste="handlePaste">
              <input
                v-for="(val, index) in otpValues"
                :key="index"
                ref="inputRefs"
                v-model="otpValues[index]"
                @input="handleInput(index, $event)"
                @keydown="handleKeydown(index, $event)"
                type="text"
                inputmode="numeric"
                maxlength="1"
                pattern="[0-9]*"
                class="otp-box"
              />
            </div>

            <ion-button expand="block" type="submit" :disabled="isVerifying" class="submit-btn">
              <ion-spinner v-if="isVerifying" name="crescent" />
              <span v-else>Verify & Proceed</span>
              <ion-icon v-if="!isVerifying" name="shield-checkmark" slot="end" />
            </ion-button>
          </form>

          <div class="resend-row">
            <span class="resend-label">Didn't receive the code?</span>
            <span
              :class="['resend-btn', { active: canResend }]"
              @click="handleResend"
            >
              Resend {{ !canResend ? formattedTimer : '' }}
            </span>
          </div>

          <div class="back-link" @click="goBackToLogin">
            <ion-icon name="arrow-back" />
            <span>Back to Login</span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IonPage, IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'

const auth = useAuthStore()
const toast = useToast()

const otpValues = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const isVerifying = ref(false)
const resendTimer = ref(59)
let timerInterval: ReturnType<typeof setInterval> | null = null

const formattedTimer = computed(() => {
  const m = Math.floor(resendTimer.value / 60)
  const s = (resendTimer.value % 60).toString().padStart(2, '0')
  return `(${m}:${s})`
})

const canResend = computed(() => resendTimer.value === 0)

onMounted(() => {
  startTimer()
  setTimeout(() => inputRefs.value[0]?.focus(), 300)
})

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const startTimer = () => {
  resendTimer.value = 59
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) resendTimer.value--
    else clearInterval(timerInterval!)
  }, 1000)
}

const handleInput = (index: number, event: Event) => {
  const val = (event.target as HTMLInputElement).value
  if (val.length > 0) otpValues.value[index] = val.slice(-1)
  if (val && index < 5) inputRefs.value[index + 1]?.focus()
}

const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpValues.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text/plain').trim() || ''
  if (/^\d+$/.test(pasted)) {
    const digits = pasted.slice(0, 6).split('')
    digits.forEach((d, i) => { otpValues.value[i] = d })
    inputRefs.value[Math.min(digits.length - 1, 5)]?.focus()
  }
}

async function handleVerify() {
  const finalOtp = otpValues.value.join('')
  if (finalOtp.length < 6) { toast.error('Please enter all 6 digits.'); return }
  isVerifying.value = true
  try {
    await auth.verifyOTP(auth.tempEmail!, finalOtp)
    toast.success('OTP Verified!')
    router.push('/reset-password')
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Error Verifying your OTP Code')
  } finally { isVerifying.value = false }
}

async function handleResend() {
  if (!canResend.value) return
  try { await auth.forgotPassword(auth.tempEmail!) }
  catch (e: any) { toast.error(e.response?.data?.detail || 'Error resending OTP') }
  finally { startTimer() }
}

const goBackToLogin = () => auth.logout()
</script>

<style scoped>
.auth-bg { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 24px 0; }
.brand-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
.brand-icon { width: 56px; height: 56px; background: var(--ion-color-primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.brand-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
.brand-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; }
.card { background: #fff; border-radius: 20px; padding: 28px 24px; box-shadow: 0 4px 32px rgba(0,0,0,.08); }
.card-head { margin-bottom: 24px; text-align: center; }
.card-title { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
.card-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.5; }
.otp-row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 28px; }
.otp-box { flex: 1; height: 56px; text-align: center; font-size: 20px; font-weight: 700; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; color: var(--ion-color-dark); transition: border-color .2s; }
.otp-box:focus { border-color: var(--ion-color-primary); background: #fff; }
.submit-btn { --border-radius: 12px; height: 52px; font-size: 15px; font-weight: 700; }
.resend-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; font-size: 13px; color: var(--ion-color-medium); }
.resend-btn { font-weight: 600; color: var(--ion-color-medium); }
.resend-btn.active { color: var(--ion-color-primary); cursor: pointer; }
.back-link { display: flex; align-items: center; gap: 6px; color: var(--ion-color-primary); font-weight: 600; font-size: 14px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; justify-content: center; cursor: pointer; }

@media (prefers-color-scheme: dark) {
  .card { background: #1e293b; }
  .otp-box { background: #0f172a; border-color: #334155; color: #f1f5f9; }
}
</style>
