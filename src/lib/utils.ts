export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleString('pt-BR')
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]
  return `${months[parseInt(m, 10) - 1]}/${year}`
}

export function formatMonthLabelFull(month: string): string {
  const [year, m] = month.split('-')
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${months[parseInt(m, 10) - 1]} ${year}`
}

export function prevMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  if (m === 1) return `${year - 1}-12`
  return `${year}-${String(m - 1).padStart(2, '0')}`
}

export function nextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  if (m === 12) return `${year + 1}-01`
  return `${year}-${String(m + 1).padStart(2, '0')}`
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

export function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return cnpj
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateCsv(
  headers: string[],
  rows: string[][],
  filename: string
): void {
  const BOM = '\uFEFF'
  const content = [
    headers.join(';'),
    ...rows.map((row) => row.join(';')),
  ].join('\n')

  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
