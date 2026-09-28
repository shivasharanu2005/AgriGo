export type RegistrationSuccessRecord = {
  id: string;
  name: string;
  email: string;
  signedIn: boolean;
  savedAt: string;
};

const STORAGE_KEY = 'agrivision_registration_success';
const fallbackStore = new Map<string, string>();

const getStorage = () => {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    const storage = globalThis.localStorage;
    if (storage) {
      return storage;
    }
  }

  return {
    getItem: (key: string) => fallbackStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      fallbackStore.set(key, value);
    },
    removeItem: (key: string) => {
      fallbackStore.delete(key);
    },
  };
};

export function persistRegistrationSuccess(user: { id?: string; name?: string; email?: string }) {
  const record: RegistrationSuccessRecord = {
    id: user?.id || 'unknown-user',
    name: user?.name || 'Farmer',
    email: user?.email || '',
    signedIn: true,
    savedAt: new Date().toISOString(),
  };

  const storage = getStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function readRegistrationSuccess(): RegistrationSuccessRecord | null {
  try {
    const storage = getStorage();
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegistrationSuccessRecord;
    return parsed && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

export function clearRegistrationSuccess() {
  const storage = getStorage();
  storage.removeItem(STORAGE_KEY);
}
