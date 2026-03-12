import { NextResponse } from 'next/server';
import { createClient, getClientByCPF, updateClientOnPixData } from '@/lib/db-client';

// Config OnPix
const ONPIX_PROXY = process.env.ONPIX_PROXY || '5.161.155.252:80';
const ONPIX_USERNAME = process.env.ONPIX_USERNAME || 'Joao1030';
const ONPIX_PASSWORD = process.env.ONPIX_PASSWORD || 'Canaisip123@';

// Packages
const PACKAGES = {
  internet: 'nVrW8oDKaN', // TESTE C/ ADULTO 4H (usar como placeholder)
  tv: 'nVrW8oDKaN', // Mesmo para TV (ajustar quando tiver package específico)
};

const SERVER_ID = 'RYAWRk1jlx'; // PIX GOLD

async function getOnPixToken() {
  try {
    const response = await fetch('http://onpix.sigmab.pro/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: ONPIX_USERNAME,
        password: ONPIX_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('OnPix login error:', error);
    throw error;
  }
}

async function createOnPixClient(token, clientData) {
  const username = clientData.cpf.replace(/\D/g, '').substring(0, 11) + '_tv';
  const password = 'Teste2026'; // Regra: sem caracteres especiais

  try {
    const response = await fetch('http://onpix.sigmab.pro/api/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        server_id: SERVER_ID,
        package_id: PACKAGES.tv,
        username: username,
        password: password,
        name: clientData.name,
        connections: 2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      userId: data.data?.id,
      username: username,
      password: password,
      server: data.data?.server,
      expiresAt: data.data?.expires_at_tz,
    };
  } catch (error) {
    console.error('OnPix create error:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, cpf, phone, city, choice } = body;

    // Validação
    if (!name || !cpf || !phone || !city || !choice) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const existing = getClientByCPF(cpf);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'CPF já cadastrado' },
        { status: 409 }
      );
    }

    // Criar no banco local
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const dbResult = createClient({
      name,
      cpf,
      phone,
      city,
      choice,
      ip,
    });

    if (!dbResult.success) {
      return NextResponse.json(
        { success: false, error: dbResult.error },
        { status: 500 }
      );
    }

    // Criar no OnPix
    try {
      const token = await getOnPixToken();
      const onpixResult = await createOnPixClient(token, { name, cpf });

      if (onpixResult.success) {
        // Atualizar com dados do OnPix
        updateClientOnPixData(dbResult.id, {
          userId: onpixResult.userId,
          username: onpixResult.username,
          password: onpixResult.password,
        });

        return NextResponse.json({
          success: true,
          id: dbResult.id,
          username: onpixResult.username,
          password: onpixResult.password,
          server: onpixResult.server,
          expiresAt: onpixResult.expiresAt,
        });
      }
    } catch (onpixError) {
      console.error('OnPix error:', onpixError);
      // Retorna erro mas mantém no banco local
      return NextResponse.json(
        { success: false, error: 'Erro ao criar conta na TV. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
