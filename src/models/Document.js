import { supabase } from "../config/supabase.js";

export default {
  async create(data) {
    const { data: result, error } = await supabase
      .from("documents")
      .insert([
        {
          titulo: data.titulo,
          categoria: data.categoria,
          tipo_conteudo: data.tipo_conteudo || "geral",
          tipo_radar: data.tipo_radar || "parlamento", // ← NOVO
          fonte: data.fonte,
          url: data.url,
          resumo: data.resumo || null,
          conteudo: data.conteudo || null,
          numero: data.numero || null,
          autores: data.autores || null,
          entidades: data.entidades || null,
          estado: data.estado || null,
          hora: data.hora || null,
          local_evento: data.local_evento || null,
          legislatura: data.legislatura || null,
          sessao_legislativa: data.sessao_legislativa || null,
          data_publicacao:
            data.dataPublicacao ||
            data.data_publicacao ||
            new Date().toISOString(),
          notificado: data.notificado || false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async findOne(query) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("url", query.url)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async find(filter = {}) {
    let query = supabase.from("documents").select("*");

    if (filter.tipo_radar) {
      query = query.eq("tipo_radar", filter.tipo_radar);
    }

    if (filter.categoria) {
      query = query.eq("categoria", filter.categoria);
    }

    if (filter.tipo_conteudo) {
      query = query.eq("tipo_conteudo", filter.tipo_conteudo);
    }

    if (filter.fonte) {
      query = query.eq("fonte", filter.fonte);
    }

    query = query.order("created_at", { ascending: false });

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async countDocuments(filter = {}) {
    let query = supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (filter.created_at) {
      query = query.gte("created_at", filter.created_at);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count;
  },

  async aggregate(pipeline) {
    const { data, error } = await supabase
      .from("documents")
      .select("categoria")
      .order("categoria");

    if (error) throw error;

    const stats = {};
    data.forEach((doc) => {
      stats[doc.categoria] = (stats[doc.categoria] || 0) + 1;
    });

    return Object.entries(stats).map(([categoria, total]) => ({
      _id: categoria,
      total,
    }));
  },

  async updateMany(filter, update) {
    const { data, error } = await supabase
      .from("documents")
      .update(update.$set)
      .eq("notificado", filter.notificado);

    if (error) throw error;
    return data;
  },
};
