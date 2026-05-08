<template>
  <div
    class="w-screen min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 bg-[url('/img/fondo_sin_letra.png')]"
  >
    <!-- Logo/Nombre del Gimnasio -->
    <div class="flex justify-center items-center mb-6">
      <h1 class="text-white text-4xl md:text-6xl font-extrabold tracking-wider animate-logo">
        {{ gimnasio.nombre || 'COSMOGYM' }}
      </h1>
    </div>

    <!-- Formulario -->
    <div class="flex justify-center items-center w-full">
      <div class="bg-[var(--color-surface)] shadow-lg rounded-2xl p-6 md:p-10 w-full max-w-lg border border-default-soft">

        <!-- Estado de éxito -->
        <div v-if="successMessage" class="text-center p-4 bg-green-100 text-green-700 rounded-lg">
          <CheckCircle2 class="w-12 h-12 mx-auto mb-2 text-green-600" aria-hidden="true" />
          <h2 class="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
          <p>{{ successMessage }}</p>
        </div>

        <!-- Estado de carga o formulario -->
        <div v-else>
          <h2 class="text-2xl font-bold mb-6 text-center text-default flex items-center justify-center gap-2">
            <UserPlus class="w-6 h-6" aria-hidden="true" />
            Formulario de Inscripción
          </h2>

          <div v-if="loading" class="text-center text-muted flex items-center justify-center gap-2">
            <Loader2 class="w-5 h-5 animate-spin" aria-hidden="true" />
            Cargando planes...
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <User class="w-3 h-3" aria-hidden="true" />
                  Nombre Completo
                </label>
                <input v-model="form.name" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <IdCard class="w-3 h-3" aria-hidden="true" />
                  Identificación (Cédula)
                </label>
                <input v-model="form.identification" type="text" class="input-field" required />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <Mail class="w-3 h-3" aria-hidden="true" />
                  Correo
                </label>
                <input v-model="form.email" type="email" class="input-field" required/>
              </div>
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <Phone class="w-3 h-3" aria-hidden="true" />
                  Teléfono
                </label>
                <input v-model="form.phone" type="tel" class="input-field" required/>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <Calendar class="w-3 h-3" aria-hidden="true" />
                  Fecha de Nacimiento
                </label>
                <input v-model="form.birth_date" type="date" class="input-field" required />
              </div>
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <Users class="w-3 h-3" aria-hidden="true" />
                  Sexo
                </label>
                <BaseSelect
                  v-model="form.sexo"
                  placeholder="Seleccione..."
                  :options="SEXO_OPTIONS"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <Scale class="w-3 h-3" aria-hidden="true" />
                  Peso (kg)
                </label>
                <input v-model.number="form.peso" type="number" step="0.1" class="input-field" placeholder="Ej. 70.5" />
              </div>
              <div>
                <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                  <Ruler class="w-3 h-3" aria-hidden="true" />
                  Estatura (m)
                </label>
                <input v-model.number="form.estatura" type="number" step="0.01" class="input-field" placeholder="Ej. 1.75" />
              </div>
            </div>

            <!-- CAMPO 'OBJETIVO' ELIMINADO -->

            <div>
              <label class="block text-muted text-sm mb-1 flex items-center gap-1">
                <CalendarCheck2 class="w-3 h-3" aria-hidden="true" />
                Plan de Membresía
              </label>
              <BaseSelect
                v-model="form.plan_id"
                placeholder="Seleccione el plan que desea"
                :options="
                  planes.map((plan) => ({
                    value: plan.id,
                    label: `${plan.membership_type.name} (${traducirFrecuencia(plan.frequency)}) - ${formatCurrency(plan.price)}`,
                  }))
                "
                required
              />
            </div>

            <div v-if="errorMessage" class="text-red-600 text-sm text-center flex items-center justify-center gap-1">
              <AlertCircle class="w-4 h-4" aria-hidden="true" />
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 inline-flex items-center justify-center gap-2"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" aria-hidden="true" />
              <UserPlus v-else class="w-4 h-4" aria-hidden="true" />
              <span>{{ loading ? 'Registrando...' : 'Inscribirme' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeScale {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-logo {
  animation: fadeScale 1.2s ease-out forwards;
  text-shadow: 0 2px 10px rgba(255, 0, 0, 0.4);
}
.input-field {
  @apply field-input;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios' // Usamos la instancia de Axios
import { BaseSelect } from '@/components/ui'
import {
  User,
  IdCard,
  Mail,
  Phone,
  Calendar,
  Users,
  Scale,
  Ruler,
  CalendarCheck2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
} from 'lucide-vue-next'

const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'no_binario', label: 'No binario' },
  { value: 'otro', label: 'Otro' },
  { value: 'preferir_no_decir', label: 'Prefiero no decir' },
]
import Swal from 'sweetalert2'
import { SWAL_COLORS } from '@/lib/colors'

// --- INICIO DE CORRECCIÓN DE TIPOS ---

// 1. Definir los tipos de datos que esperamos de la API
interface CompanyInfo {
  id: number;
  nombre: string;
}

interface MembershipType {
  id: number;
  name: string;
  description: string | null;
}

interface Plan {
  id: number;
  gym_id: number;
  membership_type_id: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  price: number;
  membership_type: MembershipType; // Objeto anidado
}

// 2. Aplicar los tipos a las variables reactivas
const route = useRoute()
const gimnasioId = ref(route.params.gimnasioId as string) // Especificar que es string

const gimnasio = ref<CompanyInfo>({ id: 0, nombre: '' }) // Aplicar tipo
const planes = ref<Plan[]>([]) // Aplicar tipo (Array de Plan)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

// 3. Quitar 'objetivo_entrenamiento' del formulario
const form = reactive({
  name: '',
  identification: '',
  email: '',
  phone: '',
  birth_date: '',
  sexo: '',
  peso: null as number | null, // Especificar tipo
  estatura: null as number | null, // Especificar tipo
  plan_id: '',
})

// --- FIN DE CORRECCIÓN DE TIPOS ---


// Cargar planes al montar
onMounted(async () => {
  if (!gimnasioId.value) {
    errorMessage.value = "ID del gimnasio no encontrado."
    loading.value = false
    return
  }
  try {
    // Definir el tipo de la respuesta esperada
    const { data } = await api.get<{ gimnasio: CompanyInfo, planes: Plan[] }>(`/public/plans/${gimnasioId.value}`)
    gimnasio.value = data.gimnasio
    planes.value = data.planes
  } catch (error) {
    console.error("Error al cargar planes:", error)
    errorMessage.value = "No se pudieron cargar los planes del gimnasio."
  } finally {
    loading.value = false
  }
})

// Enviar formulario
const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.post(`/public/register/${gimnasioId.value}`, form)

    // Mostrar mensaje de éxito
    successMessage.value = data.message

    Swal.fire({
      title: '¡Registro Exitoso!',
      text: data.message,
      icon: 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: SWAL_COLORS.primary,
    })

  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      // Manejar errores de validación
      const errors = error.response.data.errors
      if (errors.identification) {
        errorMessage.value = "La identificación ya está registrada."
      } else if (errors.email) {
        errorMessage.value = "El correo ya está registrado."
      } else {
        errorMessage.value = "Por favor, revise todos los campos."
      }
    } else {
      errorMessage.value = "Ocurrió un error inesperado. Intente de nuevo."
    }
    console.error("Error en el registro:", error)
  } finally {
    loading.value = false
  }
}

// Funciones de formato (TypeScript las entiende)
const traducirFrecuencia = (f: string) => {
  const map: { [key: string]: string } = {
    daily: 'Diario',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
  }
  return map[f] || f
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>
