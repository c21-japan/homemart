"use client";

import { useState, useRef } from "react";

interface MeetingRecordProps {
  onSave: (meeting: {
    title: string;
    content: string;
    meeting_date: string;
    photos: File[];
  }) => void;
  onCancel?: () => void;
}

export default function MeetingRecord({ onSave, onCancel }: MeetingRecordProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 30枚制限チェック
    if (photos.length + files.length > 30) {
      alert('写真は最大30枚までアップロードできます');
      return;
    }
    
    // ファイルサイズチェック（5MB制限）
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}は5MBを超えています`);
        return false;
      }
      return true;
    });
    
    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('打ち合わせタイトルを入力してください');
      return;
    }
    
    if (!content.trim()) {
      alert('打ち合わせ内容を入力してください');
      return;
    }
    
    if (!meetingDate) {
      alert('打ち合わせ日時を選択してください');
      return;
    }
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      meeting_date: meetingDate,
      photos
    });
    
    // フォームをリセット
    setTitle("");
    setContent("");
    setMeetingDate("");
    setPhotos([]);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-xl border border-gray-200 p-6 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          📅 打ち合わせ記録
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            キャンセル
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* 打ち合わせタイトル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            打ち合わせタイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：物件の現況確認と査定依頼"
          />
        </div>

        {/* 打ち合わせ日時 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            打ち合わせ日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 打ち合わせ内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            打ち合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="打ち合わせの詳細内容を記載してください..."
          />
        </div>

        {/* 写真アップロード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真アップロード（最大30枚）
          </label>
          
          <div className="space-y-3">
            {/* アップロードボタン */}
            <button
              type="button"
              onClick={openFileSelector}
              disabled={photos.length >= 30}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              📷 写真を選択
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            {/* 写真一覧 */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`写真 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {photo.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 写真枚数表示 */}
            <div className="text-sm text-gray-600">
              アップロード済み: {photos.length}/30枚
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            キャンセル
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!title.trim() || !content.trim() || !meetingDate}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          保存
        </button>
      </div>
    </div>
  );
}
