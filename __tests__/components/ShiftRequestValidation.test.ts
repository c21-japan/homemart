// シフト申請バリデーション機能のテスト
describe('ShiftRequest Validation', () => {
  // 時間帯交差チェックのテスト
  describe('Time overlap validation', () => {
    const hasOverlap = (entries: Array<{date: string, start: string, end: string}>) => {
      const dateGroups = entries.reduce((groups, entry) => {
        if (!groups[entry.date]) groups[entry.date] = [];
        groups[entry.date].push(entry);
        return groups;
      }, {} as Record<string, typeof entries>);

      for (const [date, dayEntries] of Object.entries(dateGroups)) {
        if (dayEntries.length > 1) {
          for (let i = 0; i < dayEntries.length; i++) {
            for (let j = i + 1; j < dayEntries.length; j++) {
              const e1 = dayEntries[i];
              const e2 = dayEntries[j];
              
              if (!(e1.end <= e2.start || e2.end <= e1.start)) {
                return true; // 重複あり
              }
            }
          }
        }
      }
      return false; // 重複なし
    };

    test('同一日の時間帯が重複していない場合、falseを返す', () => {
      const entries = [
        { date: '2024-01-01', start: '09:00', end: '12:00' },
        { date: '2024-01-01', start: '13:00', end: '17:00' }
      ];
      expect(hasOverlap(entries)).toBe(false);
    });

    test('同一日の時間帯が重複している場合、trueを返す', () => {
      const entries = [
        { date: '2024-01-01', start: '09:00', end: '13:00' },
        { date: '2024-01-01', start: '12:00', end: '17:00' }
      ];
      expect(hasOverlap(entries)).toBe(true);
    });

    test('異なる日の場合は重複とみなさない', () => {
      const entries = [
        { date: '2024-01-01', start: '09:00', end: '17:00' },
        { date: '2024-01-02', start: '09:00', end: '17:00' }
      ];
      expect(hasOverlap(entries)).toBe(false);
    });

    test('境界値の場合は重複とみなさない', () => {
      const entries = [
        { date: '2024-01-01', start: '09:00', end: '12:00' },
        { date: '2024-01-01', start: '12:00', end: '17:00' }
      ];
      expect(hasOverlap(entries)).toBe(false);
    });
  });

  // 時間範囲バリデーションのテスト
  describe('Time range validation', () => {
    const isValidTimeRange = (start: string, end: string) => {
      return end > start;
    };

    test('終了時間が開始時間より後の場合、trueを返す', () => {
      expect(isValidTimeRange('09:00', '17:00')).toBe(true);
    });

    test('終了時間が開始時間と同じ場合、falseを返す', () => {
      expect(isValidTimeRange('09:00', '09:00')).toBe(false);
    });

    test('終了時間が開始時間より前の場合、falseを返す', () => {
      expect(isValidTimeRange('17:00', '09:00')).toBe(false);
    });
  });
});
