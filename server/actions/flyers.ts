'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import type {
  FlyerDesign,
  FlyerDistribution,
  FlyerInquiry,
  FlyerPrintJob,
  DesignPerformance,
  AreaPerformance,
  WeeklySummary,
  FlyerAIAnalysis
} from '@/types/flyers';

// ==================================================
// デザイン管理
// ==================================================

export async function createFlyerDesign(data: Partial<FlyerDesign>) {
  const { data: design, error } = await supabaseServer
    .from('flyer_designs')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/flyers/designs');
  return design as FlyerDesign;
}

export async function getFlyerDesigns(activeOnly: boolean = true) {
  let query = supabaseServer
    .from('flyer_designs')
    .select('*')
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as FlyerDesign[];
}

export async function updateFlyerDesign(id: string, data: Partial<FlyerDesign>) {
  const { data: design, error } = await supabaseServer
    .from('flyer_designs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/flyers/designs');
  return design as FlyerDesign;
}

// ==================================================
// 配布記録
// ==================================================

export async function createDistribution(data: Partial<FlyerDistribution>) {
  const { data: distribution, error } = await supabaseServer
    .from('flyer_distributions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/flyers/distributions');
  revalidatePath('/admin/flyers');
  return distribution as FlyerDistribution;
}

export async function getDistributions(filters?: {
  startDate?: string;
  endDate?: string;
  designId?: string;
  area?: string;
}) {
  let query = supabaseServer
    .from('flyer_distributions')
    .select('*, flyer_designs(*)')
    .order('distribution_date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('distribution_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('distribution_date', filters.endDate);
  }
  if (filters?.designId) {
    query = query.eq('design_id', filters.designId);
  }
  if (filters?.area) {
    query = query.eq('area', filters.area);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (FlyerDistribution & { flyer_designs?: FlyerDesign })[];
}

// ==================================================
// 印刷記録
// ==================================================

export async function createPrintJob(data: Partial<FlyerPrintJob>) {
  const { data: printJob, error } = await supabaseServer
    .from('flyer_print_jobs')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/flyers/prints');
  revalidatePath('/admin/flyers');
  return printJob as FlyerPrintJob;
}

export async function getPrintJobs(filters?: {
  startDate?: string;
  endDate?: string;
  designId?: string;
  printerName?: string;
  status?: string;
}) {
  let query = supabaseServer
    .from('flyer_print_jobs')
    .select('*, flyer_designs(*)')
    .order('print_date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('print_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('print_date', filters.endDate);
  }
  if (filters?.designId) {
    query = query.eq('design_id', filters.designId);
  }
  if (filters?.printerName) {
    query = query.eq('printer_name', filters.printerName);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (FlyerPrintJob & { flyer_designs?: FlyerDesign })[];
}

// ==================================================
// 問い合わせ記録
// ==================================================

export async function createInquiry(data: Partial<FlyerInquiry>) {
  const { data: inquiry, error } = await supabaseServer
    .from('flyer_inquiries')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/flyers/inquiries');
  revalidatePath('/admin/flyers');
  return inquiry as FlyerInquiry;
}

export async function getInquiries(filters?: {
  startDate?: string;
  endDate?: string;
  designId?: string;
  area?: string;
  channel?: string;
}) {
  let query = supabaseServer
    .from('flyer_inquiries')
    .select('*, flyer_designs(*)')
    .order('inquiry_datetime', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('inquiry_datetime', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('inquiry_datetime', filters.endDate);
  }
  if (filters?.designId) {
    query = query.eq('design_id', filters.designId);
  }
  if (filters?.area) {
    query = query.eq('distribution_area', filters.area);
  }
  if (filters?.channel) {
    query = query.eq('inquiry_channel', filters.channel);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (FlyerInquiry & { flyer_designs?: FlyerDesign })[];
}

// ==================================================
// パフォーマンス分析
// ==================================================

export async function getDesignPerformance() {
  const { data, error } = await supabaseServer
    .from('flyer_design_performance')
    .select('*');

  if (error) throw error;
  return data as DesignPerformance[];
}

export async function getAreaPerformance() {
  const { data, error } = await supabaseServer
    .from('flyer_area_performance')
    .select('*');

  if (error) throw error;
  return data as AreaPerformance[];
}

export async function getWeeklySummary(weekStart?: string) {
  let query = supabaseServer
    .from('flyer_weekly_summary')
    .select('*')
    .order('week_start', { ascending: false });

  if (weekStart) {
    query = query.eq('week_start', weekStart);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as WeeklySummary[];
}

// ==================================================
// AI分析結果
// ==================================================

export async function getAIAnalysis(weekStart?: string) {
  let query = supabaseServer
    .from('flyer_ai_analysis')
    .select('*')
    .order('analysis_week', { ascending: false });

  if (weekStart) {
    query = query.eq('analysis_week', weekStart);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (weekStart ? data?.[0] : data?.[0]) as FlyerAIAnalysis | undefined;
}

export async function saveAIAnalysis(data: Partial<FlyerAIAnalysis>) {
  const { data: analysis, error } = await supabaseServer
    .from('flyer_ai_analysis')
    .upsert(data, { onConflict: 'analysis_week' })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/flyers');
  revalidatePath('/admin/flyers/analysis');
  return analysis as FlyerAIAnalysis;
}

// ==================================================
// その他
// ==================================================

export async function getUniqueAreas() {
  const { data, error } = await supabaseServer
    .from('flyer_distributions')
    .select('area')
    .order('area');

  if (error) throw error;

  const uniqueAreas = [...new Set((data || []).map((d) => d.area))];
  return uniqueAreas;
}
