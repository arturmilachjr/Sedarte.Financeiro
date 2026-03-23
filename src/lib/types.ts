export interface User {
  id: string
  name: string
  email: string
  cpf: string
  role: 'master' | 'admin' | 'user'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AccessRequest {
  id: string
  name: string
  email: string
  cpf: string
  status: 'pending' | 'approved' | 'rejected'
  decided_by: string | null
  decided_at: string | null
  created_at: string
}

export type ItemCategory = 'medicamento' | 'controlado' | 'alta_vigilancia' | 'material' | 'insumo'

export interface Item {
  id: string
  name: string
  category: ItemCategory
  unit: string
  concentration: string | null
  portaria344_class: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  supplier: string
  supplier_cnpj: string | null
  purchase_date: string
  total_value: number
  image_url: string | null
  notes: string | null
  is_financial: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_id: string
  lot_id: string | null
  batch: string
  manufacturer: string | null
  manufacturing_date: string | null
  expiration_date: string | null
  quantity: number
  unit_price: number | null
  created_by: string | null
  created_at: string
  item?: Item
}

export interface Lot {
  id: string
  item_id: string
  batch: string
  manufacturer: string | null
  manufacturing_date: string | null
  expiration_date: string | null
  expected_qty: number
  counted_qty: number | null
  invoice_id: string | null
  notes: string | null
  counted_by: string | null
  counted_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  item?: Item
  invoice?: Invoice
}

export interface ActivityLog {
  id: string
  user_id: string | null
  user_name: string | null
  user_email: string | null
  action: string
  entity: string
  entity_id: string | null
  description: string | null
  created_at: string
}

export type DocType =
  | 'nfse_emitida'
  | 'boleto'
  | 'comprovante_pgto'
  | 'comprovante_bancario'
  | 'guia_tributaria'
  | 'espelho_das'
  | 'danfe'
  | 'recibo'
  | 'outro'

export type Direction = 'entrada' | 'saida'

export type PaymentMethod = 'pix' | 'boleto' | 'transferencia' | 'dinheiro' | 'cartao'

export interface FinancialDoc {
  id: string
  doc_type: DocType
  direction: Direction
  description: string
  supplier_client: string | null
  cnpj: string | null
  value: number | null
  payment_method: PaymentMethod | null
  reference_month: string
  doc_date: string | null
  partner_responsible: string | null
  fixed_expense_id: string | null
  file_url: string | null
  status: 'ok' | 'pendente' | 'descartado'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  fixed_expense?: FixedExpense
}

export interface FixedExpense {
  id: string
  description: string
  value: number
  due_day: number | null
  is_regulatory: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PartnerShare {
  id: string
  partner_name: string
  share_pct: number
  effective_from: string
  created_by: string | null
  created_at: string
}

export interface FinancialSummaryItem {
  direction: Direction
  doc_type: string
  supplier_client: string | null
  value: number
  doc_date: string | null
  source_id: string
  source_table: 'invoice' | 'financial_doc'
  description?: string
  partner_responsible?: string | null
  fixed_expense_id?: string | null
  is_regulatory?: boolean
  payment_method?: string | null
}
