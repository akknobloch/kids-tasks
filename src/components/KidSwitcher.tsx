import type { Kid } from '../types';

interface KidSwitcherProps {
  kids: Kid[];
  selectedKidId: string | null;
  onSelectKid: (kidId: string) => void;
  size?: 'default' | 'compact';
}

export default function KidSwitcher({ kids, selectedKidId, onSelectKid, size = 'default' }: KidSwitcherProps) {
  const circleSize = size === 'compact' ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-20 h-20 sm:w-24 sm:h-24';
  const labelWidth = size === 'compact' ? 'w-14 sm:w-16 text-xs sm:text-sm' : 'w-20 sm:w-24 text-sm';
  const ringOffset = size === 'compact' ? 'ring-offset-3' : 'ring-offset-4';
  const itemMargin = size === 'compact' ? 'mx-2 my-2 sm:mx-3 sm:my-3' : 'mx-2 my-2 sm:mx-3 sm:my-3';
  const wrapMargin = size === 'compact' ? '-mx-2 -my-2 sm:-mx-3 sm:-my-3' : '-mx-2 -my-2 sm:-mx-3 sm:-my-3';

  return (
    <div className={`flex flex-wrap justify-center ${wrapMargin}`}>
      {kids.map(kid => (
        <button
          key={kid.id}
          onClick={() => onSelectKid(kid.id)}
          className={`relative ${circleSize} ${itemMargin} rounded-full border-4 transition-all duration-200 shadow-xl overflow-hidden focus:outline-none ${
            selectedKidId === kid.id
              ? `ring-4 ${ringOffset} ring-indigo-300 shadow-2xl scale-110`
              : 'ring-2 ring-transparent opacity-60 hover:opacity-100'
          }`}
          style={{ backgroundColor: kid.color || '#fcd34d' }}
        >
          <span className="absolute inset-0 opacity-30 bg-gradient-to-br from-white to-transparent"></span>
          {kid.photoDataUrl ? (
            <img src={kid.photoDataUrl} alt={kid.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center text-white font-extrabold text-xl">
              {kid.name[0]}
            </div>
          )}
        </button>
      ))}
      <div className={`w-full flex flex-wrap justify-center ${wrapMargin} font-semibold text-slate-800 -mt-1 sm:-mt-2`}>
        {kids.map(kid => (
          <div key={`${kid.id}-label`} className={`${labelWidth} ${itemMargin} text-center leading-tight`}>
            {kid.name}
          </div>
        ))}
      </div>
    </div>
  );
}
