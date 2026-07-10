import { ref, onUnmounted } from 'vue'

// Fingerprint.WebApi es global, inyectado por fingerprint.sdk.min.js
declare const Fingerprint: any

export type FingerprintEvent =
  | { event: 'status';     message: string }
  | { event: 'progress';   stage: number; total: number }
  | { event: 'enrolled';   success: boolean; message: string }
  | { event: 'captured';   success: boolean; template?: string; message?: string }
  | { event: 'identified'; success: boolean; message: string; member?: any }
  | { event: 'error';      message: string }

type ActionMode = 'capture' | 'enroll' | 'identify' | null

export function useFingerprint() {
  const connected  = ref(false)
  const busy       = ref(false)
  const statusMsg  = ref('')
  const lastEvent  = ref<FingerprintEvent | null>(null)

  let sdk: any = null
  let resolveAction: ((e: FingerprintEvent) => void) | null = null
  let mode: ActionMode = null

  // Acumulador de muestras para enroll (necesita 4)
  let samples: string[] = []
  let enrollTarget: { memberId: number; apiUrl: string; token: string } | null = null
  let identifyCandidates: Array<{ id: string; template: string; member: any }> = []
  let identifyApiUrl = ''
  let identifyGymId: number | null = null

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function setStatus(message: string) {
    statusMsg.value = message
    lastEvent.value = { event: 'status', message }
  }

  function emitAndResolve(ev: FingerprintEvent) {
    lastEvent.value = ev
    busy.value = false
    mode = null
    samples = []
    sdk?.stopAcquisition()
    resolveAction?.(ev)
    resolveAction = null
  }

  // ─── Inicializar SDK ──────────────────────────────────────────────────────

  function createSdk() {
    if (sdk) return

    sdk = new Fingerprint.WebApi()

    sdk.onDeviceConnected = () => { connected.value = true }
    sdk.onDeviceDisconnected = () => { connected.value = false }

    sdk.onCommunicationFailed = () => {
      sdk = null
      connected.value = false
      emitAndResolve({ event: 'error', message: 'Error de comunicación con el lector. ¿Está DpHostW.exe corriendo?' })
    }

    sdk.onSamplesAcquired = async (evt: any) => {
      try {
        const parsed = JSON.parse(evt.samples)
        // Raw format: parsed[0].Data es base64url → decodificar a UTF8 → JSON con campos de imagen
        const outerB64  = Fingerprint.b64UrlTo64(parsed[0].Data)
        const innerJson = JSON.parse(Fingerprint.b64UrlToUtf8(outerB64))
        const sampleData: string = JSON.stringify({
          data:   Fingerprint.b64UrlTo64(innerJson.Data),
          width:  innerJson.Format.iWidth,
          height: innerJson.Format.iHeight,
          dpi:    innerJson.Format.iXdpi,
        })

        // ── CAPTURE (1 muestra) ──────────────────────────────────────────
        if (mode === 'capture') {
          emitAndResolve({ event: 'captured', success: true, template: sampleData })
          return
        }

        // ── ENROLL (acumular 4 muestras) ─────────────────────────────────
        if (mode === 'enroll') {
          samples.push(sampleData)
          const needed = 4 - samples.length

          if (needed > 0) {
            setStatus(`Muestra ${samples.length} de 4 — pon el dedo de nuevo`)
            lastEvent.value = { event: 'progress', stage: samples.length, total: 4 }
            return
          }

          // Tenemos 4 muestras — usamos la última como template final
          const template = samples[samples.length - 1]

          if (enrollTarget) {
            setStatus('Guardando huella...')
            const { memberId, apiUrl, token } = enrollTarget
            enrollTarget = null
            try {
              const resp = await fetch(`${apiUrl}/members/${memberId}/fingerprint`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                },
                body: JSON.stringify({ fingerprint_data: template }),
              })
              emitAndResolve(
                resp.ok
                  ? { event: 'enrolled', success: true,  message: 'Huella registrada correctamente' }
                  : { event: 'enrolled', success: false, message: 'Error al guardar la huella en el servidor' }
              )
            } catch {
              emitAndResolve({ event: 'enrolled', success: false, message: 'Error de conexión con el servidor' })
            }
          } else {
            // Modo captura-para-registro (sin memberId aún)
            emitAndResolve({ event: 'captured', success: true, template })
          }
          return
        }

        // ── IDENTIFY (matching local via servicio Python con dpfj.dll) ───
        if (mode === 'identify') {
          setStatus('Verificando...')
          try {
            // 1. Matching local usando dpfj.dll en la PC del gimnasio
            const matchResp = await fetch('http://127.0.0.1:3002/match', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sample: sampleData, candidates: identifyCandidates }),
            })
            const matchText = await matchResp.text()
            let matchData: any = null

            try {
              matchData = matchText ? JSON.parse(matchText) : null
            } catch {
              throw new Error('El servicio local de huellas devolvió una respuesta no válida')
            }

            if (!matchResp.ok || !matchData.member_id) {
              emitAndResolve({
                event: 'identified',
                success: false,
                message: matchData?.error || 'Huella no reconocida',
              })
              return
            }

            // 2. Registrar acceso en el backend
            const logResp = await fetch(`${identifyApiUrl}/access/fingerprint`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ gimnasio_id: identifyGymId, member_id: matchData.member_id }),
            })
            const logText = await logResp.text()
            const logData = logText ? JSON.parse(logText) : {}

            const member = identifyCandidates.find(c => String(c.id) === String(matchData.member_id))?.member
            emitAndResolve({
              event: 'identified',
              success: logData.success ?? false,
              message: logData.message ?? 'Acceso permitido',
              member: logData.member ?? member,
            })
          } catch (e: any) {
            const message = e.message === 'Failed to fetch'
              ? 'No se pudo conectar con el servicio local de huellas. Inicia fingerprint_service.py y verifica que dpfj.dll esté instalado.'
              : e.message ?? 'Error al identificar'

            emitAndResolve({ event: 'error', message })
          }
        }
      } catch (e: any) {
        emitAndResolve({ event: 'error', message: e.message ?? 'Error procesando muestra' })
      }
    }
  }

  function ensureSdk(): boolean {
    if (sdk) return true

    try {
      createSdk()
      return !!sdk
    } catch {
      return false
    }
  }

  async function startAcquisition(): Promise<boolean> {
    if (!ensureSdk()) return false
    await sdk.startAcquisition(Fingerprint.SampleFormat.Raw)
    return true
  }

  async function checkReader(): Promise<FingerprintEvent> {
    try {
      if (!ensureSdk()) {
        connected.value = false
        return {
          event: 'error',
          message: 'No se pudo iniciar el SDK de huella. Verifica DigitalPersona WebSDK.',
        }
      }
      const devices = await sdk.enumerateDevices()
      connected.value = Array.isArray(devices) && devices.length > 0

      return connected.value
        ? { event: 'status', message: 'Lector conectado' }
        : { event: 'error', message: 'No se detectó ningún lector conectado' }
    } catch (e: any) {
      connected.value = false
      return {
        event: 'error',
        message: e.message || 'No se pudo comunicar con el lector. Verifica DpHostW.exe',
      }
    }
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  function disconnect() {
    sdk?.stopAcquisition()
    sdk = null
    connected.value = false
  }

  async function capture(): Promise<FingerprintEvent> {
    if (!ensureSdk()) {
      return { event: 'error', message: 'No se pudo iniciar el SDK de huella. Verifica DigitalPersona WebSDK.' }
    }

    busy.value = true
    mode = 'capture'
    samples = []
    setStatus('Coloca tu dedo en el lector...')
    if (!(await startAcquisition())) {
      busy.value = false
      mode = null
      return { event: 'error', message: 'No se pudo conectar con el lector. Verifica DigitalPersona WebSDK.' }
    }
    return new Promise(resolve => { resolveAction = resolve })
  }

  async function enroll(memberId: number | null, apiUrl: string, token: string): Promise<FingerprintEvent> {
    if (!ensureSdk()) {
      return { event: 'error', message: 'No se pudo iniciar el SDK de huella. Verifica DigitalPersona WebSDK.' }
    }

    busy.value = true
    mode = 'enroll'
    samples = []
    enrollTarget = memberId ? { memberId, apiUrl, token } : null
    setStatus('Coloca tu dedo en el lector (4 veces)...')
    if (!(await startAcquisition())) {
      busy.value = false
      mode = null
      return { event: 'error', message: 'No se pudo conectar con el lector. Verifica DigitalPersona WebSDK.' }
    }
    return new Promise(resolve => { resolveAction = resolve })
  }

  async function identify(gimnasioId: number, apiUrl: string): Promise<FingerprintEvent> {
    if (!ensureSdk()) {
      return { event: 'error', message: 'No se pudo iniciar el SDK de huella. Verifica DigitalPersona WebSDK.' }
    }

    busy.value = true
    setStatus('Cargando base de datos de huellas...')

    try {
      let resp = await fetch(`${apiUrl}/kiosk/fingerprints/${gimnasioId}`, {
        headers: { 'Accept': 'application/json' },
      })

      if (resp.status === 404) {
        resp = await fetch(`${apiUrl}/access/fingerprints/${gimnasioId}`, {
          headers: { 'Accept': 'application/json' },
        })
      }

      const responseText = await resp.text()
      let payload: any = null

      try {
        payload = responseText ? JSON.parse(responseText) : null
      } catch {
        throw new Error('El servidor no devolvió JSON válido al cargar las huellas')
      }

      if (!resp.ok) {
        const serverMessage = payload?.message || payload?.error
        throw new Error(serverMessage || `Error ${resp.status} al cargar huellas`)
      }

      const membersData: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : []

      if (!membersData.length) {
        busy.value = false
        return { event: 'identified', success: false, message: 'No hay huellas registradas en esta empresa' }
      }

      identifyCandidates = membersData.map(m => ({ id: String(m.id), template: m.fingerprint_data, member: m }))
      identifyApiUrl = apiUrl
      identifyGymId = gimnasioId
    } catch (e: any) {
      busy.value = false
      return { event: 'error', message: e.message || 'No se pudo cargar la base de datos de huellas' }
    }

    mode = 'identify'
    samples = []
    setStatus('Coloca tu dedo en el lector...')
    if (!(await startAcquisition())) {
      busy.value = false
      mode = null
      return { event: 'error', message: 'No se pudo conectar con el lector. Verifica DigitalPersona WebSDK.' }
    }
    return new Promise(resolve => { resolveAction = resolve })
  }

  onUnmounted(disconnect)

  return { connected, busy, statusMsg, lastEvent, capture, enroll, identify, checkReader, disconnect }
}
