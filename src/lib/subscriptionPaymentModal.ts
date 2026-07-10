import paymentQr from '@/assets/images/QR_pagos.jpeg'

export function expiredSubscriptionPaymentHtml() {
  return `
    <div style="max-width:320px;margin:0 auto;">
      <p style="font-size:0.82rem;line-height:1.25;margin:0 0 0.55rem;">
        Tu suscripción está vencida. Realiza el pago escaneando este QR y comunícate con soporte para reactivar el acceso.
      </p>
      <img
        src="${paymentQr}"
        alt="QR de pago"
        style="display:block;width:min(64vw,165px);height:auto;margin:0 auto;background:#fff;border:1px solid rgba(226,232,240,0.95);border-radius:0.9rem;box-shadow:0 8px 18px rgba(15,23,42,0.12);object-fit:contain;"
      />
    </div>
  `
}

export const expiredSubscriptionModalClass = 'subscription-payment-modal'
export const expiredSubscriptionModalWidth = 'min(92vw, 360px)'
