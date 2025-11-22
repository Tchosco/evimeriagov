import React from 'react';
import { CabinetMember } from '../types';
import { Button } from './Button';

interface CabinetScreenProps {
  cabinet: CabinetMember[];
  treasury: number;
  onHireFire: (id: string) => void;
}

export const CabinetScreen: React.FC<CabinetScreenProps> = ({ cabinet, treasury, onHireFire }) => {
  return (
    <div className="bg-gov-800 border border-gov-700 rounded-lg p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Government Cabinet</h2>
        <div className="bg-gov-900 px-3 py-1 rounded text-sm text-gray-400 border border-gov-700">
            Total Salaries: <span className="text-red-400">-${cabinet.filter(c => c.hired).reduce((sum, c) => sum + c.salary, 0)}/mo</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cabinet.map(member => (
          <div key={member.id} className={`relative flex flex-col p-6 rounded-xl border-2 transition-all ${member.hired ? 'bg-gov-700 border-gov-accent shadow-lg shadow-yellow-900/10' : 'bg-gov-900 border-gov-700 grayscale opacity-80'}`}>
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{member.title}</div>
              <h3 className="text-2xl font-bold text-white">{member.name}</h3>
              <p className="text-sm text-gray-400 mt-2 italic">"{member.description}"</p>
            </div>

            <div className="flex-1 space-y-4">
                <div className="bg-gov-800 p-3 rounded border border-gov-600">
                    <div className="text-xs text-gray-500 uppercase">Bonus Effect</div>
                    <div className="text-gov-accent font-bold">{member.bonusText}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-300 border-t border-gov-600 pt-2">
                    <span>Monthly Salary:</span>
                    <span className="font-mono">${member.salary}</span>
                </div>
            </div>

            <div className="mt-6">
              <Button 
                variant={member.hired ? "danger" : "primary"} 
                className="w-full"
                onClick={() => onHireFire(member.id)}
                disabled={!member.hired && treasury < member.salary}
              >
                {member.hired ? "Dismiss Secretary" : "Hire Secretary"}
              </Button>
              {!member.hired && treasury < member.salary && (
                  <p className="text-xs text-red-500 text-center mt-2">Insufficient funds</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};