import type { DocType, PaymentMethod, ItemCategory } from './types'

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  nfse_emitida: 'NFS-e Emitida',
  boleto: 'Boleto',
  comprovante_pgto: 'Comprovante de Pagamento',
  comprovante_bancario: 'Comprovante Bancário',
  guia_tributaria: 'Guia Tributária',
  espelho_das: 'Espelho DAS',
  danfe: 'DANFE',
  recibo: 'Recibo',
  outro: 'Outro',
}

export const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = Object.entries(
  DOC_TYPE_LABELS
).map(([value, label]) => ({ value: value as DocType, label }))

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
}

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = Object.entries(
  PAYMENT_METHOD_LABELS
).map(([value, label]) => ({ value: value as PaymentMethod, label }))

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  medicamento: 'Medicamento',
  controlado: 'Controlado',
  alta_vigilancia: 'Alta Vigilância',
  material: 'Material',
  insumo: 'Insumo',
}

export const PARTNERS = ['Sarah', 'Lorena', 'Artur'] as const

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const

export function isControlled(category: ItemCategory): boolean {
  return category === 'controlado' || category === 'alta_vigilancia'
}

export function isHighVigilance(category: ItemCategory): boolean {
  return category === 'alta_vigilancia'
}
