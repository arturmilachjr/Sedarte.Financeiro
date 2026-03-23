-- Sedarte Gestão — Schema completo
-- Execute este SQL no Supabase SQL Editor caso as tabelas não existam

-- Usuários e acesso
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Catálogo de itens
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'medicamento',
  unit TEXT NOT NULL DEFAULT 'un',
  concentration TEXT,
  portaria344_class TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notas fiscais de compra
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  supplier_cnpj TEXT,
  purchase_date DATE,
  total_value NUMERIC(12,2),
  image_url TEXT,
  notes TEXT,
  is_financial BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lotes no estoque
CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  batch TEXT NOT NULL,
  manufacturer TEXT,
  manufacturing_date DATE,
  expiration_date DATE,
  expected_qty INTEGER NOT NULL DEFAULT 0,
  counted_qty INTEGER,
  invoice_id UUID REFERENCES invoices(id),
  notes TEXT,
  counted_by UUID REFERENCES users(id),
  counted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itens de cada NF
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  item_id UUID NOT NULL REFERENCES items(id),
  lot_id UUID REFERENCES lots(id),
  batch TEXT NOT NULL,
  manufacturer TEXT,
  manufacturing_date DATE,
  expiration_date DATE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Log de auditoria (imutável)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Despesas fixas mensais recorrentes
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL,
  due_day INTEGER,
  is_regulatory BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documentos financeiros
CREATE TABLE IF NOT EXISTS financial_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  description TEXT NOT NULL,
  supplier_client TEXT,
  cnpj TEXT,
  value NUMERIC(12,2),
  payment_method TEXT,
  reference_month TEXT NOT NULL,
  doc_date DATE,
  partner_responsible TEXT,
  fixed_expense_id UUID REFERENCES fixed_expenses(id),
  file_url TEXT,
  status TEXT DEFAULT 'ok',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rateio entre sócios
CREATE TABLE IF NOT EXISTS partner_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  share_pct NUMERIC(5,2) NOT NULL,
  effective_from TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar campo is_financial à tabela invoices se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'is_financial'
  ) THEN
    ALTER TABLE invoices ADD COLUMN is_financial BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_docs_month ON financial_docs(reference_month);
CREATE INDEX IF NOT EXISTS idx_financial_docs_status ON financial_docs(status);
CREATE INDEX IF NOT EXISTS idx_lots_item_id ON lots(item_id);
CREATE INDEX IF NOT EXISTS idx_lots_invoice_id ON lots(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity, entity_id);

-- RLS (Row Level Security) - ativar para todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_shares ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: usuários autenticados podem ler/escrever
-- Em produção, refinar para roles específicos

CREATE POLICY IF NOT EXISTS "Authenticated users can read all" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can read all" ON access_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can insert access_requests" ON access_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON items FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON invoices FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON invoice_items FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON lots FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can read" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON fixed_expenses FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON financial_docs FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users full access" ON partner_shares FOR ALL TO authenticated USING (true);
