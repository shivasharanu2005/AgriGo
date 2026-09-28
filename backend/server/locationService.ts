export interface LocationDetails {
  lat: number;
  lng: number;
  displayName: string;
  village?: string;
  taluk?: string;
  district: string;
  state: string;
  country: string;
  postcode?: string;
}

export async function reverseGeocodeLocation(lat: number, lng: number): Promise<LocationDetails> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AgriVisionAI-Applet/2.0 (SmartIndiaHackathon Agriculture Platform)',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.town || '';
      const taluk = addr.county || addr.subdistrict || addr.tehsil || '';
      const district = addr.state_district || addr.district || addr.city || addr.county || 'Local Region';
      const state = addr.state || 'India';
      const country = addr.country || 'India';
      const postcode = addr.postcode || '';

      const localLabel = village ? `${village}, ${district}` : `${district}, ${state}`;

      return {
        lat,
        lng,
        displayName: localLabel,
        village,
        taluk,
        district,
        state,
        country,
        postcode,
      };
    }
  } catch (err) {
    // Graceful fallback to formatted coordinates
  }

  // Fallback representation
  const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngFormatted = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;

  return {
    lat,
    lng,
    displayName: `GPS (${latFormatted}, ${lngFormatted})`,
    district: 'Current Region',
    state: 'Active Coordinates',
    country: 'India',
  };
}

export async function searchLocations(query: string): Promise<LocationDetails[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&countrycodes=in&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AgriVisionAI-Applet/2.0 (SmartIndiaHackathon Agriculture Platform)',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const results = await res.json();
      return results.map((item: any) => {
        const addr = item.address || {};
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const village = addr.village || addr.hamlet || addr.suburb || addr.town || '';
        const taluk = addr.county || addr.subdistrict || '';
        const district = addr.state_district || addr.district || addr.city || item.name || 'Region';
        const state = addr.state || '';

        return {
          lat,
          lng,
          displayName: item.display_name.split(',').slice(0, 3).join(',').trim(),
          village,
          taluk,
          district,
          state,
          country: addr.country || 'India',
          postcode: addr.postcode || '',
        };
      });
    }
  } catch {
    // fallback empty
  }

  return [];
}
