import { useState, useEffect } from 'react';
import { getAssetUrl } from '../lib/uploadAsset';

interface LogoProps {
  className?: string;
  alt?: string;
  onClick?: () => void;
  variant?: 'header' | 'footer';
}

export function Logo({
  className = '',
  alt = 'EasyRentCars Logo',
  onClick,
  variant = 'header'
}: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadLogo();
  }, []);

  async function loadLogo() {
    try {
      const url = await getAssetUrl('logoeasyrentcars.png', 'assets');
      setLogoUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading logo from Supabase:', err);
      setLogoUrl('/logoeasyrentcars.png');
      setIsLoading(false);
    }
  }

  const containerHeight = variant === 'header' ? '48px' : '32px';
  const containerWidth = variant === 'header' ? '180px' : '140px';

  if (isLoading) {
    return (
      <div
        className={`bg-[#D4AF37]/10 animate-pulse rounded ${className}`}
        style={{ height: containerHeight, width: containerWidth }}
      />
    );
  }

  if (error || !logoUrl) {
    return (
      <div
        className={`text-[#D4AF37] font-bold text-sm flex items-center ${className}`}
        style={{ height: containerHeight }}
      >
        EasyRentCars
      </div>
    );
  }

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ height: containerHeight }}
    >
      <img
        src={logoUrl}
        alt={alt}
        className="object-contain object-center"
        onClick={onClick}
        onError={() => setError(true)}
        loading="eager"
        style={{
          width: 'auto',
          height: '100%',
          maxHeight: containerHeight,
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
