'use client'

import type { PermissionType } from '@/lib/auth/permissions'

interface PermissionCheckboxProps {
  label: string
  permission: PermissionType
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function PermissionCheckbox({
  label,
  permission,
  checked,
  onChange,
  disabled
}: PermissionCheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="sr-only">{permission}</span>
    </label>
  )
}
