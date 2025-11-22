import React from 'react';
import { Law } from '../types';
import { Button } from './Button';

interface LawBookProps {
  laws: Law[];
  politicalCapital: number;
  onToggleLaw: (lawId: string) => void;
}

export const LawBook: React.FC<LawBookProps> = ({ laws, politicalCapital, onToggleLaw }) => {
  return (
    <div className="bg-gov-800 border border-gov-700 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Legislative Assembly</h2>
        <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm">PC: {politicalCapital}</span>
      </div>
      
      <div className="space-y-3 overflow-auto flex-1">
        {laws.map(law => (
          <div key={law.id} className={`p-3 rounded border transition-all ${law.isActive ? 'bg-gov-700 border-gov-accent' : 'bg-gov-900 border-gov-700'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-bold ${law.isActive ? 'text-gov-accent' : 'text-gray-300'}`}>{law.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{law.description}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-red-300">Cost: ${law.costPerTurn}/mo</span>
                  {law.effects.approval && <span className={law.effects.approval > 0 ? 'text-green-400' : 'text-red-400'}>Appr: {law.effects.approval > 0 ? '+' : ''}{law.effects.approval}</span>}
                  {law.effects.revenueMultiplier && <span className="text-yellow-400">Rev: x{law.effects.revenueMultiplier}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                 <Button 
                   variant={law.isActive ? "danger" : "success"}
                   size="sm"
                   disabled={!law.isActive && politicalCapital < 10}
                   onClick={() => onToggleLaw(law.id)}
                 >
                   {law.isActive ? "Repeal" : "Enact"}
                 </Button>
                 {!law.isActive && <span className="text-[10px] text-gray-500 text-center">Cost: 10 PC</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};