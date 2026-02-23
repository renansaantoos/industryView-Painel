// Badge generator stub — full implementation pending (requires qrcode package)

interface BadgeData {
  id: number | string;
  name: string;
  matricula?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  profile_picture?: string | null;
  email?: string | null;
}

export async function generateBadgePDF(_data: BadgeData): Promise<void> {
  console.warn('generateBadgePDF: qrcode package not installed. Badge generation is not available yet.');
}
