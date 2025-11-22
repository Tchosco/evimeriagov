import React, { useState } from 'react';
import { GameSession, GameStateEntity, GameCityEntity } from '../types';

interface CensusProps {
  session: GameSession;
}

export const CensusScreen: React.FC<CensusProps> = ({ session }) => {
  const [spyState, setSpyState] = useState<string>("");

  // 1. Macro Stats (National)
  const totalCities = session.allCities.length;
  const totalPop = session.states.reduce((acc, s) => acc + s.population, 0);
  const totalAirports = session.allCities.filter(c => c.infrastructure.hasAirport).length;
  const totalPorts = session.allCities.filter(c => c.infrastructure.hasPort).length;
  const totalUnis = session.allCities.filter(c => c.infrastructure.hasUniversity).length;

  // 2. Leaderboards
  const formatNum = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
  
  const popRank = [...session.states].sort((a, b) => b.population - a.population);
  
  const getInfraScore = (stateName: string) => {
      const stateCities = session.allCities.filter(c => c.stateName === stateName);
      return stateCities.reduce((acc, c) => {
          let s = 0;
          if (c.infrastructure.hasAirport) s++;
          if (c.infrastructure.hasPort) s++;
          if (c.infrastructure.hasUniversity) s++;
          return acc + s;
      }, 0);
  };

  const infraRank = [...session.states].sort((a, b) => getInfraScore(b.name) - getInfraScore(a.name));

  const getUrbanRate = (s: GameStateEntity) => {
      const total = s.popRural + s.popUrban;
      return total > 0 ? (s.popUrban / total) * 100 : 0;
  };

  const urbanRank = [...session.states].sort((a, b) => getUrbanRate(b) - getUrbanRate(a));

  // Spy Data
  const spyCities = spyState ? session.allCities.filter(c => c.stateName === spyState).sort((a,b) => b.population - a.population) : [];

  const renderRankTable = (title: string, data: GameStateEntity[], valueFn: (s: GameStateEntity) => string | number) => (
      <div className="bg-gov-900 border border-gov-700 rounded overflow-hidden">
          <div className="p-2 bg-gov-800 font-bold text-xs text-gray-400 uppercase border-b border-gov-700">{title}</div>
          <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                  <tbody>
                      {data.map((s, i) => (
                          <tr key={s.id} className={`${s.name === session.playerState ? 'bg-blue-900/30 text-blue-200 font-bold' : 'text-gray-400'} border-b border-gov-800`}>
                              <td className="p-2 text-center w-8">{i+1}</td>
                              <td className="p-2">{s.name}</td>
                              <td className="p-2 text-right">{valueFn(s)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
    <div className="bg-gov-800 border border-gov-700 rounded-lg p-6 h-full overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-6">National Census & Intelligence Bureau</h2>
      
      {/* Macro Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gov-700 p-4 rounded text-center">
              <div className="text-xs text-gray-400 uppercase">National Population</div>
              <div className="text-xl font-bold text-white">{formatNum(totalPop)}</div>
          </div>
          <div className="bg-gov-700 p-4 rounded text-center">
              <div className="text-xs text-gray-400 uppercase">Total Cities</div>
              <div className="text-xl font-bold text-white">{totalCities}</div>
          </div>
          <div className="bg-gov-700 p-4 rounded text-center">
              <div className="text-xs text-gray-400 uppercase">Major Ports</div>
              <div className="text-xl font-bold text-white">{totalPorts}</div>
          </div>
          <div className="bg-gov-700 p-4 rounded text-center">
              <div className="text-xs text-gray-400 uppercase">Airports</div>
              <div className="text-xl font-bold text-white">{totalAirports}</div>
          </div>
      </div>

      {/* Leaderboards */}
      <h3 className="text-lg font-bold text-white mb-4">Regional Comparisons</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {renderRankTable("Population Rank", popRank, (s) => formatNum(s.population))}
          {renderRankTable("Development Score (Infra)", infraRank, (s) => getInfraScore(s.name))}
          {renderRankTable("Urbanization Rate", urbanRank, (s) => `${getUrbanRate(s).toFixed(1)}%`)}
      </div>

      {/* Data Explorer */}
      <div className="border-t border-gov-700 pt-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-white">Territorial Intelligence (Spy Mode)</h3>
             <select 
                className="bg-gov-900 border border-gov-600 rounded p-2 text-sm text-white"
                value={spyState}
                onChange={(e) => setSpyState(e.target.value)}
             >
                 <option value="">-- Select Region to Analyze --</option>
                 {session.states.filter(s => s.name !== session.playerState).map(s => (
                     <option key={s.id} value={s.name}>{s.name}</option>
                 ))}
             </select>
          </div>

          {spyState && (
              <div className="bg-gov-900 rounded p-4 overflow-x-auto">
                  <h4 className="text-gov-accent font-bold mb-2">{spyState} - Strategic Overview</h4>
                  <table className="w-full text-sm text-left">
                      <thead>
                          <tr className="text-gray-500 border-b border-gov-700">
                              <th className="pb-2">City</th>
                              <th className="pb-2 text-right">Population</th>
                              <th className="pb-2 text-center">Key Infrastructure</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gov-800">
                          {spyCities.map(c => (
                              <tr key={c.id} className="text-gray-300">
                                  <td className="py-2">{c.name} {c.infrastructure.isCapital && '★'}</td>
                                  <td className="py-2 text-right font-mono">{formatNum(c.population)}</td>
                                  <td className="py-2 text-center text-xs">
                                      {c.infrastructure.hasAirport && '✈️ '}
                                      {c.infrastructure.hasPort && '⚓ '}
                                      {c.infrastructure.hasUniversity && '🎓 '}
                                      {c.infrastructure.hasBarracks && '🛡️ '}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};