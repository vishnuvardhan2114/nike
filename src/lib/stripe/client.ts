import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  // Provide a fallback for development
  process.env.STRIPE_SECRET_KEY = 'sk_test_51Qw1VoLT1DmN91lMF09ARUelBm7KwNuQrycPrBIrebEHD49POzWzQWFJtoGM5zzPqMLFxi77MoZ13XMve41DzqUZ00WYYgLZg0';
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripePaymentIntent = Stripe.PaymentIntent;
