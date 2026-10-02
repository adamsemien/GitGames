/* ============================================================
   GitGames - public client configuration
   Every value here ships to the browser, so only public values belong
   here: a PostHog project key, a Loops form endpoint, a Stripe Payment
   Link, a booking page, the site URL. Never a secret key.
   Leave a value empty and the feature stays off: no script loads, no
   request is sent, no lock opens a checkout.
   UNLOCK_CODE_SHA256 is the hex SHA-256 of the Pro unlock code, never
   the code itself. Make one with:
     printf '%s' 'your-code' | shasum -a 256
   ============================================================ */
export const CONFIG = {
  POSTHOG_KEY: '',
  POSTHOG_HOST: '',
  LOOPS_FORM_URL: '',
  STRIPE_PAYMENT_LINK: '',
  UNLOCK_CODE_SHA256: '',
  TEAM_BOOKING_URL: '',
  SITE_URL: ''
};
