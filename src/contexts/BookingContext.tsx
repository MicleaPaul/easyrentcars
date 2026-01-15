import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LocationData {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isCustom: boolean;
  fee: number;
  inGraz: boolean;
}

export interface BookingContextData {
  pickupLocation: LocationData | null;
  returnLocation: LocationData | null;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  category: string;
  contractNumber: string;
  setPickupLocation: (location: LocationData | null) => void;
  setReturnLocation: (location: LocationData | null) => void;
  setPickupDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPickupTime: (time: string) => void;
  setReturnTime: (time: string) => void;
  setCategory: (category: string) => void;
  setContractNumber: (number: string) => void;
  clearBookingData: () => void;
  getTotalLocationFees: () => number;
}

const BookingContext = createContext<BookingContextData | undefined>(undefined);

const BOOKING_DATA_KEY = 'eazyrent_booking_data';

const defaultLocationData: LocationData = {
  name: 'Firmensitz',
  address: 'Graz Center',
  isCustom: false,
  fee: 0,
  inGraz: true,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [pickupLocation, setPickupLocationState] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.pickupLocation || defaultLocationData;
      } catch {
        return defaultLocationData;
      }
    }
    return defaultLocationData;
  });

  const [returnLocation, setReturnLocationState] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.returnLocation || defaultLocationData;
      } catch {
        return defaultLocationData;
      }
    }
    return defaultLocationData;
  });

  const [pickupDate, setPickupDateState] = useState<string>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.pickupDate || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const [returnDate, setReturnDateState] = useState<string>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.returnDate || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const [pickupTime, setPickupTimeState] = useState<string>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.pickupTime || '10:00';
      } catch {
        return '10:00';
      }
    }
    return '10:00';
  });

  const [returnTime, setReturnTimeState] = useState<string>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.returnTime || '10:00';
      } catch {
        return '10:00';
      }
    }
    return '10:00';
  });

  const [category, setCategoryState] = useState<string>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.category || 'all';
      } catch {
        return 'all';
      }
    }
    return 'all';
  });

  const [contractNumber, setContractNumberState] = useState<string>(() => {
    const saved = localStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.contractNumber || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  useEffect(() => {
    const bookingData = {
      pickupLocation,
      returnLocation,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      category,
      contractNumber,
    };
    localStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(bookingData));
  }, [
    pickupLocation,
    returnLocation,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    category,
    contractNumber,
  ]);

  const setPickupLocation = (location: LocationData | null) => {
    setPickupLocationState(location);
  };

  const setReturnLocation = (location: LocationData | null) => {
    setReturnLocationState(location);
  };

  const setPickupDate = (date: string) => {
    setPickupDateState(date);
  };

  const setReturnDate = (date: string) => {
    setReturnDateState(date);
  };

  const setPickupTime = (time: string) => {
    setPickupTimeState(time);
  };

  const setReturnTime = (time: string) => {
    setReturnTimeState(time);
  };

  const setCategory = (cat: string) => {
    setCategoryState(cat);
  };

  const setContractNumber = (number: string) => {
    setContractNumberState(number);
  };

  const clearBookingData = () => {
    setPickupLocationState(defaultLocationData);
    setReturnLocationState(defaultLocationData);
    setPickupDateState('');
    setReturnDateState('');
    setPickupTimeState('10:00');
    setReturnTimeState('10:00');
    setCategoryState('all');
    setContractNumberState('');
    localStorage.removeItem(BOOKING_DATA_KEY);
  };

  const getTotalLocationFees = () => {
    const pickupFee = pickupLocation?.fee || 0;
    const returnFee = returnLocation?.fee || 0;
    return pickupFee + returnFee;
  };

  return (
    <BookingContext.Provider
      value={{
        pickupLocation,
        returnLocation,
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
        category,
        contractNumber,
        setPickupLocation,
        setReturnLocation,
        setPickupDate,
        setReturnDate,
        setPickupTime,
        setReturnTime,
        setCategory,
        setContractNumber,
        clearBookingData,
        getTotalLocationFees,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
