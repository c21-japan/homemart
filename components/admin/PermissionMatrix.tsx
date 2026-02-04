'use client'

import {
  FEATURES,
  PERMISSION_TYPES,
  type Feature,
  type PermissionType,
  type UserPermissions
} from '@/lib/auth/permissions'
import PermissionCheckbox from './PermissionCheckbox'

interface PermissionMatrixProps {
  permissions: UserPermissions
  onChange: (feature: Feature, permissionType: PermissionType, checked: boolean) => void
  onSelectAll: (feature: Feature) => void
  onClearAll: (feature: Feature) => void
  disabled?: boolean
}

export default function PermissionMatrix({
  permissions,
  onChange,
  onSelectAll,
  onClearAll,
  disabled
}: PermissionMatrixProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">機能</th>
            {Object.entries(PERMISSION_TYPES).map(([key, label]) => (
              <th key={key} className="px-3 py-3 text-center font-medium text-gray-700 text-sm">
                {label}
              </th>
            ))}
            <th className="px-3 py-3 text-center font-medium text-gray-700 text-sm">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Object.entries(FEATURES).map(([featureKey, featureLabel]) => (
            <tr key={featureKey} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{featureLabel}</td>
              {Object.keys(PERMISSION_TYPES).map((permKey) => (
                <td key={permKey} className="px-3 py-3 text-center">
                  <PermissionCheckbox
                    label={`${featureLabel} ${PERMISSION_TYPES[permKey as PermissionType]}`}
                    permission={permKey as PermissionType}
                    checked={
                      permissions[featureKey as Feature]?.includes(permKey as PermissionType) || false
                    }
                    onChange={(checked) =>
                      onChange(featureKey as Feature, permKey as PermissionType, checked)
                    }
                    disabled={disabled}
                  />
                </td>
              ))}
              <td className="px-3 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onSelectAll(featureKey as Feature)}
                  className="text-xs text-blue-600 hover:underline mr-2"
                  disabled={disabled}
                >
                  全選択
                </button>
                <button
                  type="button"
                  onClick={() => onClearAll(featureKey as Feature)}
                  className="text-xs text-gray-500 hover:underline"
                  disabled={disabled}
                >
                  解除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
