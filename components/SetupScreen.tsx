import React, { useState } from 'react';
import { Button } from './Button';
import { processStates, processDepts, processCities, DEMO_ESTADOS, DEMO_DEPARTAMENTOS, DEMO_CIDADES } from '../services/csvParser';
import { GameSession, GameStateEntity } from '../types';
import { INITIAL_LAWS, INITIAL_CABINET } from '../services/gameEngine';

interface SetupProps {
  onGameStart: (session: GameSession) => void;
}

export const SetupScreen: React.FC<SetupProps> = ({ onGameStart }) => {
  const [files, setFiles] = useState<{ states: string | null; depts: string | null; cities: string | null }>({
    states: null,
    depts: null,
    cities: null
  });
  const [parsedStates, setParsedStates] = useState<GameStateEntity[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileRead = (file: File, type: 'states' | 'depts' | 'cities') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFiles(prev => ({ ...prev, [type]: text }));
      if (type === 'states') {
        const states = processStates(text);
        setParsedStates(states);
      }
    };
    reader.readAsText(file);
  };

  const loadDemoData = () => {
    setFiles({
      states: DEMO_ESTADOS,
      depts: DEMO_DEPARTAMENTOS,
      cities: DEMO_CIDADES
    });
    setParsedStates(processStates(DEMO_ESTADOS));
  };

  const handleStart = () => {
    if (!files.states || !files.depts || !files.cities) {
      setError("Please upload all 3 CSV files or load demo data.");
      return;
    }
    if (!selectedState) {
      setError("Please select a state to govern.");
      return;
    }

    const rawDepts = processDepts(files.depts);
    const rawCities = processCities(files.cities);

    // Filter for selected state
    const gameDepts = rawDepts.filter(d => d.stateName === selectedState);
    const gameCities = rawCities.filter(c => c.stateName === selectedState);
    
    const stateInfo = parsedStates.find(s => s.name === selectedState);

    if (!gameCities.length) {
        setError(`No cities found for state: ${selectedState}. Check CSV consistency.`);
        return;
    }

    const initialSession: GameSession = {
      turn: 1,
      year: 2024,
      month: 1,
      treasury: 50000,
      politicalCapital: 20,
      playerState: selectedState,
      states: parsedStates,
      departments: gameDepts,
      cities: gameCities,
      allCities: rawCities,
      laws: JSON.parse(JSON.stringify(INITIAL_LAWS)),
      cabinet: JSON.parse(JSON.stringify(INITIAL_CABINET)),
      constructionQueue: [],
      factions: { elite: 50, people: 50, servants: 50 },
      events: [{ id: 1, date: "01/2024", title: "Inauguration", description: `Governor inaugurated in ${selectedState}.`, type: 'info' }],
      debt: 0,
      interestRate: 0.05,
      idr: 0.5,
      decreeCount: 0,
      decreeHistory: [],
      totalPopulation: gameCities.reduce((acc, c) => acc + c.population, 0),
      avgApproval: 50,
      gdp: 0,
      stability: 60
    };

    onGameStart(initialSession);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-900 p-4">
      <div className="bg-gov-800 border border-gov-700 p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gov-accent mb-2">EVIMÉRIA</h1>
          <p className="text-gray-400">Governmental Simulation System</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'states', label: 'Estados.csv' },
              { id: 'depts', label: 'Departamentos.csv' },
              { id: 'cities', label: 'Cidades.csv' }
            ].map((input) => (
              <div key={input.id} className="bg-gov-900 p-4 rounded border border-gov-700 relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">{input.label}</label>
                <input 
                  type="file" 
                  accept=".csv"
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gov-700 file:text-white hover:file:bg-gov-600"
                  onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], input.id as any)}
                />
                {files[input.id as keyof typeof files] && (
                  <div className="absolute top-2 right-2 text-green-500">✓</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
             <Button variant="ghost" size="sm" onClick={loadDemoData}>Load Demo Data</Button>
          </div>

          {parsedStates.length > 0 && (
            <div className="bg-gov-900 p-4 rounded border border-gov-700">
               <label className="block text-sm font-medium text-gray-300 mb-2">Select Territory to Govern</label>
               <select 
                 className="w-full bg-gov-800 border border-gov-700 rounded p-2 text-white focus:ring-2 focus:ring-gov-accent"
                 value={selectedState}
                 onChange={(e) => setSelectedState(e.target.value)}
               >
                 <option value="">-- Choose a State --</option>
                 {parsedStates.map(s => (
                   <option key={s.id} value={s.name}>{s.name} (Pop: {new Intl.NumberFormat('pt-BR').format(s.population)})</option>
                 ))}
               </select>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded text-center text-sm">
              {error}
            </div>
          )}

          <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>
            Initialize Administration
          </Button>
        </div>
      </div>
    </div>
  );
};