-- ─────────────────────────────────────────────────────────────────
-- CONNECTIVE TISSUE
-- Links a photographed receipt to an expense, and an existing vault
-- document to an appointment (e.g. "insurance card" attached to the
-- doctor visit it's for).
-- ─────────────────────────────────────────────────────────────────

alter table public.expenses add column if not exists receipt_document_id uuid
  references public.documents(id) on delete set null;

alter table public.appointments add column if not exists document_id uuid
  references public.documents(id) on delete set null;
