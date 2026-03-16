import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Inicializa o cliente do Supabase com a chave de serviço (Admin)
    // Isso é necessário para contornar as regras de segurança (RLS) no webhook
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Webhook Hotmart] Chaves do Supabase não configuradas');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // A Hotmart envia os dados no corpo da requisição
    const body = await req.json();
    
    // Verifica se é o evento de compra aprovada
    // A Hotmart envia "PURCHASE_APPROVED" para compras confirmadas
    if (body.event === 'PURCHASE_APPROVED') {
      const buyerEmail = body.data?.buyer?.email;
      const productId = body.data?.product?.id;
      
      // Verifica se é o produto correto (Ad Prompt Br)
      if (productId === 7390923 && buyerEmail) {
        console.log(`[Webhook Hotmart] Compra aprovada para: ${buyerEmail}`);
        
        // Atualiza ou insere o status de "pro" para o email do comprador
        // na tabela 'subscriptions'
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert(
            { 
              email: buyerEmail, 
              is_pro: true,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'email' }
          );
          
        if (error) {
          console.error('[Webhook Hotmart] Erro ao atualizar Supabase:', error);
          return NextResponse.json({ error: 'Erro ao atualizar banco de dados' }, { status: 500 });
        }
        
        console.log(`[Webhook Hotmart] Acesso vitalício liberado para: ${buyerEmail}`);
        return NextResponse.json({ success: true, message: 'Acesso liberado com sucesso' });
      } else {
        console.log(`[Webhook Hotmart] Produto ignorado ou email ausente. Produto ID: ${productId}`);
        return NextResponse.json({ success: true, message: 'Evento ignorado (outro produto)' });
      }
    }
    
    // Retorna 200 para outros eventos para a Hotmart não ficar reenviando
    return NextResponse.json({ success: true, message: 'Evento recebido' });
    
  } catch (error) {
    console.error('[Webhook Hotmart] Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
