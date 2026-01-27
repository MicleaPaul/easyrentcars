import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';
import { LocationData } from '../contexts/BookingContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData) => void;
  label: string;
}

const staticLocations = [
  {
    id: 'airport',
    name: 'Flughafen',
    address: 'Flughafenstraße 51, 8073 Feldkirchen bei Graz',
    latitude: 46.9911,
    longitude: 15.4396,
    fee: 20,
    inGraz: true,
  },
  {
    id: 'mainStation',
    name: 'Hauptbahnhof',
    address: 'Europaplatz 12, 8020 Graz',
    latitude: 47.0721,
    longitude: 15.4397,
    fee: 20,
    inGraz: true,
  },
];

export function LocationPicker({ value, onChange, label }: LocationPickerProps) {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const predefinedLocations = useMemo(() => {
    const contactInfo = settings.contact_info;
    const headquartersAddress = contactInfo?.address
      ? `${contactInfo.address.street || ''}, ${contactInfo.address.postalCode} ${contactInfo.address.city}`.trim()
      : 'Alte Poststraße 286, 8053 Graz';

    return [
      {
        id: 'headquarters',
        name: 'Firmensitz',
        address: headquartersAddress,
        latitude: 47.0707,
        longitude: 15.4395,
        fee: 0,
        inGraz: true,
      },
      ...staticLocations,
    ];
  }, [settings.contact_info]);
  const [selectedType, setSelectedType] = useState<'predefined' | 'custom'>(
    value?.isCustom ? 'custom' : 'predefined'
  );
  const [customAddress, setCustomAddress] = useState(value?.address || '');
  const [showInfo, setShowInfo] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const handlePredefinedSelect = (locationName: string) => {
    const location = predefinedLocations.find((loc) => loc.name === locationName);
    if (location) {
      onChange({
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        fee: location.fee,
        inGraz: location.inGraz,
        isCustom: false,
      });
    }
  };

  const handleCustomAddressChange = (address: string) => {
    setCustomAddress(address);

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      // All custom addresses are charged 20 EUR, regardless of location
      onChange({
        name: 'Custom Location',
        address: address,
        latitude: 47.0707,
        longitude: 15.4395,
        fee: 20,
        inGraz: false,
        isCustom: true,
      });
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleCustomCardClick = () => {
    setSelectedType('custom');
    setTimeout(() => {
      if (customInputRef.current) {
        customInputRef.current.focus();
        customInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  useEffect(() => {
    if (selectedType === 'custom' && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [selectedType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-white font-semibold text-lg">{label}</label>
        <button
          type="button"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={() => setShowInfo(!showInfo)}
          className="relative text-[#D4AF37] hover:text-[#F4D03F] transition-colors"
          aria-label="Location information"
        >
          <Info className="w-5 h-5" />
          {showInfo && (
            <div className="absolute bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-3rem)] translate-x-[calc(-100%+1.25rem)] p-4 bg-[#0B0C0F] border-2 border-[#D4AF37]/30 rounded-lg shadow-xl z-50">
              <p className="text-white font-semibold text-sm mb-2">
                {t('locationPicker.infoTitle')}
              </p>
              <p className="text-xs text-[#9AA0A6] leading-relaxed">
                {t('locationPicker.info')}
              </p>
            </div>
          )}
        </button>
      </div>

      <div className="flex gap-2 sm:gap-3 mb-4">
        <button
          type="button"
          onClick={() => setSelectedType('predefined')}
          className={`flex-1 py-3 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
            selectedType === 'predefined'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black shadow-lg'
              : 'bg-[#111316] text-[#9AA0A6] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] hover:scale-[1.02]'
          }`}
        >
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t('locationPicker.predefined')}</span>
          <span className="inline xs:hidden">Standard</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('custom')}
          className={`flex-1 py-3 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
            selectedType === 'custom'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black shadow-lg'
              : 'bg-[#111316] text-[#9AA0A6] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] hover:scale-[1.02]'
          }`}
        >
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t('locationPicker.custom')}</span>
          <span className="inline xs:hidden">Custom</span>
        </button>
      </div>

      {selectedType === 'predefined' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {predefinedLocations.map((location) => (
            <button
              key={location.name}
              type="button"
              onClick={() => handlePredefinedSelect(location.name)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left bg-gradient-to-br from-[#111316] to-[#0B0C0F] ${
                value?.name === location.name && !value?.isCustom
                  ? 'border-[#D4AF37] shadow-xl scale-[1.02]'
                  : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:scale-[1.01] hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`w-6 h-6 flex-shrink-0 ${
                  value?.name === location.name && !value?.isCustom ? 'text-[#D4AF37]' : 'text-[#9AA0A6]'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-lg font-bold mb-1 ${
                    value?.name === location.name && !value?.isCustom ? 'text-white' : 'text-white'
                  }`}>
                    {t(`locationPicker.location.${location.id}`)}
                  </p>
                  <p className="text-sm text-[#9AA0A6] break-words line-clamp-2">
                    {location.address}
                  </p>
                  {location.fee > 0 && (
                    <span className="inline-block mt-2 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded">
                      +€{location.fee}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomCardClick}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left bg-gradient-to-br from-[#111316] to-[#0B0C0F] ${
              selectedType === 'custom'
                ? 'border-[#D4AF37] shadow-xl scale-[1.02]'
                : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:scale-[1.01] hover:shadow-lg'
            }`}
          >
            <div className="flex items-start gap-3">
              <Navigation className={`w-6 h-6 flex-shrink-0 ${
                selectedType === 'custom' ? 'text-[#D4AF37]' : 'text-[#9AA0A6]'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold mb-1 text-white">
                  {t('locationPicker.customLocationTitle')}
                </p>
                <p className="text-sm text-[#9AA0A6]">
                  {t('locationPicker.customLocationDesc')}
                </p>
                <span className="inline-block mt-2 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded">
                  +€20
                </span>
              </div>
            </div>
          </button>
        </div>
      ) : null}

      {selectedType === 'custom' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              {t('locationPicker.enterAddress')}
            </label>
            <input
              ref={customInputRef}
              type="text"
              value={customAddress}
              onChange={(e) => handleCustomAddressChange(e.target.value)}
              placeholder={t('locationPicker.addressPlaceholder')}
              className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border-2 border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
            />
          </div>
          {customAddress && (
            <div className="p-6 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br from-[#111316] via-[#0F1014] to-[#0B0C0F] border-[#D4AF37]/60 shadow-xl">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 flex-shrink-0 text-[#D4AF37]" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-bold text-lg">
                      {t('locationPicker.customAddressFeeTitle')}
                    </p>
                    <span className="px-4 py-1.5 rounded-full font-bold text-base bg-[#D4AF37]/20 text-[#D4AF37]">
                      €20
                    </span>
                  </div>
                  <p className="text-sm text-[#9AA0A6]">
                    {t('locationPicker.customAddressFeeDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
