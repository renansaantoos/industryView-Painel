import axios from 'axios';
import { logger } from '../../utils/logger';

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  fixed: boolean;
  type: string;
}

export async function fetchPublicHolidays(
  year: number,
  countryCode: string,
): Promise<{ date: string; name: string; type: string; recurring: boolean }[]> {
  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const response = await axios.get<NagerHoliday[]>(url, { timeout: 10000 });
    return response.data.map((h) => ({
      date: h.date,
      name: h.localName || h.name,
      type: 'national',
      recurring: h.fixed,
    }));
  } catch (error) {
    logger.warn({ error, year, countryCode }, 'Failed to fetch holidays from Nager.Date API');
    return [];
  }
}
