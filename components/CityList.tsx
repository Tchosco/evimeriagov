import React, { useState } from 'react';
import { GameCityEntity, ConstructionTask, Infrastructure } from '../types';
import { Button } from './Button';
import { getActionCosts, getConstructionCost, getConstructionDuration } from '../services/gameEngine';

interface CityListProps {
  cities: GameCityEntity[];
  treasury: number;
  queue: ConstructionTask[];
  hasWorksSecretary: boolean;
  onAction: (cityId: number, actionType: 'propaganda' | 'festival' | 'police') => void;
  onConstruct: (cityId: number, type: keyof Infrastructure) => void;
}

export const CityList: React.FC<CityListProps> = ({ cities, treasury, queue, hasWorksSecretary, onAction, onConstruct }) => {
  const [sortField, setSortField] = useState<keyof GameCityEntity>('population');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedCity, setExpandedCity] = useState<number | null>(null);

  const handleSort = (field: keyof GameCityEntity) => {
    if (sortField === field) setSortDesc(!sortDesc);
    else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const sortedCities = [...cities].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDesc ? valB - valA : valA - valB;
    }
    return 0;
  });

  const formatNum = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
  const formatMoney = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  const constructions: { key: keyof Infrastructure, label: string, icon: string }[] = [
      { key: 'hasAirport', label: 'Airport', icon: '✈️' },
      { key: 'hasPort', label: 'Seaport', icon: '⚓' },
      { key: 'hasRail', label: 'Railway', icon: '🚂' },
      { key: 'hasUniversity', label: 'University', icon: '🎓' },
      { key: 'hasBarracks', label: 'Barracks', icon: '🛡️' },
      { key: 'hasStadium', label: 'Stadium', icon: '🏟️' },
  ];

  return (
    <div className="bg-gov-800 border border-gov-700 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gov-700 bg-gov-900/50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">City Administration</h2>
        <div className="text-xs text-gray-400">
            {queue.length > 0 ? <span className="text-yellow-400">{queue.length} Projects Underway</span> : 'No Active Construction'}
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gov-900 sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('name')}>City</th>
              <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white hidden sm:table-cell" onClick={() => handleSort('deptName')}>Dept</th>
              <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer text-right hover:text-white" onClick={() => handleSort('population')}>Pop</th>
              <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center cursor-pointer hover:text-white" onClick={() => handleSort('approval')}>Aprv</th>
              <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-700">
            {sortedCities.map(city => {
              const costs = getActionCosts(city.population, city.approval);
              const activeConstruction = queue.find(t => t.cityId === city.id);
              const isExpanded = expandedCity === city.id;

              return (
                <React.Fragment key={city.id}>
                <tr className={`hover:bg-gov-700/50 transition-colors ${isExpanded ? 'bg-gov-700/30' : ''}`}>
                  <td className="p-3 font-medium text-gray-200">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {city.infrastructure.isCapital && <span title="State Capital" className="text-yellow-500">★</span>}
                            {city.name}
                        </div>
                        <div className="flex gap-1 mt-1 text-xs opacity-50">
                            {Object.entries(city.infrastructure).filter(([k, v]) => v && k !== 'isCapital').map(([k]) => (
                                <span key={k}>{constructions.find(c => c.key === k)?.icon}</span>
                            ))}
                        </div>
                        {activeConstruction && (
                            <div className="text-xs text-yellow-400 mt-1 animate-pulse">
                                🏗️ Building {constructions.find(c => c.key === activeConstruction.type)?.label} ({activeConstruction.turnsLeft}mo)
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="p-3 text-gray-400 text-sm hidden sm:table-cell">{city.deptName}</td>
                  <td className="p-3 text-right text-gray-300 font-mono text-sm">{formatNum(city.population)}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${city.approval > 60 ? 'bg-green-900 text-green-200' : city.approval < 40 ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                        {Math.round(city.approval)}%
                        </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedCity(isExpanded ? null : city.id)}>
                          {isExpanded ? 'Close' : 'Options'}
                      </Button>
                  </td>
                </tr>
                {isExpanded && (
                    <tr className="bg-gov-900/50 shadow-inner">
                        <td colSpan={5} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Short Term Actions */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-700 pb-1">Immediate Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            disabled={treasury < costs.propaganda}
                                            onClick={() => onAction(city.id, 'propaganda')}
                                            className="flex-1 bg-gov-800 border border-gov-700 p-2 rounded hover:bg-gov-700 disabled:opacity-50 flex flex-col items-center gap-1"
                                        >
                                            <span>📢 Propaganda</span>
                                            <span className="text-xs text-yellow-500">{formatMoney(costs.propaganda)}</span>
                                        </button>
                                        <button 
                                            disabled={treasury < costs.festival}
                                            onClick={() => onAction(city.id, 'festival')}
                                            className="flex-1 bg-gov-800 border border-gov-700 p-2 rounded hover:bg-gov-700 disabled:opacity-50 flex flex-col items-center gap-1"
                                        >
                                            <span>🎉 Festival</span>
                                            <span className="text-xs text-yellow-500">{formatMoney(costs.festival)}</span>
                                        </button>
                                        <button 
                                            disabled={treasury < costs.police}
                                            onClick={() => onAction(city.id, 'police')}
                                            className="flex-1 bg-gov-800 border border-gov-700 p-2 rounded hover:bg-gov-700 disabled:opacity-50 flex flex-col items-center gap-1"
                                        >
                                            <span>👮 Police</span>
                                            <span className="text-xs text-yellow-500">{formatMoney(costs.police)}</span>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Long Term Construction */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-700 pb-1">Infrastructure Projects {hasWorksSecretary && <span className="text-green-500 text-[10px]">(Discounted)</span>}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {constructions.map(c => {
                                            const hasIt = city.infrastructure[c.key];
                                            const isBuilding = activeConstruction?.type === c.key;
                                            const cost = getConstructionCost(c.key, hasWorksSecretary);
                                            const duration = getConstructionDuration(c.key);
                                            
                                            return (
                                                <button
                                                    key={c.key}
                                                    disabled={hasIt || !!activeConstruction || treasury < cost}
                                                    onClick={() => onConstruct(city.id, c.key)}
                                                    className={`text-xs p-2 rounded border flex justify-between items-center ${hasIt ? 'bg-green-900/20 border-green-900 text-green-400 cursor-default' : 'bg-gov-800 border-gov-600 hover:bg-gov-700'}`}
                                                >
                                                    <span className="flex items-center gap-1">{c.icon} {c.label}</span>
                                                    {!hasIt && !isBuilding && <span className="text-gray-400">{formatMoney(cost)}</span>}
                                                    {hasIt && <span>✓</span>}
                                                    {isBuilding && <span className="animate-pulse">Building...</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};