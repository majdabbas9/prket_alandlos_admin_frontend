import { useState, useEffect } from 'react';

export interface Stat {
  value: string;
  label: string;
}

export interface StoreInfo {
  showPrice: boolean;
  storeOpeningTime: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  description?: string;
  stats?: Stat[];
  showroomEyebrow?: string;
  showroomTitle?: string;
  showroomDescription?: string;
  contactEyebrow?: string;
  contactTitle?: string;
  contactDescription?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

export function parseOpeningTime(timeStr: string) {
  const regex = /^(.*?)\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\s*—\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))$/i;
  const match = timeStr.match(regex);
  if (match) {
    return {
      days: match[1].trim(),
      time: match[2].trim(),
    };
  }
  return {
    days: timeStr,
    time: '',
  };
}

export function useInfo() {
  const [info, setInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/info`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch store info');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setInfo(data.data);
        } else {
          throw new Error(data.error || 'Invalid API response');
        }
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { info, loading, error };
}
