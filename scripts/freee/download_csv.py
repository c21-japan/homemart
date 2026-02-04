#!/usr/bin/env python3
"""
freeeからCSVファイルをダウンロードするスクリプト
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from dotenv import load_dotenv

# .env.localを読み込む
env_path = Path(__file__).parent.parent.parent / '.env.local'
load_dotenv(env_path)

# 設定
FREEE_EMAIL = os.getenv('FREEE_EMAIL')
FREEE_PASSWORD = os.getenv('FREEE_PASSWORD')
FREEE_COMPANY_ID = os.getenv('FREEE_COMPANY_ID', '12416633')
DOWNLOAD_DIR = Path(__file__).parent.parent.parent / 'tmp' / 'freee_csv'
OUTPUT_DIR = Path(__file__).parent.parent.parent / 'tmp' / 'freee_data'

# ディレクトリ作成
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def get_fiscal_period():
    """決算期の期間を取得（5月1日〜4月30日）"""
    today = datetime.now()
    current_year = today.year

    # 5月1日〜4月30日の期間を計算
    if today.month >= 5:
        start_date = f"{current_year}-05-01"
        end_date = today.strftime("%Y-%m-%d")
    else:
        start_date = f"{current_year - 1}-05-01"
        end_date = today.strftime("%Y-%m-%d")

    return start_date, end_date

def login_freee(page):
    """freeeにログイン"""
    print("freeeにログイン中...")

    # ログインページに移動
    page.goto('https://accounts.secure.freee.co.jp/login', wait_until='networkidle')

    # メールアドレス入力
    page.fill('input[name="user[email]"]', FREEE_EMAIL)
    page.fill('input[name="user[password]"]', FREEE_PASSWORD)

    # ログインボタンをクリック
    page.click('button[type="submit"]')

    # ログイン完了を待機
    try:
        page.wait_for_url('**/companies/**', timeout=30000)
        print("ログイン成功")
        return True
    except PlaywrightTimeoutError:
        # 事業所選択画面が表示される場合
        if 'select_company' in page.url:
            print("事業所を選択中...")
            # 指定された事業所を選択
            page.click(f'a[href*="company_id={FREEE_COMPANY_ID}"]')
            page.wait_for_url('**/home**', timeout=30000)
            print("事業所選択完了")
            return True
        else:
            print(f"ログイン失敗: {page.url}")
            return False

def download_trial_balance(page):
    """試算表CSVをダウンロード"""
    print("試算表をダウンロード中...")

    start_date, end_date = get_fiscal_period()

    # 試算表ページに移動
    url = f'https://secure.freee.co.jp/reports/trial_balance?company_id={FREEE_COMPANY_ID}'
    page.goto(url, wait_until='networkidle')

    # 期間を設定
    # （freeeのUIに応じて調整が必要）
    time.sleep(2)

    # CSVダウンロードボタンを探してクリック
    try:
        with page.expect_download(timeout=30000) as download_info:
            # CSVダウンロードボタンをクリック
            page.click('text=CSV', timeout=10000)

        download = download_info.value
        file_path = DOWNLOAD_DIR / 'trial_balance.csv'
        download.save_as(file_path)
        print(f"試算表を保存: {file_path}")
        return file_path
    except Exception as e:
        print(f"試算表ダウンロード失敗: {e}")
        return None

def download_journal(page):
    """仕訳帳CSVをダウンロード"""
    print("仕訳帳をダウンロード中...")

    start_date, end_date = get_fiscal_period()

    # 仕訳帳ページに移動
    url = f'https://secure.freee.co.jp/reports/journals?company_id={FREEE_COMPANY_ID}'
    page.goto(url, wait_until='networkidle')

    time.sleep(2)

    try:
        with page.expect_download(timeout=30000) as download_info:
            page.click('text=CSV', timeout=10000)

        download = download_info.value
        file_path = DOWNLOAD_DIR / 'journal.csv'
        download.save_as(file_path)
        print(f"仕訳帳を保存: {file_path}")
        return file_path
    except Exception as e:
        print(f"仕訳帳ダウンロード失敗: {e}")
        return None

def download_general_ledger(page):
    """総勘定元帳CSVをダウンロード"""
    print("総勘定元帳をダウンロード中...")

    # 総勘定元帳ページに移動
    url = f'https://secure.freee.co.jp/reports/general_ledgers?company_id={FREEE_COMPANY_ID}'
    page.goto(url, wait_until='networkidle')

    time.sleep(2)

    try:
        with page.expect_download(timeout=30000) as download_info:
            page.click('text=CSV', timeout=10000)

        download = download_info.value
        file_path = DOWNLOAD_DIR / 'general_ledger.csv'
        download.save_as(file_path)
        print(f"総勘定元帳を保存: {file_path}")
        return file_path
    except Exception as e:
        print(f"総勘定元帳ダウンロード失敗: {e}")
        return None

def parse_csv_to_json(csv_files):
    """CSVファイルをJSONに変換"""
    import pandas as pd

    result = {
        'updated_at': datetime.now().isoformat(),
        'period': {
            'start_date': get_fiscal_period()[0],
            'end_date': get_fiscal_period()[1]
        },
        'data': {}
    }

    for csv_type, csv_path in csv_files.items():
        if csv_path and csv_path.exists():
            try:
                # CSVを読み込み（エンコーディングはfreeeに合わせる）
                df = pd.read_csv(csv_path, encoding='shift_jis')
                result['data'][csv_type] = df.to_dict(orient='records')
                print(f"{csv_type} を解析完了: {len(df)} 行")
            except Exception as e:
                print(f"{csv_type} の解析失敗: {e}")
                result['data'][csv_type] = None

    return result

def main():
    """メイン処理"""
    if not FREEE_EMAIL or not FREEE_PASSWORD:
        print("エラー: FREEE_EMAIL と FREEE_PASSWORD を .env.local に設定してください")
        sys.exit(1)

    print(f"freee CSV ダウンロード開始")
    print(f"事業所ID: {FREEE_COMPANY_ID}")
    print(f"ダウンロード先: {DOWNLOAD_DIR}")

    with sync_playwright() as p:
        # ブラウザを起動（ヘッドレスモード）
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            accept_downloads=True,
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        try:
            # ログイン
            if not login_freee(page):
                print("ログイン失敗")
                sys.exit(1)

            # 各CSVをダウンロード
            csv_files = {
                'trial_balance': download_trial_balance(page),
                'journal': download_journal(page),
                'general_ledger': download_general_ledger(page)
            }

            # CSVをJSONに変換
            json_data = parse_csv_to_json(csv_files)

            # JSONを保存
            output_path = OUTPUT_DIR / 'freee_data.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)

            print(f"\n✓ 完了: {output_path}")
            print(json.dumps(json_data, ensure_ascii=False, indent=2))

        except Exception as e:
            print(f"エラー: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

        finally:
            browser.close()

if __name__ == '__main__':
    main()
