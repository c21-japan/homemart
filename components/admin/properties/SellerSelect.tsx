import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  label: string;
  kana: string;
  phone: string;
  email: string;
  category: string;
}

interface SellerSelectProps {
  value?: string;
  onChange: (customerId: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SellerSelect({ 
  value, 
  onChange, 
  placeholder = "売主を検索（漢字・かな・ローマ字）",
  className = '',
  disabled = false
}: SellerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 選択された顧客の情報を取得
  const selectedCustomer = customers.find(c => c.id === value);

  // 顧客検索APIを呼び出し
  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const data = await response.json();
      setCustomers(data.results || []);
    } catch (error) {
      console.error('顧客検索エラー:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // デバウンス付き検索
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm && !isComposing) {
      searchTimeoutRef.current = setTimeout(() => {
        searchCustomers(searchTerm);
      }, 300);
    } else if (!searchTerm) {
      setCustomers([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, isComposing, searchCustomers]);

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComposing) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < customers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && customers[selectedIndex]) {
          handleSelectCustomer(customers[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setCustomers([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // 顧客選択
  const handleSelectCustomer = (customer: Customer) => {
    onChange(customer.id);
    setSearchTerm('');
    setCustomers([]);
    setSelectedIndex(-1);
    setIsOpen(false);
  };

  // 選択解除
  const handleClearSelection = () => {
    onChange(null);
    setSearchTerm('');
    setCustomers([]);
  };

  // ドロップダウンの開閉
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setCustomers([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 選択済み顧客の表示 */}
      {selectedCustomer && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                {selectedCustomer.label}
              </div>
              {selectedCustomer.kana && (
                <div className="text-xs text-blue-700">
                  {selectedCustomer.kana}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
              title="選択解除"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 検索入力フィールド */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <button
              type="button"
              onClick={toggleDropdown}
              className="text-gray-400 hover:text-gray-600"
            >
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && (customers.length > 0 || loading || searchTerm.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              検索中...
            </div>
          ) : customers.length > 0 ? (
            <ul>
              {customers.map((customer, index) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                      index === selectedIndex ? 'bg-blue-100' : ''
                    } ${index === 0 ? 'rounded-t-lg' : ''} ${
                      index === customers.length - 1 ? 'rounded-b-lg' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {customer.label}
                    </div>
                    {customer.kana && (
                      <div className="text-sm text-gray-600">
                        {customer.kana}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="mb-2">該当する顧客が見つかりません</div>
              <div className="text-sm">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 underline"
                  onClick={() => {
                    // 新規顧客登録ページへのリンク
                    window.open('/admin/customers/new', '_blank');
                  }}
                >
                  新規顧客を登録
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
