import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAchievements() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching achievements:', err);
    return [];
  }
}

export async function saveAchievement(achievement) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert([achievement])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('Error saving achievement:', err);
    return { success: false, error: err.message };
  }
}

export async function uploadFile(file, achievementId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('achievementId', achievementId);

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-achievement-file`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    return { success: true, url: result.url, name: result.name };
  } catch (err) {
    console.error('Error uploading file:', err);
    return { success: false, error: err.message };
  }
}
