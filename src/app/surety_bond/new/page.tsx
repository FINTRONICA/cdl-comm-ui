import { redirect } from 'next/navigation'

export default function NewGuaranteePage() {
  const tempId = `temp_${Date.now()}`
  redirect(`/surety_bond/new/${tempId}?step=0`)
}
