-- Extend consultations with payment metadata for Paystack (and others)
alter table public.consultations
  add column if not exists payment_reference text,
  add column if not exists payment_provider text,
  add column if not exists payment_amount_kobo bigint,
  add column if not exists payment_currency text,
  add column if not exists payment_verified_at timestamptz;

create index if not exists consultations_payment_reference_idx on public.consultations (payment_reference);
