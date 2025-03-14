import React from 'react';
import { Sparkles } from "lucide-react";

const RewardBadge = ({ type, reward, theSymbolOfReward }) => {
  if (!reward) return null;

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const isRental = type === 'Renting' || type === 'Rentals';
  const text = isRental ? 'Reward:' : 'Reward:';
  const rewardValue = formatNumberWithCommas((reward * 1e-18).toFixed(2));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        <span className="text-lg font-semibold text-emerald-400">
          {text}
        </span>
      </div>
      
      <div className="rounded-full">
        <span className="text-lg font-bold text-amber-400">
          {isRental ? `Approximately ${rewardValue}` : rewardValue} {theSymbolOfReward}
          {isRental && ' per day'}
        </span>
      </div>
    </div>
  );
};

export default RewardBadge;