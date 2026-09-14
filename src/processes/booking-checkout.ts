/**
 * Booking checkout composition (OTP → deposit watch).
 * `processes/` is the app composition root — not React UI.
 */
export {
  resolveOtpDevHint,
  sendBookingOtpUseCase,
  shouldSkipBookingOtpUseCase,
  verifyBookingOtpUseCase,
} from '@/features/booking-wizard/model/otp-use-case';
export {
  simulateQpayPaymentUseCase,
  startDepositPaymentUseCase,
  watchDepositConfirmationUseCase,
} from '@/features/booking-wizard/model/payment-use-cases';
