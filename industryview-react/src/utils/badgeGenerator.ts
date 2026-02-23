import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Badge size in mm — scaled up for better readability (2x credit card on PDF)
const BADGE_WIDTH = 160;
const BADGE_HEIGHT = 100;

// Brand colours
const BLUE: [number, number, number] = [26, 86, 219];
const BLUE_DARK: [number, number, number] = [17, 56, 147];
const WHITE: [number, number, number] = [255, 255, 255];
const BG_GRAY: [number, number, number] = [245, 247, 250];
const TEXT_DARK: [number, number, number] = [30, 35, 50];
const TEXT_MUTED: [number, number, number] = [100, 110, 130];
const BORDER: [number, number, number] = [210, 215, 225];

export interface BadgeEmployeeData {
  id: number | string;
  name: string;
  matricula?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  profile_picture?: string | null;
  email?: string | null;
  companyName?: string;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function buildCircularAvatar(photoDataUrl: string, sizePx: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = sizePx;
      canvas.height = sizePx;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.beginPath();
      ctx.arc(sizePx / 2, sizePx / 2, sizePx / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      // Cover the circle area while keeping aspect ratio
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, sizePx, sizePx);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = photoDataUrl;
  });
}

function buildInitialsAvatar(initials: string, sizePx: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, sizePx, sizePx);
  gradient.addColorStop(0, '#1a56db');
  gradient.addColorStop(1, '#3b82f6');
  ctx.beginPath();
  ctx.arc(sizePx / 2, sizePx / 2, sizePx / 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(sizePx * 0.38)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials.toUpperCase().slice(0, 2), sizePx / 2, sizePx / 2 + 1);

  return canvas.toDataURL('image/png');
}

function getInitials(name: string): string {
  return (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('');
}

export async function generateBadgePDF(employee: BadgeEmployeeData): Promise<void> {
  const companyLabel = employee.companyName || 'INDUSTRYVIEW';

  // --- QR Code ---
  const qrPayload = JSON.stringify({
    id: employee.id,
    name: employee.name || '',
    matricula: employee.matricula || '',
    cargo: employee.cargo || '',
    departamento: employee.departamento || '',
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
    color: { dark: '#1e2332', light: '#ffffff' },
  });

  // --- Avatar ---
  let avatarDataUrl: string | null = null;
  if (employee.profile_picture) {
    const loaded = await loadImageAsDataUrl(employee.profile_picture);
    if (loaded) {
      avatarDataUrl = await buildCircularAvatar(loaded, 300);
    }
  }
  if (!avatarDataUrl) {
    avatarDataUrl = buildInitialsAvatar(getInitials(employee.name), 300);
  }

  // --- PDF ---
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [BADGE_HEIGHT, BADGE_WIDTH],
  });

  const W = BADGE_WIDTH;
  const H = BADGE_HEIGHT;

  // ── Background ──
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, 'F');

  // ── Border ──
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(1, 1, W - 2, H - 2, 3, 3, 'S');

  // ── Header bar ──
  const headerH = 16;
  doc.setFillColor(...BLUE);
  doc.roundedRect(1, 1, W - 2, headerH, 3, 3, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(1, headerH - 3, W - 2, 4, 'F'); // square bottom corners

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text(companyLabel.toUpperCase(), W / 2, headerH / 2 + 2.5, { align: 'center' });

  // Accent stripe
  doc.setFillColor(...BLUE_DARK);
  doc.rect(1, headerH + 1, W - 2, 1, 'F');

  // ── Footer bar ──
  const footerH = 10;
  const footerY = H - footerH - 1;
  doc.setFillColor(...BLUE_DARK);
  doc.roundedRect(1, footerY, W - 2, footerH + 1, 3, 3, 'F');
  doc.setFillColor(...BLUE_DARK);
  doc.rect(1, footerY, W - 2, 3, 'F'); // square top corners

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  const footerText = employee.email || 'ID Funcional / Employee Badge';
  doc.text(footerText, W / 2, footerY + footerH / 2 + 1.5, { align: 'center' });

  // ── Body background ──
  doc.setFillColor(...BG_GRAY);
  doc.rect(1, headerH + 2, W - 2, footerY - headerH - 2, 'F');

  // ── Layout zones ──
  const bodyTop = headerH + 4;
  const bodyBottom = footerY - 2;
  const bodyH = bodyBottom - bodyTop;

  // Left zone: avatar
  const leftW = 44;
  const avatarSize = 30;
  const avatarX = (leftW - avatarSize) / 2 + 1;
  const avatarY = bodyTop + (bodyH - avatarSize) / 2;
  doc.addImage(avatarDataUrl, 'PNG', avatarX, avatarY, avatarSize, avatarSize);

  // Vertical separator
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.line(leftW + 1, bodyTop + 1, leftW + 1, bodyBottom - 1);

  // Right zone: info + QR
  const qrSize = 32;
  const qrMargin = 5;
  const qrX = W - qrSize - qrMargin;
  const qrY = bodyTop + (bodyH - qrSize) / 2;

  const textX = leftW + 5;
  const textMaxW = qrX - textX - 4;

  let y = bodyTop + 4;

  // ── Employee name (handles wrapping) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_DARK);
  const nameLines = doc.splitTextToSize(employee.name || 'Funcionário', textMaxW);
  doc.text(nameLines, textX, y);
  y += nameLines.length * 5.5 + 2;

  // ── Cargo ──
  if (employee.cargo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BLUE);
    const cargoLines = doc.splitTextToSize(employee.cargo, textMaxW);
    doc.text(cargoLines, textX, y);
    y += cargoLines.length * 4.2 + 1.5;
  }

  // ── Departamento ──
  if (employee.departamento) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(employee.departamento, textX, y, { maxWidth: textMaxW });
    y += 5;
  }

  // ── Separator line ──
  y += 1;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(textX, y, textX + textMaxW, y);
  y += 5;

  // ── Matrícula ──
  if (employee.matricula) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('MATRÍCULA', textX, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DARK);
    doc.text(String(employee.matricula), textX + 22, y);
    y += 5;
  }

  // ── ID ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('ID', textX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text(String(employee.id), textX + 8, y);

  // ── QR Code with white card ──
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 1.5, 1.5, 'FD');
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // ── Download ──
  const safeName = (employee.name || 'funcionario')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  doc.save(`cracha_${safeName}.pdf`);
}
