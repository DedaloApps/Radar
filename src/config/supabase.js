import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltam credenciais do Supabase no .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const testConnection = async () => {
  try {
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log(`✅ Supabase conectado! (${count} documentos na BD)`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar Supabase:', error.message);
    return false;
  }
};