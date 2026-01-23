import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ItemCondition } from '../types/item';

export interface WizardFormData {
  title: string;
  description: string;
  category: string | null;
  condition: ItemCondition | null;
  price: string;
  currency: string;
  locationLabel: string | null;
  locationCoords: { lat: number | null; lng: number | null };
  imageUris: string[]; // Store image URIs in context to persist across screens
}

interface WizardFormContextValue {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  resetFormData: () => void;
  getFormData: () => WizardFormData;
  setImageUris: (uris: string[]) => void;
  addImageUris: (uris: string[]) => void;
}

const defaultFormData: WizardFormData = {
  title: '',
  description: '',
  category: null,
  condition: null,
  price: '',
  currency: 'USD',
  locationLabel: null,
  locationCoords: { lat: null, lng: null },
  imageUris: [],
};

const WizardFormContext = createContext<WizardFormContextValue | undefined>(undefined);

export const WizardFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData);

  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  const getFormData = useCallback(() => {
    return formData;
  }, [formData]);

  const setImageUris = useCallback((uris: string[]) => {
    setFormData((prev) => ({ ...prev, imageUris: uris }));
  }, []);

  const addImageUris = useCallback((uris: string[]) => {
    setFormData((prev) => {
      const existingUris = new Set(prev.imageUris);
      const newUris = uris.filter((uri) => !existingUris.has(uri));
      return { ...prev, imageUris: [...prev.imageUris, ...newUris] };
    });
  }, []);

  const value = useMemo<WizardFormContextValue>(
    () => ({
      formData,
      updateFormData,
      resetFormData,
      getFormData,
      setImageUris,
      addImageUris,
    }),
    [formData, updateFormData, resetFormData, getFormData, setImageUris, addImageUris]
  );

  return <WizardFormContext.Provider value={value}>{children}</WizardFormContext.Provider>;
};

export function useWizardForm(): WizardFormContextValue {
  const ctx = useContext(WizardFormContext);
  if (!ctx) {
    throw new Error('useWizardForm must be used within a WizardFormProvider');
  }
  return ctx;
}
