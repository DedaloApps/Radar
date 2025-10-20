import axios from 'axios';
import * as cheerio from 'cheerio';
import Document from '../models/Document.js';
import { categorizarDocumento } from '../services/categorizer.js';

export async function scrapeParlamento() {
  console.log('🔍 Scraping Parlamento...');
  
  try {
    const url = 'https://www.parlamento.pt/ActividadeParlamentar/Paginas/Actividade.aspx';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const novosDocumentos = [];
    
    // Adaptar seletores
    $('.news-item, .iniciativa, article, .content-item, .list-item, .item').each((index, element) => {
      if (index >= 20) return false; // Limitar a 20
      
      const titulo = $(element).find('h2, h3, .title, a').first().text().trim();
      const link = $(element).find('a').attr('href');
      const resumo = $(element).find('p, .summary, .description').first().text().trim();
      
      if (titulo && link && titulo.length > 10) {
        const urlCompleto = link.startsWith('http') ? link : `https://www.parlamento.pt${link}`;
        
        novosDocumentos.push({
          titulo,
          url: urlCompleto,
          resumo: resumo || titulo.substring(0, 200),
          fonte: 'parlamento'
        });
      }
    });
    
    console.log(`📄 Encontrados ${novosDocumentos.length} documentos no Parlamento`);
    
    // Guardar novos documentos
    let novosGuardados = 0;
    for (const doc of novosDocumentos) {
      try {
        const existe = await Document.findOne({ url: doc.url });
        
        if (!existe) {
          const categoria = categorizarDocumento(doc.titulo, doc.resumo);
          
          await Document.create({
            ...doc,
            categoria,
            dataPublicacao: new Date()
          });
          
          novosGuardados++;
          console.log(`  ✅ ${doc.titulo.substring(0, 60)}... [${categoria}]`);
        }
      } catch (error) {
        if (error.code !== '23505') { // Ignore duplicate errors
          console.error('  ❌ Erro:', error.message);
        }
      }
    }
    
    console.log(`✅ Parlamento: ${novosGuardados} novos documentos guardados`);
    return novosGuardados;
    
  } catch (error) {
    console.error('❌ Erro no scraping Parlamento:', error.message);
    return 0;
  }
}