import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Login",
      component: () => import("@/views/Login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/Register.vue"),
    },
    // --- RUTA PÚBLICA (QR) AÑADIDA ---
    // Esta ruta toma el ID del gimnasio desde la URL
    {
      path: "/public-register/:gimnasioId",
      name: "PublicRegister",
      component: () => import("@/views/PublicRegister.vue"),
      // Sin meta: { requiresAuth: true } para que sea pública
    },
    // --- FIN DE RUTA AÑADIDA ---
    {
      path: "/members",
      name: "Members",
      component: () => import("@/views/Members.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/menu",
      name: "Menu",
      component: () => import("@/views/Menu.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/members/:id",
      name: "MemberDetail",
      component: () => import("@/views/MemberDetail.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/RegisterMember",
      name: "RegisterMember",
      component: () => import("@/views/RegisterMember.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/Payments",
      name: "Payments",
      component: () => import("@/views/Payments.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/MembershipPlans",
      name: "MembershipPlans",
      component: () => import("@/views/MembershipPlans.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/Membership",
      name: "Membership",
      component: () => import("@/views/Membership.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/Sidebar",
      name: "Sidebar",
      component: () => import("@/views/Sidebar.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/CashBox",
      name: "CashBox",
      component: () => import("@/views/CashBox.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/MemberEdit/:id/edit",
      name: "MemberEdit",
      component: () => import("@/views/MemberEdit.vue"),
      meta: { requiresAuth: true },
      props: true,
    },

    {
      path: "/Products",
      name: "Products",
      component: () => import("@/views/Products.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/statistics",
      name: "Statistics",
      component: () => import("@/views/Statistics.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/POS",
      name: "POS",
      component: () => import("@/views/POS.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/inventory-log",
      name: "InventoryLog",
      component: () => import("@/views/InventoryLog.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/access-logs",
      name: "AccessLogs",
      component: () => import("@/views/AccessLogs.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/kiosko",
      name: "FingerprintKiosk",
      component: () => import("@/views/FingerprintKiosk.vue"),
      // Sin requiresAuth — el kiosco corre sin sesión de admin
    },

    {
      path: "/configuracion",
      redirect: "/configuration",
    },
    {
      path: "/configuration",
      name: "Configuration",
      component: () => import("@/views/Configuration.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/subscription",
      name: "Subscription",
      component: () => import("@/views/Subscription.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Guardia global de autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
