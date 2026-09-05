import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('about_app')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      console.error('Failed to fetch about content:', error);
      // Return empty defaults if no record exists
      return successResponse({
        id: 'default',
        notes: '',
        versionsHistory: '',
      });
    }

    // Transform snake_case to camelCase
    return successResponse({
      id: data.id,
      notes: data.notes || '',
      versionsHistory: data.versions_history || '',
    });
  } catch (error: any) {
    console.error('Failed to read about content:', error);
    return errorResponse('SERVER_ERROR', 'Failed to load about content', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Only super-admin can update
    if (!user || user.role !== 'SUPER_ADMIN') {
      return errorResponse('UNAUTHORIZED', 'Only super-admin can edit this content', 401);
    }

    const updates = await req.json();

    const dbUpdates: any = {
      id: 'default',
      notes: updates.notes || '',
      versions_history: updates.versionsHistory || '',
      updated_at: new Date().toISOString(),
    };

    // Upsert - update if exists, insert if doesn't
    const { data, error } = await supabase
      .from('about_app')
      .upsert(dbUpdates, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to update about content:', error);
      return errorResponse('SERVER_ERROR', 'Failed to update content', 500);
    }

    return successResponse({
      id: data.id,
      notes: data.notes,
      versionsHistory: data.versions_history,
    });
  } catch (error: any) {
    console.error('Failed to update about content:', error);
    return errorResponse('SERVER_ERROR', error.message || 'Failed to update content', 500);
  }
}
