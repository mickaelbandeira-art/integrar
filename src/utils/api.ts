import { supabase } from '../lib/supabase';

// Types (Mirrors of the DB schema)
export interface Checkin {
    id?: string;
    user_name: string;
    user_email?: string;
    matricula: string;
    latitude?: number | null;
    longitude?: number | null;
    created_at?: string;
}

export interface WordEntry {
    id?: string;
    text: string;
    approved?: boolean;
    created_at?: string;
}

export interface Evaluation {
    id?: string;
    rating_general: number;
    rating_lecture?: number;
    best_moment?: string;
    improvements?: string;
    team_energy?: string;
    phrase_completion?: string;
    user_name?: string;
    created_at?: string;
}

// Checkins
export const addCheckin = async (checkin: Checkin) => {
    const { data, error } = await supabase
        .from('checkins')
        .insert([checkin])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getCheckins = async () => {
    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Word Cloud
export const addWord = async (text: string) => {
    const { data, error } = await supabase
        .from('word_cloud')
        .insert([{ text, approved: true }]) // Auto-approve for now, or false if moderation is strict
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getWords = async () => {
    const { data, error } = await supabase
        .from('word_cloud')
        .select('*')
        .eq('approved', true) // Only fetch approved words
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// Admin: Get all words (including unapproved)
export const getAllWords = async () => {
    const { data, error } = await supabase
        .from('word_cloud')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const approveWord = async (id: string, approved: boolean) => {
    const { error } = await supabase
        .from('word_cloud')
        .update({ approved })
        .eq('id', id);

    if (error) throw error;
};

export const deleteWord = async (id: string) => {
    const { error } = await supabase
        .from('word_cloud')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Evaluations
export const addEvaluation = async (evaluation: Evaluation) => {
    const { data, error } = await supabase
        .from('evaluations')
        .insert([evaluation])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getEvaluations = async () => {
    const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// Current User (Session persistence)
export const setCurrentUser = (name: string, email: string, matricula: string) => {
    const session = { name, email, matricula };
    localStorage.setItem('user_session', JSON.stringify(session));
    // Keep legacy for backward compatibility if needed, or remove
    localStorage.setItem('userName', name);
};

export const getCurrentUser = () => {
    const sessionStr = localStorage.getItem('user_session');
    if (sessionStr) return JSON.parse(sessionStr);

    // Fallback for old sessions
    const legacyName = localStorage.getItem('userName');
    return legacyName ? { name: legacyName, email: '', matricula: '' } : null;
};

// --- Jewels Feature ---

export const saveJewelChoice = async (email: string, matricula: string, jewelName: string) => {
    // optional: check if user already chose? assuming we just add new entry or could limit to one.
    // simpler to just insert for now.
    const { data, error } = await supabase
        .from('jewel_choices')
        .insert([
            { user_email: email, matricula: matricula, jewel_name: jewelName }
        ]);

    if (error) {
        console.error('Error saving jewel:', error);
        throw error;
    }
    return data;
};

export const getUserJewel = async (email: string) => {
    const { data, error } = await supabase
        .from('jewel_choices')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found', which is fine
        console.error('Error getting user jewel:', error);
    }
    return data;
};

export const getJewelStats = async () => {
    const { data, error } = await supabase
        .from('jewel_choices')
        .select('jewel_name');

    if (error) {
        console.error('Error getting stats:', error);
        return [];
    }

    // Count occurrences
    const stats: Record<string, number> = {};
    data.forEach((row: any) => {
        stats[row.jewel_name] = (stats[row.jewel_name] || 0) + 1;
    });

    return Object.entries(stats).map(([name, count]) => ({ name, count }));
};
