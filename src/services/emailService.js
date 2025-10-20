import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Document from '../models/Document.js';

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Template de email HTML
function gerarEmailHTML(documentos) {
  const categoriasEmoji = {
    saude: '🏥',
    ambiente: '🌍',
    economia: '💼',
    trabalho: '👷',
    financas: '💰',
    outros: '📋'
  };

  let htmlDocumentos = '';
  
  documentos.forEach(doc => {
    const emoji = categoriasEmoji[doc.categoria] || '📋';
    htmlDocumentos += `
      <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #0a0f1e 0%, #1a2f3a 100%); border-left: 4px solid #10b981; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <h3 style="margin: 0 0 12px 0; color: #10b981; font-size: 18px;">
          ${emoji} ${doc.titulo}
        </h3>
        <p style="margin: 8px 0; color: #6ee7b7; font-size: 13px;">
          <strong>Categoria:</strong> ${doc.categoria.toUpperCase()} | 
          <strong>Fonte:</strong> ${doc.fonte === 'diario_republica' ? 'Diário da República' : 'Parlamento'}
        </p>
        ${doc.resumo ? `<p style="margin: 12px 0; color: #d1d5db; line-height: 1.6;">${doc.resumo}</p>` : ''}
        <a href="${doc.url}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
          Ver Documento Completo →
        </a>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Radar Legislativo - Novos Documentos</title>
    </head>
    <body style="font-family: 'Inter', 'Segoe UI', sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 650px; margin: 0 auto; padding: 0; background: #0a0f1e;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">📡 RADAR LEGISLATIVO</h1>
        <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Novos documentos detetados</p>
      </div>
      
      <div style="background: #1a2332; padding: 40px 30px; border-radius: 0;">
        <p style="font-size: 16px; color: #d1d5db; margin-bottom: 30px;">
          Olá! 👋<br><br>
          O sistema detetou <strong style="color: #10b981; font-size: 20px;">${documentos.length}</strong> novo(s) documento(s) nas categorias que segues:
        </p>
        
        ${htmlDocumentos}
        
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #374151;">
        
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Este é um email automático do Radar Legislativo<br>
          Sistema de Monitorização em Tempo Real
        </p>
      </div>
    </body>
    </html>
  `;
}

// Enviar notificações
export async function enviarNotificacoes() {
  try {
    console.log('📧 Iniciando envio de notificações...');
    
    // Buscar documentos não notificados
    const todos = await Document.find({ limit: 1000 });
    const documentosNovos = todos.filter(doc => !doc.notificado);
    
    if (documentosNovos.length === 0) {
      console.log('ℹ️  Nenhum documento novo para notificar');
      return;
    }

    console.log(`📬 Encontrados ${documentosNovos.length} documentos novos`);
    
    // Buscar utilizadores ativos
    const users = await User.find({ ativo: true });
    
    if (users.length === 0) {
      console.log('⚠️  Nenhum utilizador registado');
      return;
    }

    // Enviar email para cada utilizador
    for (const user of users) {
      // Filtrar documentos por categorias de interesse
      let documentosFiltrados = documentosNovos;
      
      if (user.categorias_interesse && user.categorias_interesse.length > 0) {
        documentosFiltrados = documentosNovos.filter(doc => 
          user.categorias_interesse.includes(doc.categoria)
        );
      }
      
      if (documentosFiltrados.length === 0) {
        continue;
      }

      try {
        await transporter.sendMail({
          from: `"Radar Legislativo 📡" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `📡 ${documentosFiltrados.length} novo(s) documento(s) - Radar Legislativo`,
          html: gerarEmailHTML(documentosFiltrados)
        });
        
        console.log(`✅ Email enviado para ${user.email}`);
        
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${user.email}:`, error.message);
      }
    }
    
    // Marcar todos como notificados
    for (const doc of documentosNovos) {
      await Document.updateMany(
        { url: doc.url },
        { notificado: true }
      );
    }
    
    console.log('✅ Notificações enviadas com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error.message);
  }
}

// Testar configuração de email
export async function testarEmail(emailDestino) {
  try {
    await transporter.sendMail({
      from: `"Radar Legislativo 📡" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: '🧪 Teste - Radar Legislativo',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; padding: 40px; border-radius: 12px;">
          <h2 style="color: #10b981; margin-bottom: 20px;">✅ Configuração de Email OK!</h2>
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.6;">
            Se recebeste este email, o sistema está configurado corretamente e pronto para enviar notificações!
          </p>
          <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
              📡 Radar Legislativo está ATIVO!
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste de email:', error.message);
    return false;
  }
}