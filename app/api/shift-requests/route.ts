import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const { employeeId, note, entries } = body as {
      employeeId: string;
      note?: string;
      entries: Array<{ date: string; start: string; end: string }>;
    };

    // 入力チェック
    if (!employeeId || !entries?.length) {
      return NextResponse.json(
        { error: "従業員IDとエントリーが必要です" }, 
        { status: 400 }
      );
    }

    // 時間範囲のバリデーション
    for (const entry of entries) {
      if (!entry.date || !entry.start || !entry.end) {
        return NextResponse.json(
          { error: "日付、開始時間、終了時間は必須です" }, 
          { status: 400 }
        );
      }
      
      if (entry.end <= entry.start) {
        return NextResponse.json(
          { error: "終了時間は開始時間より後である必要があります" }, 
          { status: 400 }
        );
      }
    }

    // 同一日での時間帯交差チェック
    const dateGroups = entries.reduce((groups, entry) => {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
      return groups;
    }, {} as Record<string, typeof entries>);

    for (const [date, dayEntries] of Object.entries(dateGroups)) {
      if (dayEntries.length > 1) {
        // 同一日で複数エントリーがある場合、交差チェック
        for (let i = 0; i < dayEntries.length; i++) {
          for (let j = i + 1; j < dayEntries.length; j++) {
            const e1 = dayEntries[i];
            const e2 = dayEntries[j];
            
            // 時間帯が重複していないかチェック
            if (!(e1.end <= e2.start || e2.end <= e1.start)) {
              return NextResponse.json(
                { error: `${date}の時間帯が重複しています: ${e1.start}-${e1.end} と ${e2.start}-${e2.end}` }, 
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // 1) 申請ヘッダ作成（request_type=availability固定）
    const { data: header, error: headerErr } = await supabase
      .from("shift_requests")
      .insert({
        employee_id: employeeId,
        request_type: "availability",
        request_scope: "availability",
        status: "pending",
        notes: note || null,
        // start_date, end_date は使用しない（NULL）
      })
      .select()
      .single();

    if (headerErr || !header) {
      console.error("ヘッダー作成エラー:", headerErr);
      return NextResponse.json(
        { error: "申請ヘッダーの作成に失敗しました" }, 
        { status: 500 }
      );
    }

    // 2) 明細一括作成
    const details = entries.map(entry => ({
      shift_request_id: header.id,
      date: entry.date,
      start_time: entry.start,
      end_time: entry.end,
      hours: calculateHours(entry.start, entry.end),
      notes: null
    }));

    const { error: detailsErr } = await supabase
      .from("shift_request_details")
      .insert(details);

    if (detailsErr) {
      console.error("明細作成エラー:", detailsErr);
      
      // ロールバック: ヘッダーを削除
      await supabase.from("shift_requests").delete().eq("id", header.id);
      
      return NextResponse.json(
        { error: "シフト詳細の作成に失敗しました" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      requestId: header.id,
      message: `${entries.length}件の勤務可能日を申請しました`
    });

  } catch (error) {
    console.error("シフト申請API エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" }, 
      { status: 500 }
    );
  }
}

// 時間計算ヘルパー関数
function calculateHours(start: string, end: string): number {
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 小数点2桁まで
}
