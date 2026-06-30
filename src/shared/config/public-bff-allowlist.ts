export const PUBLIC_BFF_ROUTE_DEFINITIONS: Array<{
  path: string;
  methods: ('GET' | 'POST' | 'PATCH' | 'DELETE')[];
}> = [
  { path: '/public/tenant', methods: ['GET'] },
  { path: '/public/services', methods: ['GET'] },
  { path: '/public/available-slots', methods: ['GET'] },
  { path: '/public/bookings/lock', methods: ['POST'] },
  { path: '/public/bookings/mine', methods: ['GET'] },
  { path: '/public/bookings/:id', methods: ['GET'] },
  { path: '/public/bookings/:id/pay', methods: ['POST'] },
  { path: '/public/bookings/:id/cancel', methods: ['POST'] },
  { path: '/public/bookings/:id/reschedule', methods: ['POST'] },
  { path: '/public/customer-auth/otp/send', methods: ['POST'] },
  { path: '/public/customer-auth/otp/verify', methods: ['POST'] },
  { path: '/public/customer-auth/me', methods: ['GET'] },
  { path: '/public/webhooks/qpay/simulate', methods: ['POST'] },
];
