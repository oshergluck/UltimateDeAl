import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../components';
import { VerifiedIcon, done_desktop } from '../assets';

const StoreBox = ({ store, enc }) => {
  const navigate = useNavigate();

  function processDescription(description, maxLength = 100) {
    if (!description) return '';
    // Remove special formatting characters
    const cleanedDescription = description.replace(/[\$^~*]/g, '');
    // Truncate the description if it exceeds the maxLength
    if (cleanedDescription.length <= maxLength) return cleanedDescription;
    return cleanedDescription.substring(0, maxLength) + '...';
  }

  return (
    <div
      onClick={() => navigate("/shop/" + store.urlPath)}
      className="group relative cursor-pointer h-full"
    >
      {/* Animated Glow Border Effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-70 blur-sm transition duration-500 animate-gradient"></div>

      {/* Main Card Content */}
      <div className="relative h-full flex flex-col bg-[#0a0a0a] rounded-2xl border border-white/10 p-4 transition-all duration-300 group-hover:bg-[#121215]">
        
        {/* Header / Title */}
        <div className="mb-3 border-b border-white/5 pb-2">
          <h3 className="text-cyan-400 font-black text-lg text-center truncate uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
            {store.name}
          </h3>
        </div>

        {/* Image Container with "Scanline" Overlay */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/50">
          <img
            src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${store.picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
            alt={store.name}
            loading="lazy"
          />
          {/* Dark Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          
          {/* Tech decorative corner */}
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        </div>

        {/* Description */}
        <div className="mt-4 flex-grow">
          <p className="text-cyan-100/60 font-mono text-xs text-center leading-relaxed line-clamp-3 min-h-[60px]">
            {processDescription(store.description)}
          </p>
        </div>

        {/* Footer / Status */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-center items-center h-[30px]">
          {enc ? (
            <div className="flex items-center gap-2 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                System Verified
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Unverified Node
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreBox;