#!/bin/bash

# Copy this file to setup-env.sh and fill in your actual values
# Then run: source setup-env.sh

# Database Configuration
export DATABASE_URL="postgresql://username:password@host:port/database"

# Auth Configuration
export AUTH_SECRET="your-auth-secret-here"

# Stripe Configuration
export STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
export STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# App Configuration
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

echo "Environment variables set successfully!"
echo "Make sure to add these to your .env.local file for permanent storage."

