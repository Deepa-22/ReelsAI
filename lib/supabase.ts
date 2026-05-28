import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!_supabase) _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase = (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) ? getSupabaseClient() : (null as unknown as SupabaseClient);

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error: Error | null }> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) return { url: '', error: new Error(error.message) };

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return { url: urlData.publicUrl, error: null };
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const client = getSupabaseClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  return !error;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}
