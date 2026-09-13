import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../public/playstore');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. ÍCONE GOOGLE PLAY STORE (512x512)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="50%" stop-color="#111D4A"/>
      <stop offset="100%" stop-color="#080F21"/>
    </linearGradient>

    <!-- Emerald Glow -->
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <!-- ScienceBit Blue Gradient -->
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1366E2"/>
    </linearGradient>

    <!-- Gold Coin 3D Gradient -->
    <linearGradient id="goldOuter" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="35%" stop-color="#FFCA28"/>
      <stop offset="70%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF8F00"/>
    </linearGradient>

    <linearGradient id="goldInner" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3E0"/>
      <stop offset="40%" stop-color="#FFE082"/>
      <stop offset="80%" stop-color="#FFC107"/>
      <stop offset="100%" stop-color="#FFA000"/>
    </linearGradient>

    <!-- Deep Drop Shadows -->
    <filter id="shadowMain" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#10B981" flood-opacity="0.3"/>
    </filter>

    <filter id="glowSubtle" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="35" result="blur"/>
    </filter>
  </defs>

  <!-- Solid Opaque Background (Google Play requirement) -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Ambient Light Glows -->
  <circle cx="160" cy="160" r="140" fill="#1366E2" opacity="0.25" filter="url(#glowSubtle)"/>
  <circle cx="360" cy="350" r="160" fill="#10B981" opacity="0.3" filter="url(#glowSubtle)"/>

  <!-- Geometric Tech Grid Accents -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="8 12" opacity="0.25"/>
  <circle cx="256" cy="256" r="185" fill="none" stroke="#10B981" stroke-width="2" opacity="0.2"/>

  <!-- Financial Chart Growth Bars (ScienceBit Tech motif) -->
  <g opacity="0.9" transform="translate(0, 15)">
    <rect x="135" y="315" width="22" height="75" rx="6" fill="#3B82F6" opacity="0.6"/>
    <rect x="175" y="270" width="22" height="120" rx="6" fill="#1366E2" opacity="0.75"/>
    <rect x="315" y="295" width="22" height="95" rx="6" fill="#10B981" opacity="0.75"/>
    <rect x="355" y="240" width="22" height="150" rx="6" fill="#34D399" opacity="0.9"/>
  </g>

  <!-- Main Financial Shield / Coin Motif -->
  <g filter="url(#shadowMain)">
    <!-- Outer Golden Rim -->
    <circle cx="256" cy="245" r="130" fill="url(#goldOuter)"/>
    <!-- Inner Coin Depth Bevel -->
    <circle cx="256" cy="245" r="114" fill="url(#goldInner)"/>
    <!-- Inner Ring Accent -->
    <circle cx="256" cy="245" r="102" fill="none" stroke="#FFE082" stroke-width="3.5" opacity="0.9"/>

    <!-- Central Currency / Growth Symbol (R$) -->
    <text x="256" y="272" font-family="'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="88" font-weight="900" fill="#78350F" text-anchor="middle" letter-spacing="-2">R$</text>
  </g>

  <!-- Upward Trend Arrow in Emerald -->
  <g transform="translate(305, 140) rotate(-45)">
    <path d="M0 20 L32 20 L32 0 L56 28 L32 56 L32 36 L0 36 Z" fill="#10B981" filter="url(#shadowMain)"/>
  </g>

  <!-- ScienceBit Brand Badge at Bottom -->
  <g transform="translate(256, 445)">
    <!-- Background Pill -->
    <rect x="-105" y="-18" width="210" height="36" rx="18" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
    <text x="0" y="6" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="800" fill="#E2E8F0" letter-spacing="1.5">
      SCIENCE<tspan fill="#38BDF8">BIT</tspan>
    </text>
  </g>
</svg>
`;

// 2. FEATURE GRAPHIC GOOGLE PLAY STORE (1024x500)
const featureSvg = `
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="featBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060D1E"/>
      <stop offset="50%" stop-color="#0C1B33"/>
      <stop offset="100%" stop-color="#081426"/>
    </linearGradient>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>

    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <filter id="featShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000000" flood-opacity="0.65"/>
    </filter>

    <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="500" fill="url(#featBg)"/>

  <!-- Decorative Color Flares -->
  <circle cx="150" cy="120" r="180" fill="#1366E2" opacity="0.3" filter="url(#glowEffect)"/>
  <circle cx="880" cy="380" r="220" fill="#059669" opacity="0.28" filter="url(#glowEffect)"/>
  <circle cx="600" cy="150" r="160" fill="#3B82F6" opacity="0.2" filter="url(#glowEffect)"/>

  <!-- Subtle Tech Grid Lines -->
  <g opacity="0.15" stroke="#94A3B8" stroke-width="1">
    <line x1="0" y1="100" x2="1024" y2="100" stroke-dasharray="6 8"/>
    <line x1="0" y1="250" x2="1024" y2="250" stroke-dasharray="6 8"/>
    <line x1="0" y1="400" x2="1024" y2="400" stroke-dasharray="6 8"/>
    <line x1="300" y1="0" x2="300" y2="500" stroke-dasharray="6 8"/>
    <line x1="650" y1="0" x2="650" y2="500" stroke-dasharray="6 8"/>
  </g>

  <!-- LEFT COLUMN: Brand & Copywriting -->
  <g transform="translate(80, 80)">
    <!-- ScienceBit Badge -->
    <g transform="translate(0, 20)">
      <rect width="160" height="32" rx="16" fill="#1E293B" stroke="#3B82F6" stroke-width="1.5"/>
      <circle cx="18" cy="16" r="6" fill="#38BDF8"/>
      <text x="32" y="21" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="800" fill="#F8FAFC" letter-spacing="1.5">
        SCIENCE<tspan fill="#38BDF8">BIT</tspan>
      </text>
    </g>

    <!-- App Title -->
    <text x="0" y="115" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
      Meu Dinheiro
    </text>

    <!-- Tagline -->
    <text x="0" y="160" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="600" fill="#34D399" letter-spacing="0.5">
      Controle Financeiro Pessoal Inteligente
    </text>

    <!-- Description Bullet Points -->
    <g transform="translate(0, 195)" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" fill="#CBD5E1">
      <g transform="translate(0, 0)">
        <circle cx="8" cy="8" r="4" fill="#38BDF8"/>
        <text x="22" y="13">Receitas, Despesas e Orçamentos por Categoria</text>
      </g>
      <g transform="translate(0, 32)">
        <circle cx="8" cy="8" r="4" fill="#34D399"/>
        <text x="22" y="13">Gestão de Cartões, Faturas e Vencimentos em 7 Dias</text>
      </g>
      <g transform="translate(0, 64)">
        <circle cx="8" cy="8" r="4" fill="#FBBF24"/>
        <text x="22" y="13">Extratos Bancários OFX/CSV, Metas e Relatórios em PDF</text>
      </g>
    </g>

    <!-- Feature Pills -->
    <g transform="translate(0, 325)">
      <rect x="0" y="0" width="130" height="34" rx="17" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
      <text x="65" y="21" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#A7F3D0">✓ 100% SEGURO</text>

      <rect x="145" y="0" width="135" height="34" rx="17" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1.5"/>
      <text x="212" y="21" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#BFDBFE">✓ OFFLINE / PWA</text>

      <rect x="295" y="0" width="140" height="34" rx="17" fill="#312E81" stroke="#818CF8" stroke-width="1.5"/>
      <text x="365" y="21" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#E0E7FF">✓ SEM ANÚNCIOS</text>
    </g>
  </g>

  <!-- RIGHT COLUMN: Realistic Device Mockup / Floating Cards -->
  <g transform="translate(680, 50)" filter="url(#featShadow)">
    <!-- Device Frame -->
    <rect x="0" y="0" width="270" height="420" rx="36" fill="#0F172A" stroke="#334155" stroke-width="5"/>
    <rect x="10" y="10" width="250" height="400" rx="28" fill="#F8FAFC"/>

    <!-- Screen Header -->
    <rect x="10" y="10" width="250" height="55" rx="28" fill="#1E293B"/>
    <text x="135" y="42" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">
      💰 Meu Dinheiro
    </text>

    <!-- Balance Card -->
    <g transform="translate(25, 80)">
      <rect width="220" height="85" rx="14" fill="#10B981"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#E6FFFA">Saldo do Mês</text>
      <text x="16" y="56" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF">R$ 5.430,00</text>
      <text x="16" y="74" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#D1FAE5">▲ +18% este mês</text>
    </g>

    <!-- Credit Card Widget in Mockup -->
    <g transform="translate(25, 180)">
      <rect width="220" height="90" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <circle cx="26" cy="24" r="10" fill="#EFF6FF"/>
      <text x="44" y="28" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="800" fill="#1E293B">Cartão Black</text>
      <text x="204" y="28" text-anchor="end" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#DC2626">R$ 1.840,00</text>

      <!-- Progress bar -->
      <rect x="16" y="46" width="188" height="8" rx="4" fill="#E2E8F0"/>
      <rect x="16" y="46" width="94" height="8" rx="4" fill="#F59E0B"/>

      <text x="16" y="72" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" fill="#64748B">Limite Disp.: <tspan font-weight="700" fill="#059669">R$ 6.160,00</tspan></text>
    </g>

    <!-- Due Bills Alert Widget in Mockup -->
    <g transform="translate(25, 285)">
      <rect width="220" height="75" rx="14" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1.5"/>
      <text x="16" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#92400E">⏰ Vencimentos (7 dias)</text>
      <text x="16" y="44" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1E293B">Internet Fibra Óptica</text>
      <text x="16" y="60" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" fill="#78350F">Vence amanhã • R$ 119,90</text>
      <rect x="156" y="42" width="50" height="22" rx="6" fill="#10B981"/>
      <text x="181" y="57" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF">PAGAR</text>
    </g>
  </g>
</svg>
`;

// 3. SCREENSHOT 1: DASHBOARD & PATRIMÔNIO (1080x1920)
const screenshot1Svg = `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrBg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="40%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#090E1A"/>
    </linearGradient>
    <filter id="phoneShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="35" stdDeviation="40" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1080" height="1920" fill="url(#scrBg1)"/>

  <!-- Top Marketing Copy -->
  <g transform="translate(540, 140)" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
    <!-- ScienceBit Mini Badge -->
    <rect x="-100" y="-30" width="200" height="38" rx="19" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
    <text x="0" y="-6" font-size="15" font-weight="800" fill="#F8FAFC" letter-spacing="2">SCIENCE<tspan fill="#38BDF8">BIT</tspan></text>

    <text x="0" y="70" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
      VISÃO FINANCEIRA TOTAL
    </text>
    <text x="0" y="125" font-size="26" font-weight="500" fill="#94A3B8">
      Acompanhe saldo, receitas, despesas e evolução em tempo real
    </text>
  </g>

  <!-- Smartphone Mockup Container -->
  <g transform="translate(140, 360)" filter="url(#phoneShadow)">
    <!-- Device Body -->
    <rect width="800" height="1520" rx="60" fill="#0A0F1D" stroke="#334155" stroke-width="8"/>
    <!-- Screen -->
    <rect x="18" y="18" width="764" height="1484" rx="46" fill="#F8FAFC"/>

    <!-- App Top Bar -->
    <g transform="translate(18, 18)">
      <rect width="764" height="110" rx="46" fill="#FFFFFF"/>
      <circle cx="65" cy="55" r="24" fill="#0F172A"/>
      <text x="65" y="63" text-anchor="middle" font-size="24" fill="#FFFFFF">💰</text>
      <text x="105" y="52" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" fill="#1E1E1E">Meu Dinheiro</text>
      <text x="105" y="76" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="500" fill="#64748B">Controle Financeiro • ScienceBit</text>
      <!-- Date Selector -->
      <rect x="580" y="32" width="150" height="46" rx="12" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="655" y="62" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="17" font-weight="700" fill="#334155">Setembro ▾</text>
    </g>

    <!-- Metrics Cards Grid -->
    <g transform="translate(48, 160)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <!-- Receitas -->
      <rect x="0" y="0" width="220" height="140" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="24" y="38" font-size="16" font-weight="600" fill="#059669">Receitas</text>
      <text x="24" y="80" font-size="28" font-weight="900" fill="#059669">R$ 8.950,00</text>
      <text x="24" y="112" font-size="14" font-weight="500" fill="#64748B">+ Salário e Extras</text>

      <!-- Despesas -->
      <rect x="240" y="0" width="220" height="140" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="264" y="38" font-size="16" font-weight="600" fill="#DC2626">Despesas</text>
      <text x="264" y="80" font-size="28" font-weight="900" fill="#DC2626">R$ 3.520,00</text>
      <text x="264" y="112" font-size="14" font-weight="500" fill="#64748B">Total acumulado</text>

      <!-- Saldo Líquido -->
      <rect x="480" y="0" width="224" height="140" rx="20" fill="#10B981"/>
      <text x="504" y="38" font-size="16" font-weight="700" fill="#D1FAE5">Saldo do Mês</text>
      <text x="504" y="80" font-size="28" font-weight="900" fill="#FFFFFF">R$ 5.430,00</text>
      <text x="504" y="112" font-size="14" font-weight="600" fill="#ECFDF5">Superávit positivo</text>
    </g>

    <!-- Patrimônio Total Banner -->
    <g transform="translate(48, 330)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="120" rx="22" fill="#1E293B"/>
      <text x="32" y="44" font-size="17" font-weight="600" fill="#94A3B8">PATRIMÔNIO LÍQUIDO TOTAL</text>
      <text x="32" y="90" font-size="38" font-weight="900" fill="#38BDF8">R$ 48.750,00</text>
      <text x="670" y="70" text-anchor="end" font-size="16" font-weight="700" fill="#34D399">▲ 6 Contas Ativas</text>
    </g>

    <!-- Upcoming Bills Widget Preview -->
    <g transform="translate(48, 480)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="280" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="32" y="48" font-size="22" font-weight="900" fill="#0F172A">⏰ Contas a Vencer &amp; Atrasadas</text>
      <text x="32" y="76" font-size="15" font-weight="500" fill="#64748B">Próximos 7 dias de vencimento</text>

      <!-- Item 1 -->
      <g transform="translate(32, 100)">
        <circle cx="20" cy="24" r="18" fill="#FEE2E2"/>
        <text x="20" y="32" text-anchor="middle" font-size="16">⚠️</text>
        <text x="52" y="24" font-size="18" font-weight="800" fill="#1E293B">Condomínio Residencial</text>
        <text x="52" y="46" font-size="14" font-weight="600" fill="#DC2626">Atrasada (Venceu dia 10) • Itaú</text>
        <text x="520" y="34" text-anchor="end" font-size="20" font-weight="900" fill="#DC2626">R$ 680,00</text>
        <rect x="540" y="12" width="100" height="38" rx="10" fill="#10B981"/>
        <text x="590" y="37" text-anchor="middle" font-size="15" font-weight="800" fill="#FFFFFF">PAGAR</text>
      </g>

      <!-- Divider -->
      <line x1="32" y1="180" x2="672" y2="180" stroke="#F1F5F9" stroke-width="2"/>

      <!-- Item 2 -->
      <g transform="translate(32, 200)">
        <circle cx="20" cy="24" r="18" fill="#FEF3C7"/>
        <text x="20" y="32" text-anchor="middle" font-size="16">⚡</text>
        <text x="52" y="24" font-size="18" font-weight="800" fill="#1E293B">Energia Elétrica (Enel)</text>
        <text x="52" y="46" font-size="14" font-weight="600" fill="#D97706">Vence hoje • Nubank</text>
        <text x="520" y="34" text-anchor="end" font-size="20" font-weight="900" fill="#DC2626">R$ 215,40</text>
        <rect x="540" y="12" width="100" height="38" rx="10" fill="#10B981"/>
        <text x="590" y="37" text-anchor="middle" font-size="15" font-weight="800" fill="#FFFFFF">PAGAR</text>
      </g>
    </g>

    <!-- Expenses by Category Card -->
    <g transform="translate(48, 790)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="340" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="32" y="48" font-size="22" font-weight="900" fill="#0F172A">Despesas por Categoria</text>
      
      <!-- Mini Visual Pie & Legend -->
      <circle cx="160" cy="190" r="90" fill="none" stroke="#EF4444" stroke-width="40" stroke-dasharray="280 500"/>
      <circle cx="160" cy="190" r="90" fill="none" stroke="#F59E0B" stroke-width="40" stroke-dasharray="140 500" stroke-dashoffset="-280"/>
      <circle cx="160" cy="190" r="90" fill="none" stroke="#3B82F6" stroke-width="40" stroke-dasharray="100 500" stroke-dashoffset="-420"/>

      <g transform="translate(320, 110)">
        <rect x="0" y="0" width="18" height="18" rx="4" fill="#EF4444"/>
        <text x="30" y="16" font-size="17" font-weight="700" fill="#1E293B">Moradia &amp; Contas (48%)</text>

        <rect x="0" y="45" width="18" height="18" rx="4" fill="#F59E0B"/>
        <text x="30" y="61" font-size="17" font-weight="700" fill="#1E293B">Alimentação &amp; Super (28%)</text>

        <rect x="0" y="90" width="18" height="18" rx="4" fill="#3B82F6"/>
        <text x="30" y="106" font-size="17" font-weight="700" fill="#1E293B">Transporte &amp; Veículo (15%)</text>

        <rect x="0" y="135" width="18" height="18" rx="4" fill="#10B981"/>
        <text x="30" y="151" font-size="17" font-weight="700" fill="#1E293B">Lazer &amp; Saúde (9%)</text>
      </g>
    </g>
  </g>
</svg>
`;

// 4. SCREENSHOT 2: CARTÕES DE CRÉDITO E FATURAS (1080x1920)
const screenshot2Svg = `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrBg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022C22"/>
      <stop offset="40%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#021C16"/>
    </linearGradient>
    <filter id="phoneShadow2" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="35" stdDeviation="40" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1080" height="1920" fill="url(#scrBg2)"/>

  <!-- Top Marketing Copy -->
  <g transform="translate(540, 140)" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
    <rect x="-100" y="-30" width="200" height="38" rx="19" fill="#065F46" stroke="#34D399" stroke-width="1.5"/>
    <text x="0" y="-6" font-size="15" font-weight="800" fill="#F8FAFC" letter-spacing="2">SCIENCE<tspan fill="#6EE7B7">BIT</tspan></text>

    <text x="0" y="70" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
      CARTÕES &amp; FATURAS
    </text>
    <text x="0" y="125" font-size="26" font-weight="500" fill="#A7F3D0">
      Monitore limites disponíveis, faturas em aberto e datas de corte
    </text>
  </g>

  <!-- Smartphone Mockup Container -->
  <g transform="translate(140, 360)" filter="url(#phoneShadow2)">
    <rect width="800" height="1520" rx="60" fill="#0F172A" stroke="#334155" stroke-width="8"/>
    <rect x="18" y="18" width="764" height="1484" rx="46" fill="#F8FAFC"/>

    <!-- App Top Bar -->
    <g transform="translate(18, 18)">
      <rect width="764" height="100" rx="46" fill="#FFFFFF"/>
      <circle cx="65" cy="50" r="22" fill="#0284C7"/>
      <text x="65" y="58" text-anchor="middle" font-size="22" fill="#FFFFFF">💳</text>
      <text x="105" y="48" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="26" font-weight="900" fill="#1E1E1E">Contas &amp; Cartões</text>
      <text x="105" y="72" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" font-weight="500" fill="#64748B">Gestão e limites em tempo real</text>
    </g>

    <!-- Credit Card 1: Black Card Style -->
    <g transform="translate(48, 150)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="340" rx="28" fill="#111827"/>
      <!-- Metallic Chip -->
      <rect x="40" y="40" width="55" height="42" rx="8" fill="#FBBF24"/>
      <circle cx="650" cy="60" r="22" fill="#EF4444" opacity="0.8"/>
      <circle cx="625" cy="60" r="22" fill="#F59E0B" opacity="0.8"/>

      <text x="40" y="140" font-size="28" font-weight="800" fill="#FFFFFF">Cartão Nubank Ultravioleta</text>
      <text x="40" y="180" font-size="17" font-weight="500" fill="#9CA3AF">Fatura Atual em Aberto</text>
      <text x="40" y="235" font-size="44" font-weight="900" fill="#F87171">R$ 2.450,80</text>

      <!-- Progress Bar -->
      <rect x="40" y="260" width="624" height="12" rx="6" fill="#374151"/>
      <rect x="40" y="260" width="312" height="12" rx="6" fill="#10B981"/>

      <text x="40" y="305" font-size="16" font-weight="700" fill="#34D399">Disp.: R$ 5.549,20</text>
      <text x="664" y="305" text-anchor="end" font-size="16" font-weight="600" fill="#E5E7EB">Limite: R$ 8.000,00</text>
    </g>

    <!-- Dates Indicator -->
    <g transform="translate(48, 515)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="340" height="90" rx="18" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="2"/>
      <text x="24" y="36" font-size="15" font-weight="700" fill="#1E40AF">📅 Fechamento da Fatura</text>
      <text x="24" y="68" font-size="22" font-weight="900" fill="#1D4ED8">Todo dia 20</text>

      <rect x="364" y="0" width="340" height="90" rx="18" fill="#FEF2F2" stroke="#FECACA" stroke-width="2"/>
      <text x="388" y="36" font-size="15" font-weight="700" fill="#991B1B">⏰ Vencimento da Fatura</text>
      <text x="388" y="68" font-size="22" font-weight="900" fill="#B91C1C">Todo dia 28</text>
    </g>

    <!-- Credit Card 2: Visa Platinum -->
    <g transform="translate(48, 635)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="340" rx="28" fill="#1E3A8A"/>
      <rect x="40" y="40" width="55" height="42" rx="8" fill="#E2E8F0"/>
      <text x="650" y="65" text-anchor="end" font-size="24" font-weight="900" fill="#93C5FD">VISA</text>

      <text x="40" y="140" font-size="28" font-weight="800" fill="#FFFFFF">Cartão Itaú Personnalité</text>
      <text x="40" y="180" font-size="17" font-weight="500" fill="#BFDBFE">Fatura Atual em Aberto</text>
      <text x="40" y="235" font-size="44" font-weight="900" fill="#FCA5A5">R$ 1.120,00</text>

      <!-- Progress Bar -->
      <rect x="40" y="260" width="624" height="12" rx="6" fill="#1E293B"/>
      <rect x="40" y="260" width="124" height="12" rx="6" fill="#60A5FA"/>

      <text x="40" y="305" font-size="16" font-weight="700" fill="#93C5FD">Disp.: R$ 8.880,00</text>
      <text x="664" y="305" text-anchor="end" font-size="16" font-weight="600" fill="#FFFFFF">Limite: R$ 10.000,00</text>
    </g>

    <!-- Quick Action / New Card Button -->
    <g transform="translate(48, 1010)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="80" rx="20" fill="#2E7D32"/>
      <text x="352" y="50" text-anchor="middle" font-size="22" font-weight="800" fill="#FFFFFF">
        + Cadastrar Novo Cartão de Crédito
      </text>
    </g>
  </g>
</svg>
`;

// 5. SCREENSHOT 3: ORÇAMENTO & METAS (1080x1920)
const screenshot3Svg = `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrBg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="40%" stop-color="#312E81"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <filter id="phoneShadow3" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="35" stdDeviation="40" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1080" height="1920" fill="url(#scrBg3)"/>

  <g transform="translate(540, 140)" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
    <rect x="-100" y="-30" width="200" height="38" rx="19" fill="#312E81" stroke="#818CF8" stroke-width="1.5"/>
    <text x="0" y="-6" font-size="15" font-weight="800" fill="#F8FAFC" letter-spacing="2">SCIENCE<tspan fill="#A5B4FC">BIT</tspan></text>

    <text x="0" y="70" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
      ORÇAMENTO &amp; METAS
    </text>
    <text x="0" y="125" font-size="26" font-weight="500" fill="#C7D2FE">
      Defina tetos de gastos por categoria e alcance seus objetivos
    </text>
  </g>

  <g transform="translate(140, 360)" filter="url(#phoneShadow3)">
    <rect width="800" height="1520" rx="60" fill="#0F172A" stroke="#334155" stroke-width="8"/>
    <rect x="18" y="18" width="764" height="1484" rx="46" fill="#F8FAFC"/>

    <!-- App Top Bar -->
    <g transform="translate(18, 18)">
      <rect width="764" height="100" rx="46" fill="#FFFFFF"/>
      <circle cx="65" cy="50" r="22" fill="#4F46E5"/>
      <text x="65" y="58" text-anchor="middle" font-size="22" fill="#FFFFFF">🎯</text>
      <text x="105" y="48" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="26" font-weight="900" fill="#1E1E1E">Orçamento Mensal</text>
      <text x="105" y="72" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" font-weight="500" fill="#64748B">Limites e acompanhamento em tempo real</text>
    </g>

    <!-- Budget Category 1: Alimentação -->
    <g transform="translate(48, 150)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="180" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="32" y="46" font-size="22" font-weight="800" fill="#1E293B">🛒 Alimentação &amp; Supermercado</text>
      <text x="672" y="46" text-anchor="end" font-size="18" font-weight="700" fill="#059669">68% Utilizado</text>

      <rect x="32" y="75" width="640" height="18" rx="9" fill="#E2E8F0"/>
      <rect x="32" y="75" width="435" height="18" rx="9" fill="#10B981"/>

      <text x="32" y="135" font-size="18" font-weight="600" fill="#64748B">Gasto: <tspan font-weight="800" fill="#1E293B">R$ 1.360,00</tspan></text>
      <text x="672" y="135" text-anchor="end" font-size="18" font-weight="600" fill="#64748B">Teto: <tspan font-weight="800" fill="#1E293B">R$ 2.000,00</tspan></text>
    </g>

    <!-- Budget Category 2: Transporte -->
    <g transform="translate(48, 355)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="180" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="32" y="46" font-size="22" font-weight="800" fill="#1E293B">🚗 Transporte &amp; Combustível</text>
      <text x="672" y="46" text-anchor="end" font-size="18" font-weight="700" fill="#F59E0B">85% Utilizado</text>

      <rect x="32" y="75" width="640" height="18" rx="9" fill="#E2E8F0"/>
      <rect x="32" y="75" width="544" height="18" rx="9" fill="#F59E0B"/>

      <text x="32" y="135" font-size="18" font-weight="600" fill="#64748B">Gasto: <tspan font-weight="800" fill="#1E293B">R$ 680,00</tspan></text>
      <text x="672" y="135" text-anchor="end" font-size="18" font-weight="600" fill="#64748B">Teto: <tspan font-weight="800" fill="#1E293B">R$ 800,00</tspan></text>
    </g>

    <!-- Savings Goals Header -->
    <g transform="translate(48, 570)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <text x="0" y="30" font-size="26" font-weight="900" fill="#1E1E1E">🏆 Metas de Poupança &amp; Sonhos</text>
      <text x="0" y="58" font-size="16" font-weight="500" fill="#64748B">Objetivos financeiros programados</text>
    </g>

    <!-- Goal 1: Reserva de Emergência -->
    <g transform="translate(48, 650)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="200" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <circle cx="60" cy="55" r="28" fill="#ECFDF5"/>
      <text x="60" y="65" text-anchor="middle" font-size="28">🛡️</text>
      <text x="105" y="50" font-size="22" font-weight="900" fill="#065F46">Reserva de Emergência (6 Meses)</text>
      <text x="105" y="74" font-size="15" font-weight="600" fill="#059669">Faltam apenas R$ 5.000,00</text>

      <rect x="32" y="110" width="640" height="20" rx="10" fill="#E2E8F0"/>
      <rect x="32" y="110" width="480" height="20" rx="10" fill="#059669"/>

      <text x="32" y="165" font-size="19" font-weight="800" fill="#065F46">Guardado: R$ 15.000,00</text>
      <text x="672" y="165" text-anchor="end" font-size="19" font-weight="700" fill="#64748B">Meta: R$ 20.000,00 (75%)</text>
    </g>

    <!-- Goal 2: Viagem de Férias -->
    <g transform="translate(48, 875)" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
      <rect width="704" height="200" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <circle cx="60" cy="55" r="28" fill="#EFF6FF"/>
      <text x="60" y="65" text-anchor="middle" font-size="28">✈️</text>
      <text x="105" y="50" font-size="22" font-weight="900" fill="#1E40AF">Viagem em Família</text>
      <text x="105" y="74" font-size="15" font-weight="600" fill="#2563EB">Prazo: Dezembro / 2026</text>

      <rect x="32" y="110" width="640" height="20" rx="10" fill="#E2E8F0"/>
      <rect x="32" y="110" width="320" height="20" rx="10" fill="#3B82F6"/>

      <text x="32" y="165" font-size="19" font-weight="800" fill="#1E40AF">Guardado: R$ 4.000,00</text>
      <text x="672" y="165" text-anchor="end" font-size="19" font-weight="700" fill="#64748B">Meta: R$ 8.000,00 (50%)</text>
    </g>
  </g>
</svg>
`;

async function generate() {
  console.log('Gerando ativos oficiais para Google Play Store...');

  // 1. Ícone (512x512 PNG)
  const iconBuf = await sharp(Buffer.from(iconSvg))
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(outputDir, 'icone-512x512.png'), iconBuf);
  console.log('✓ icone-512x512.png criado');

  // Sync PWA icons
  fs.writeFileSync(path.join(__dirname, '../public/pwa-512x512.png'), iconBuf);
  fs.writeFileSync(path.join(__dirname, '../public/pwa-maskable-512x512.png'), iconBuf);
  const icon192 = await sharp(iconBuf).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/pwa-192x192.png'), icon192);
  const icon180 = await sharp(iconBuf).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), icon180);

  // 2. Feature Graphic / Banner Promocional (1024x500 PNG)
  const bannerBuf = await sharp(Buffer.from(featureSvg))
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(outputDir, 'banner-promocional-1024x500.png'), bannerBuf);
  console.log('✓ banner-promocional-1024x500.png criado');

  // 3. Screenshot 1 (1080x1920 PNG)
  const scr1Buf = await sharp(Buffer.from(screenshot1Svg))
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(outputDir, 'screenshot-1-dashboard.png'), scr1Buf);
  console.log('✓ screenshot-1-dashboard.png criado');

  // 4. Screenshot 2 (1080x1920 PNG)
  const scr2Buf = await sharp(Buffer.from(screenshot2Svg))
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(outputDir, 'screenshot-2-cartoes.png'), scr2Buf);
  console.log('✓ screenshot-2-cartoes.png criado');

  // 5. Screenshot 3 (1080x1920 PNG)
  const scr3Buf = await sharp(Buffer.from(screenshot3Svg))
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(outputDir, 'screenshot-3-orcamento-metas.png'), scr3Buf);
  console.log('✓ screenshot-3-orcamento-metas.png criado');

  // Generate src/data/playstoreAssetsBase64.ts for instant, 100% offline and CORS-free download & ZIP
  const dataDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const base64Code = `// Generated automatically by scripts/generate_playstore_assets.js
export interface PlayStoreAssetData {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  dimensions: string;
  filename: string;
  description: string;
  aspect: 'square' | 'banner' | 'screenshot';
  base64: string; // data:image/png;base64,...
  rawBase64: string; // raw base64 without prefix for JSZip
}

export const PLAYSTORE_ASSETS: PlayStoreAssetData[] = [
  {
    id: 'icone',
    title: 'Ícone Oficial do App',
    badge: 'Obrigatório Play Store & WebIntoApp',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dimensions: '512 x 512 px (PNG 32-bit)',
    filename: 'icone-512x512.png',
    description: 'Ícone com acabamento 3D, moeda metálica com símbolo R$, degradê ScienceBit e fundo opaco.',
    aspect: 'square',
    base64: 'data:image/png;base64,${iconBuf.toString('base64')}',
    rawBase64: '${iconBuf.toString('base64')}'
  },
  {
    id: 'banner',
    title: 'Gráfico de Recursos (Feature Graphic)',
    badge: 'Banner Principal da Play Store',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    dimensions: '1024 x 500 px (PNG)',
    filename: 'banner-promocional-1024x500.png',
    description: 'Banner promocional com logotipo oficial ScienceBit, mockups dos cartões e destaques.',
    aspect: 'banner',
    base64: 'data:image/png;base64,${bannerBuf.toString('base64')}',
    rawBase64: '${bannerBuf.toString('base64')}'
  },
  {
    id: 'screenshot1',
    title: 'Screenshot 1 — Visão Financeira Total',
    badge: 'Captura de Tela 1',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    dimensions: '1080 x 1920 px (9:16 Vertical)',
    filename: 'screenshot-1-dashboard.png',
    description: 'Demonstração do Painel Geral com saldo do mês, gráfico de despesas e contas a vencer.',
    aspect: 'screenshot',
    base64: 'data:image/png;base64,${scr1Buf.toString('base64')}',
    rawBase64: '${scr1Buf.toString('base64')}'
  },
  {
    id: 'screenshot2',
    title: 'Screenshot 2 — Cartões & Faturas',
    badge: 'Captura de Tela 2',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    dimensions: '1080 x 1920 px (9:16 Vertical)',
    filename: 'screenshot-2-cartoes.png',
    description: 'Gestão de cartões de crédito com barra de limite em tempo real e faturas.',
    aspect: 'screenshot',
    base64: 'data:image/png;base64,${scr2Buf.toString('base64')}',
    rawBase64: '${scr2Buf.toString('base64')}'
  },
  {
    id: 'screenshot3',
    title: 'Screenshot 3 — Orçamento & Metas',
    badge: 'Captura de Tela 3',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dimensions: '1080 x 1920 px (9:16 Vertical)',
    filename: 'screenshot-3-orcamento-metas.png',
    description: 'Acompanhamento do teto de gastos por categoria e objetivos de economia.',
    aspect: 'screenshot',
    base64: 'data:image/png;base64,${scr3Buf.toString('base64')}',
    rawBase64: '${scr3Buf.toString('base64')}'
  }
];
`;

  fs.writeFileSync(path.join(dataDir, 'playstoreAssetsBase64.ts'), base64Code);
  console.log('✓ src/data/playstoreAssetsBase64.ts criado com sucesso');

  console.log('Todos os ativos foram gerados com sucesso em /public/playstore e src/data!');
}

generate().catch(err => {
  console.error('Erro na geração:', err);
  process.exit(1);
});
