import { FirmForm } from '@/components/admin/FirmForm'

export default function NewFirmPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-white">Add Firm</h1>
      <FirmForm />
    </div>
  )
}
