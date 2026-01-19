import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../components';
import {VerifiedIcon,done_desktop} from '../assets';
const StoreBox = ({ store,enc }) => {
    const navigate = useNavigate();
    function processDescription(description, maxLength = 100)
  
  
    {
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
  className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 hover:shadow-2xl transition overflow-hidden"
>
  <div className="p-5">
    <h3 className="text-[#FFDD00] font-extrabold text-xl text-center truncate">
      {store.name}
    </h3>

    {/* Image */}
    <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      <img
        src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${store.picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
        className="w-full h-[250px] object-cover group-hover:scale-[1.02] transition"
        alt={store.name}
        loading="lazy"
      />
    </div>

    {/* Description */}
    <p className="mt-4 text-white/80 text-center text-sm leading-relaxed line-clamp-4 min-h-[80px]">
      {processDescription(store.description)}
    </p>

    {/* Verified */}
    {enc ? (
      <div className="mt-5 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200 border border-blue-400/20">
          <img src={done_desktop} className="w-4 h-4" alt="verified" />
          Verified
        </span>
      </div>
    ) : (
      <div className="mt-5 h-[28px]" />
    )}
  </div>
</div>

    );
};

export default StoreBox;