import React from 'react';
import { GameSession } from '../types';
import { Button } from './Button';

interface TopBarProps {
  session: GameSession;
  onEndTurn: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ session, onEndTurn }) => {
  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  return (
    <div className="w-full bg-gov-800 border-b border-gov-700 p-3 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-lg">
      <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
        <div className="bg-gov-900 px-3 py-1.5 rounded border border-gov-700 whitespace-nowrap">
          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Date</span>
          <span className="text-base font-mono text-white">{String(session.month).padStart(2, '0')}/{session.year}</span>
        </div>
        
        <div className="bg-gov-900 px-3 py-1.5 rounded border border-gov-700 whitespace-nowrap">
          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Treasury</span>
          <span className={`text-base font-mono ${session.treasury < 0 ? 'text-red-400' : 'text-gov-accent'}`}>
            {formatMoney(session.treasury)}
          </span>
        </div>

        <div className="bg-gov-900 px-3 py-1.5 rounded border border-gov-700 whitespace-nowrap hidden sm:block">
          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Pol. Capital</span>
          <span className="text-base font-mono text-blue-400">
            {session.politicalCapital} 🏛
          </span>
        </div>
      </div>

      {/* Faction Bar */}
      <div className="flex-1 flex justify-center items-center gap-6 hidden lg:flex">
         <div className="flex flex-col items-center">
            <div className="text-[10px] text-gray-400 uppercase mb-1">Elite</div>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${session.factions.elite}%`}}></div>
            </div>
         </div>
         <div className="flex flex-col items-center">
            <div className="text-[10px] text-gray-400 uppercase mb-1">People</div>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${session.factions.people}%`}}></div>
            </div>
         </div>
         <div className="flex flex-col items-center">
            <div className="text-[10px] text-gray-400 uppercase mb-1">Servants</div>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${session.factions.servants}%`}}></div>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        <div className="text-right hidden xl:block">
          <div className="text-[10px] text-gray-400">Population</div>
          <div className="font-bold text-white">{formatNumber(session.totalPopulation)}</div>
        </div>

        <Button variant="primary" onClick={onEndTurn} className="shadow-lg shadow-yellow-900/20 whitespace-nowrap">
          End Month
        </Button>
      </div>
    </div>
  );
};