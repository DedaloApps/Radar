import { supabase } from '../config/supabase.js';

export default {
  async create(data) {
    const { data: result, error } = await supabase
      .from('users')
      .insert([{
        email: data.email,
        categorias_interesse: data.categoriasInteresse || [],
        ativo: data.ativo !== undefined ? data.ativo : true
      }])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async findOne(query) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', query.email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findOneAndUpdate(query, update, options) {
    const { data, error } = await supabase
      .from('users')
      .update({
        categorias_interesse: update.categoriasInteresse,
        ativo: update.ativo !== undefined ? update.ativo : true
      })
      .eq('email', query.email)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async find(filter = {}) {
    let query = supabase.from('users').select('*');

    if (filter.ativo !== undefined) {
      query = query.eq('ativo', filter.ativo);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};