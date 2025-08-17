import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SellerSelect from '@/components/admin/properties/SellerSelect';

// fetchのモック
global.fetch = jest.fn();

const mockCustomers = [
  {
    id: '1',
    label: '山田 太郎 | 080-1234-5678',
    kana: 'ヤマダ タロウ',
    phone: '080-1234-5678',
    email: 'yamada@example.com',
    category: 'seller'
  },
  {
    id: '2',
    label: '佐藤 花子 | 090-8765-4321',
    kana: 'サトウ ハナコ',
    phone: '090-8765-4321',
    email: 'sato@example.com',
    category: 'seller'
  }
];

describe('SellerSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で正しく表示される', () => {
    const mockOnChange = jest.fn();
    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
        placeholder="売主を検索"
      />
    );

    expect(screen.getByPlaceholderText('売主を検索')).toBeInTheDocument();
  });

  it('検索入力でAPIが呼ばれる', async () => {
    const mockOnChange = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockCustomers })
    });

    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '山田' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/customers/search?q=%E5%B1%B1%E7%94%B0&limit=10'
      );
    });
  });

  it('検索結果がドロップダウンに表示される', async () => {
    const mockOnChange = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockCustomers })
    });

    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '山田' } });

    await waitFor(() => {
      expect(screen.getByText('山田 太郎 | 080-1234-5678')).toBeInTheDocument();
      expect(screen.getByText('佐藤 花子 | 090-8765-4321')).toBeInTheDocument();
    });
  });

  it('顧客選択でonChangeが呼ばれる', async () => {
    const mockOnChange = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockCustomers })
    });

    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '山田' } });

    await waitFor(() => {
      const firstCustomer = screen.getByText('山田 太郎 | 080-1234-5678');
      fireEvent.click(firstCustomer);
    });

    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('キーボード操作で顧客を選択できる', async () => {
    const mockOnChange = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockCustomers })
    });

    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '山田' } });

    await waitFor(() => {
      expect(screen.getByText('山田 太郎 | 080-1234-5678')).toBeInTheDocument();
    });

    // 下矢印キーで最初の候補を選択
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Enterキーで決定
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('選択済み顧客が表示される', () => {
    const mockOnChange = jest.fn();
    render(
      <SellerSelect
        value="1"
        onChange={mockOnChange}
      />
    );

    // 選択済み顧客の情報が表示される
    expect(screen.getByText('山田 太郎 | 080-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('ヤマダ タロウ')).toBeInTheDocument();
  });

  it('選択解除ボタンでonChangeが呼ばれる', () => {
    const mockOnChange = jest.fn();
    render(
      <SellerSelect
        value="1"
        onChange={mockOnChange}
      />
    );

    const clearButton = screen.getByTitle('選択解除');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('2文字未満では検索が実行されない', async () => {
    const mockOnChange = jest.fn();
    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '山' } });

    // 300ms待機
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    }, { timeout: 400 });
  });

  it('検索エラー時の処理', async () => {
    const mockOnChange = jest.fn();
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '山田' } });

    await waitFor(() => {
      expect(screen.getByText('該当する顧客が見つかりません')).toBeInTheDocument();
    });
  });

  it('新規顧客登録ボタンが表示される', async () => {
    const mockOnChange = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    });

    render(
      <SellerSelect
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('売主を検索（漢字・かな・ローマ字）');
    fireEvent.change(input, { target: { value: '存在しない顧客' } });

    await waitFor(() => {
      expect(screen.getByText('新規顧客を登録')).toBeInTheDocument();
    });
  });
});
