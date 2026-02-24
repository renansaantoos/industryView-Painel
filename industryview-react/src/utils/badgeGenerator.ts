import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface TrainingItem {
  name: string;
  date: string;
  validity?: string | null;
}

interface BadgeData {
  id: number | string;
  name: string;
  cpf?: string | null;
  matricula?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  profile_picture?: string | null;
  email?: string | null;
  trainings?: TrainingItem[];
}

// Padrão empresarial CR80 (aprox. 85.60 x 53.98 mm)
// Documento com frente + verso lado a lado para impressão e recorte
const PANEL_W = 85.6;
const PANEL_H = 54;
const DOC_W   = PANEL_W * 2;
const DOC_H   = PANEL_H;
const L = 0;
const R = PANEL_W;

const COLOR_NAVY       = '#1a2744';
const COLOR_NAVY_LIGHT = '#2a3b66';
const COLOR_WHITE      = '#ffffff';
const COLOR_TEXT_DARK  = '#1a1a2e';
const COLOR_TEXT_MUTED = '#6b7a99';
const COLOR_ACCENT     = '#0ea5e9';
const COLOR_SEPARATOR  = '#e2e8f0';
const COLOR_ROW_ALT    = '#f1f5f9';
const COLOR_FIELD_SEP  = '#f1f5f9';

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
}
function setFill(doc: jsPDF, hex: string) {
  const [r,g,b] = hexToRgb(hex); doc.setFillColor(r,g,b);
}
function setTextColor(doc: jsPDF, hex: string) {
  const [r,g,b] = hexToRgb(hex); doc.setTextColor(r,g,b);
}
function setStroke(doc: jsPDF, hex: string) {
  const [r,g,b] = hexToRgb(hex); doc.setDrawColor(r,g,b);
}
function safeField(v: string|null|undefined): string {
  return v && v.trim() ? v.trim() : '—';
}
function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g,'');
  return d.length === 11 ? `${d.slice(0,3)}.***.***-${d.slice(9)}` : cpf;
}
function formatDate(s: string): string {
  try {
    return new Date(s.includes('T') ? s : `${s}T00:00:00`)
      .toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
  } catch { return s; }
}

// ── Image utilities ───────────────────────────────────────────────────────────

async function loadImageAsDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, (img.naturalWidth-size)/2, (img.naturalHeight-size)/2, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`load failed: ${url}`));
    img.src = url;
  });
}

async function createCircularImageDataUrl(src: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('clip failed'));
    img.src = src;
  });
}

async function createPlaceholderCircleDataUrl(size: number): Promise<string> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size/2, cy = size/2;
    ctx.beginPath(); ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    ctx.fillStyle = COLOR_NAVY_LIGHT; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy*0.72, size*0.18, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy*1.55, size*0.32, Math.PI, 0);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    resolve(canvas.toDataURL('image/png'));
  });
}

// ── Panel header (navy + accent line) ────────────────────────────────────────

function drawPanelHeader(doc: jsPDF, offsetX: number, headerH: number, subtitle?: string) {
  const cx = offsetX + PANEL_W / 2;
  setFill(doc, COLOR_NAVY);
  doc.rect(offsetX, 0, PANEL_W, headerH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(subtitle ? 8.5 : 9.5);
  setTextColor(doc, COLOR_WHITE);
  doc.text('INDUSTRYVIEW', cx, subtitle ? 6.8 : headerH / 2 + 1.8, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(190, 214, 242);
    doc.text(subtitle, cx, 10.8, { align: 'center' });
  }

  const [ar, ag, ab] = hexToRgb(COLOR_ACCENT);
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.5);
  doc.line(offsetX, headerH, offsetX + PANEL_W, headerH);
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateBadgePDF(data: BadgeData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [DOC_W, DOC_H] });

  const displayName = data.name || '—';
  const trainings   = data.trainings ?? [];
  const qrContent   = data.matricula?.trim() || String(data.id);

  const [photoDataUrl, qrDataUrl] = await Promise.all([
    (async () => {
      try {
        if (data.profile_picture) {
          const raw = await loadImageAsDataUrl(data.profile_picture);
          return await createCircularImageDataUrl(raw, 260);
        }
        return await createPlaceholderCircleDataUrl(260);
      } catch { return null; }
    })(),
    (async () => {
      try {
        return await QRCode.toDataURL(qrContent, {
          margin: 1, width: 220,
          color: { dark: COLOR_NAVY, light: COLOR_WHITE },
        });
      } catch { return null; }
    })(),
  ]);

  // Fundo branco
  setFill(doc, COLOR_WHITE);
  doc.rect(0, 0, DOC_W, DOC_H, 'F');

  // Linha de dobra central (tracejada)
  setStroke(doc, '#b6c7df');
  doc.setLineWidth(0.4);
  for (let y = 0; y < DOC_H; y += 3.5) {
    doc.line(PANEL_W, y, PANEL_W, Math.min(y + 1.8, DOC_H));
  }

  // ────────────────────────────────────────────────────────────────────────
  // FRENTE — Crachá empresarial
  // ────────────────────────────────────────────────────────────────────────
  const HEADER_H = 12;
  const PAD = 3;
  const PHOTO_SIZE = 20;
  const PHOTO_X = L + PAD;
  const PHOTO_Y = HEADER_H + 2;
  const PHOTO_CX = PHOTO_X + PHOTO_SIZE / 2;
  const PHOTO_CY = PHOTO_Y + PHOTO_SIZE / 2;
  const INFO_X = PHOTO_X + PHOTO_SIZE + 3;
  const INFO_RX = L + PANEL_W - PAD;
  const [ar, ag, ab] = hexToRgb(COLOR_ACCENT);

  drawPanelHeader(doc, L, HEADER_H, 'CRACHA EMPRESARIAL');

  // moldura sutil
  setStroke(doc, COLOR_SEPARATOR);
  doc.setLineWidth(0.25);
  doc.roundedRect(L + 1.2, 1.2, PANEL_W - 2.4, PANEL_H - 2.4, 2, 2, 'S');

  // foto
  setFill(doc, COLOR_WHITE);
  doc.circle(PHOTO_CX, PHOTO_CY, (PHOTO_SIZE + 1.5) / 2, 'F');
  if (photoDataUrl) {
    doc.addImage(photoDataUrl, 'PNG', PHOTO_X, PHOTO_Y, PHOTO_SIZE, PHOTO_SIZE);
  } else {
    setFill(doc, COLOR_NAVY_LIGHT);
    doc.circle(PHOTO_CX, PHOTO_CY, PHOTO_SIZE / 2, 'F');
  }

  // nome + função
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTextColor(doc, COLOR_TEXT_DARK);
  doc.text(displayName, INFO_X, HEADER_H + 4.5, { maxWidth: INFO_RX - INFO_X });

  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.35);
  doc.line(INFO_X, HEADER_H + 6.2, INFO_RX, HEADER_H + 6.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  setTextColor(doc, COLOR_TEXT_MUTED);
  doc.text(safeField(data.cargo), INFO_X, HEADER_H + 9.8, { maxWidth: INFO_RX - INFO_X });

  // bloco de identificação
  const fields = [
    { label: 'MATRICULA', value: safeField(data.matricula) },
    { label: 'DEPARTAMENTO', value: safeField(data.departamento) },
    { label: 'CPF', value: data.cpf ? maskCpf(data.cpf) : '—' },
    { label: 'E-MAIL', value: safeField(data.email) },
  ];
  let fy = HEADER_H + 15;
  for (const field of fields) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.4);
    setTextColor(doc, COLOR_TEXT_MUTED);
    doc.text(field.label, INFO_X, fy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    setTextColor(doc, COLOR_TEXT_DARK);
    doc.text(field.value, INFO_X + 18, fy, { maxWidth: INFO_RX - (INFO_X + 18) });

    setStroke(doc, COLOR_FIELD_SEP);
    doc.setLineWidth(0.2);
    doc.line(INFO_X, fy + 2.4, INFO_RX, fy + 2.4);
    fy += 4.6;
  }

  // QR frente
  const FRONT_QR_SIZE = 11.5;
  const FRONT_QR_X = L + PAD;
  const FRONT_QR_Y = PANEL_H - PAD - FRONT_QR_SIZE;
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', FRONT_QR_X, FRONT_QR_Y, FRONT_QR_SIZE, FRONT_QR_SIZE);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.9);
  setTextColor(doc, COLOR_TEXT_MUTED);
  doc.text('ID: ' + qrContent, FRONT_QR_X + FRONT_QR_SIZE + 1.5, PANEL_H - 4.3, {
    maxWidth: INFO_RX - (FRONT_QR_X + FRONT_QR_SIZE + 1.5),
  });

  // ────────────────────────────────────────────────────────────────────────
  // VERSO — listagem de treinamentos
  // ────────────────────────────────────────────────────────────────────────
  drawPanelHeader(doc, R, HEADER_H, 'TREINAMENTOS');

  // fundo área útil
  setFill(doc, COLOR_ROW_ALT);
  doc.roundedRect(R + 2, HEADER_H + 2, PANEL_W - 4, PANEL_H - HEADER_H - 4, 1.8, 1.8, 'F');

  // cabeçalho da listagem
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  setTextColor(doc, COLOR_TEXT_DARK);
  doc.text('TREINAMENTO', R + PAD, HEADER_H + 7.4);
  doc.text('REALIZACAO', R + 58, HEADER_H + 7.4, { align: 'right' });
  doc.text('VALIDADE', R + PANEL_W - PAD, HEADER_H + 7.4, { align: 'right' });

  setStroke(doc, COLOR_SEPARATOR);
  doc.setLineWidth(0.25);
  doc.line(R + PAD, HEADER_H + 9.3, R + PANEL_W - PAD, HEADER_H + 9.3);

  const visibleTrainings = trainings.slice(0, 7);
  if (visibleTrainings.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.6);
    setTextColor(doc, COLOR_TEXT_MUTED);
    doc.text('Nenhum treinamento informado.', R + PAD, HEADER_H + 14.5);
  } else {
    let ty = HEADER_H + 13.8;
    for (const t of visibleTrainings) {
      const shortName = t.name.length > 22 ? t.name.slice(0, 21) + '…' : t.name;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.4);
      setTextColor(doc, COLOR_TEXT_DARK);
      doc.text('• ' + shortName, R + PAD, ty);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      setTextColor(doc, COLOR_TEXT_MUTED);
      const validityText = t.validity ? formatDate(t.validity) : '—';
      doc.text(formatDate(t.date), R + 58, ty, { align: 'right' });
      doc.text(validityText, R + PANEL_W - PAD, ty, { align: 'right' });

      setStroke(doc, COLOR_FIELD_SEP);
      doc.setLineWidth(0.2);
      doc.line(R + PAD, ty + 1.8, R + PANEL_W - PAD, ty + 1.8);

      ty += 4.9;
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const safeName = displayName.replace(/[^a-zA-Z0-9_\- ]/g,'').trim().replace(/\s+/g,'_');
  doc.save(`cracha_${safeName}.pdf`);
}
