import { useEffect, useState } from 'react';

/**
 * Hook for reading/writing localStorage with sync across tabs
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key ${key}:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T): void => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));

      // Broadcast to other tabs
      window.dispatchEvent(
        new CustomEvent('localStorage-change', {
          detail: { key, value },
        }),
      );
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
    }
  };

  const removeValue = (): void => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);

      // Broadcast to other tabs
      window.dispatchEvent(
        new CustomEvent('localStorage-change', {
          detail: { key, value: null },
        }),
      );
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
    }
  };

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage change for key ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
