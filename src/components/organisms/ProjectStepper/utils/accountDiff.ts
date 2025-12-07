type AnyAccount = Record<string, any>

const normalizeDate = (date: any) => {
  if (!date) return ''

  // Handle Dayjs, Date, string inputs
  if (typeof date?.format === 'function') {
    return date.format('YYYY-MM-DD')
  }

  const parsed = new Date(date)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return String(date)
}

const normalizeAccount = (account: AnyAccount) => {
  return {
    id: account.id ?? null,
    accountType: String(account.accountType ?? account.type ?? '').trim(),
    accountNumber: String(
      account.accountNumber ?? account.trustAccountNumber ?? ''
    ).trim(),
    ibanNumber: String(account.ibanNumber ?? '').trim(),
    accountTitle: String(account.accountTitle ?? account.accountName ?? '').trim(),
    currencyCode: String(account.currencyCode ?? account.currency ?? '').trim(),
    dateOpened: normalizeDate(account.dateOpened),
  }
}

const makeKey = (normalized: ReturnType<typeof normalizeAccount>) => {
  return `type:${normalized.accountType}#num:${normalized.accountNumber}`
}

export function getChangedAccounts(
  currentAccounts: AnyAccount[],
  originalAccounts: AnyAccount[]
) {
  const originalById = new Map<string, ReturnType<typeof normalizeAccount>>()
  const originalByKey = new Map<string, ReturnType<typeof normalizeAccount>>()

  originalAccounts.forEach((account) => {
    const normalized = normalizeAccount(account)
    if (normalized.id != null) {
      originalById.set(String(normalized.id), normalized)
    }
    originalByKey.set(makeKey(normalized), normalized)
  })

  const changed: AnyAccount[] = []

  currentAccounts.forEach((account) => {
    if (!account) return

    const normalizedCurrent = normalizeAccount(account)

    const baseline =
      (normalizedCurrent.id != null
        ? originalById.get(String(normalizedCurrent.id))
        : undefined) || originalByKey.get(makeKey(normalizedCurrent))

    if (!baseline) {
      // New account (no baseline match)
      changed.push({ ...account })
      return
    }

    const comparableFields: Array<keyof ReturnType<typeof normalizeAccount>> = [
      'accountType',
      'accountNumber',
      'ibanNumber',
      'accountTitle',
      'currencyCode',
      'dateOpened',
    ]

    const isModified = comparableFields.some(
      (field) => normalizedCurrent[field] !== baseline[field]
    )

    if (isModified) {
      changed.push({ ...account, id: baseline.id ?? account.id ?? null })
    }
  })

  return changed
}

