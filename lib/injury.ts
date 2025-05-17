import { supabase } from '@/lib/supabase';

export type PainLog = {
  id: string;
  date: string;
  pain_level: number;
  location: string;
  notes: string;
  rehab: string[];
  user_id: string;
  created_at: string;
};

export async function fetchPainLogs() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('pain_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(log => ({
      ...log,
      date: new Date(log.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      rehab: log.rehab || [],
    }));
  } catch (error) {
    console.error('Error fetching pain logs:', error);
    return [];
  }
}

export async function fetchPainLogById(id: string) {
  try {
    const { data, error } = await supabase
      .from('pain_logs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      date: new Date(data.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      rehab: data.rehab || [],
    };
  } catch (error) {
    console.error('Error fetching pain log by ID:', error);
    return null;
  }
}

export async function addPainLog(painLog: {
  pain_level: number;
  location: string;
  notes: string;
  rehab: string[];
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('pain_logs')
      .insert({
        user_id: user.id,
        pain_level: painLog.pain_level,
        location: painLog.location,
        notes: painLog.notes,
        rehab: painLog.rehab,
      })
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error adding pain log:', error);
    throw error;
  }
}

export function getPainLevelColor(level: number) {
  if (level <= 3) return '#10B981'; // Green for mild
  if (level <= 6) return '#F59E0B'; // Yellow/Orange for moderate
  return '#EF4444'; // Red for severe
}

export function getPainLevelLabel(level: number) {
  if (level <= 3) return 'Mild';
  if (level <= 6) return 'Moderate';
  return 'Severe';
}

export async function getWeeklyTrend() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Get the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('pain_logs')
      .select('created_at, pain_level')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    // Group by day
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const trend = daysOfWeek.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const logsForDay = data.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= date && logDate < nextDay;
      });
      
      // Average pain level for the day
      const value = logsForDay.length > 0
        ? logsForDay.reduce((sum, log) => sum + log.pain_level, 0) / logsForDay.length
        : 0;
        
      return { day, value: Math.round(value) };
    });
    
    return trend;
  } catch (error) {
    console.error('Error fetching weekly trend:', error);
    return [];
  }
}