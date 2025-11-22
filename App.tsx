import React, { useState, useEffect } from 'react';
import { GameSession, Infrastructure } from './types';
import { SetupScreen } from './components/SetupScreen';
import { TopBar } from './components/TopBar';
import { CityList } from './components/CityList';
import { LawBook } from './components/LawBook';
import { CabinetScreen } from './components/CabinetScreen';
import { TreasuryScreen } from './components/TreasuryScreen';
import { GazetteScreen } from './components/GazetteScreen';
import { CensusScreen } from './components/CensusScreen';
import { calculateTurn, getActionCosts, getConstructionCost, getConstructionDuration } from './services/gameEngine';

const App: React.FC = () => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [activeTab, setActiveTab] = useState<'cities' | 'laws' | 'depts' | 'cabinet' | 'treasury' | 'gazette' | 'census'>('cities');
  const [saveMsg, setSaveMsg] = useState<string>("");

  const handleGameStart = (newSession: GameSession) => {
    setSession(newSession);
  };

  const handleEndTurn = () => {
    if (!session) return;
    const nextState = calculateTurn(session);
    setSession(nextState);
  };

  const handleSave = () => {
    if (!session) return;
    try {
        localStorage.setItem('evimeria_save', JSON.stringify(session));
        setSaveMsg("Game Saved!");
        setTimeout(() => setSaveMsg(""), 2000);
    } catch (e) {
        setSaveMsg("Save Failed");
    }
  };

  const handleLoad = () => {
      const saved = localStorage.getItem('evimeria_save');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              // Basic validation
              if (parsed.turn && parsed.cities) {
                  setSession(parsed);
                  setSaveMsg("Game Loaded!");
                  setTimeout(() => setSaveMsg(""), 2000);
              }
          } catch (e) {
              setSaveMsg("Corrupt Save");
          }
      }
  };

  const logDecree = (currentState: GameSession, text: string) => {
      const decreeNum = currentState.decreeCount + 1;
      const logEntry = `[${String(currentState.month).padStart(2, '0')}/${currentState.year}] DECREE Nº ${decreeNum}: ${text}`;
      return {
          decreeCount: decreeNum,
          decreeHistory: [...currentState.decreeHistory, logEntry]
      };
  };

  const handleCityAction = (cityId: number, actionType: 'propaganda' | 'festival' | 'police') => {
    if (!session) return;
    
    const targetCity = session.cities.find(c => c.id === cityId);
    if (!targetCity) return;

    const costs = getActionCosts(targetCity.population, targetCity.approval);
    const cost = costs[actionType];

    if (session.treasury < cost) return;

    // Faction impacts
    let eliteMod = 0;
    let peopleMod = 0;
    let servantsMod = 0;
    let logText = "";

    if (actionType === 'propaganda') { peopleMod = 2; logText = `Propaganda campaign authorized in ${targetCity.name}. Cost: C$ ${cost}`; }
    if (actionType === 'festival') { peopleMod = 4; eliteMod = 2; logText = `Cultural festival funded in ${targetCity.name}. Cost: C$ ${cost}`; }
    if (actionType === 'police') { eliteMod = 3; peopleMod = -2; logText = `Special police operation in ${targetCity.name}. Cost: C$ ${cost}`; }

    // Update session
    const newCities = session.cities.map(c => {
      if (c.id === cityId) {
        let updates = {};
        if (actionType === 'propaganda') updates = { approval: Math.min(100, c.approval + 5) };
        if (actionType === 'festival') updates = { culture: "Booster", approval: Math.min(100, c.approval + 10), tourism: Math.min(100, c.tourism + 5) };
        if (actionType === 'police') updates = { security: Math.min(100, c.security + 10), approval: Math.max(0, c.approval - 2) };
        return { ...c, ...updates };
      }
      return c;
    });

    const decreeUpdates = logDecree(session, logText);

    setSession({
      ...session,
      treasury: session.treasury - cost,
      cities: newCities,
      factions: {
          elite: Math.min(100, Math.max(0, session.factions.elite + eliteMod)),
          people: Math.min(100, Math.max(0, session.factions.people + peopleMod)),
          servants: Math.min(100, Math.max(0, session.factions.servants + servantsMod)),
      },
      ...decreeUpdates
    });
  };

  const handleToggleLaw = (lawId: string) => {
    if (!session) return;
    const targetLaw = session.laws.find(l => l.id === lawId);
    if (!targetLaw) return;

    if (!targetLaw.isActive && session.politicalCapital < 10) return;

    const newLaws = session.laws.map(l => {
        if (l.id === lawId) return { ...l, isActive: !l.isActive };
        return l;
    });

    const action = !targetLaw.isActive ? "Enactment" : "Repeal";
    const decreeUpdates = logDecree(session, `${action} of ${targetLaw.name}.`);

    setSession({
        ...session,
        politicalCapital: !targetLaw.isActive ? session.politicalCapital - 10 : session.politicalCapital,
        laws: newLaws,
        ...decreeUpdates
    });
  };

  const handleConstruct = (cityId: number, type: keyof Infrastructure) => {
      if (!session) return;
      
      // Check secretary discount
      const hasWorks = session.cabinet.find(c => c.id === 'works')?.hired || false;
      const cost = getConstructionCost(type, hasWorks);

      if (session.treasury < cost) return;

      const duration = getConstructionDuration(type);
      const buildingName = type.replace('has', '');
      
      const city = session.cities.find(c => c.id === cityId);
      const decreeUpdates = logDecree(session, `Construction of ${buildingName} authorized in ${city?.name}. Cost: C$ ${cost}. Duration: ${duration} months.`);

      setSession({
          ...session,
          treasury: session.treasury - cost,
          constructionQueue: [
              ...session.constructionQueue, 
              { id: Date.now(), cityId, type, turnsLeft: duration, name: buildingName }
          ],
          ...decreeUpdates
      });
  };

  const handleCabinetHireFire = (id: string) => {
      if (!session) return;
      const member = session.cabinet.find(c => c.id === id);
      if (!member) return;

      if (!member.hired && session.treasury < member.salary) return;

      const newCabinet = session.cabinet.map(c => {
          if (c.id === id) return { ...c, hired: !c.hired };
          return c;
      });

      const action = member.hired ? "Dismissal" : "Appointment";
      const decreeUpdates = logDecree(session, `${action} of ${member.name} as ${member.title}.`);

      setSession({ ...session, cabinet: newCabinet, ...decreeUpdates });
  };

  // Financial Handlers
  const handleLoan = () => {
      if (!session) return;
      // Borrow 100k, adds to debt
      const amount = 100000;
      const decreeUpdates = logDecree(session, `Sovereign Loan contracted. Amount: C$ ${amount}.`);
      setSession({
          ...session,
          treasury: session.treasury + amount,
          debt: session.debt + amount,
          ...decreeUpdates
      });
  };

  const handleAmortize = () => {
      if (!session) return;
      const amount = 50000;
      if (session.treasury < amount || session.debt <= 0) return;
      
      const payAmount = Math.min(amount, session.debt);
      const decreeUpdates = logDecree(session, `Debt amortization payment. Amount: C$ ${payAmount}.`);
      
      setSession({
          ...session,
          treasury: session.treasury - payAmount,
          debt: session.debt - payAmount,
          ...decreeUpdates
      });
  };

  if (!session) {
    return <SetupScreen onGameStart={handleGameStart} />;
  }

  const hasWorksSecretary = session.cabinet.find(c => c.id === 'works')?.hired || false;

  return (
    <div className="flex flex-col h-screen bg-gov-900 text-gray-100 overflow-hidden">
      <TopBar session={session} onEndTurn={handleEndTurn} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Tab Nav */}
        <nav className="w-20 bg-gov-800 border-r border-gov-700 flex flex-col items-center py-4 gap-4 z-10 overflow-y-auto">
          <button onClick={() => setActiveTab('cities')} className={`p-3 rounded-xl transition-all ${activeTab === 'cities' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Cities">🏙️</button>
          <button onClick={() => setActiveTab('laws')} className={`p-3 rounded-xl transition-all ${activeTab === 'laws' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Legislation">⚖️</button>
          <button onClick={() => setActiveTab('cabinet')} className={`p-3 rounded-xl transition-all ${activeTab === 'cabinet' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Cabinet">💼</button>
          <button onClick={() => setActiveTab('depts')} className={`p-3 rounded-xl transition-all ${activeTab === 'depts' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Departments">🗺️</button>
          <button onClick={() => setActiveTab('treasury')} className={`p-3 rounded-xl transition-all ${activeTab === 'treasury' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Treasury">💰</button>
          <button onClick={() => setActiveTab('census')} className={`p-3 rounded-xl transition-all ${activeTab === 'census' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Census Data">📊</button>
          <button onClick={() => setActiveTab('gazette')} className={`p-3 rounded-xl transition-all ${activeTab === 'gazette' ? 'bg-gov-accent text-gov-900' : 'text-gray-400 hover:bg-gov-700'}`} title="Official Gazette">📜</button>

          <div className="mt-auto flex flex-col gap-2 mb-4">
              <button onClick={handleSave} className="text-xs text-gray-400 hover:text-white p-2 border border-gov-700 rounded">Save</button>
              <button onClick={handleLoad} className="text-xs text-gray-400 hover:text-white p-2 border border-gov-700 rounded">Load</button>
              {saveMsg && <div className="text-[10px] text-green-400 text-center animate-pulse">{saveMsg}</div>}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Central Panel */}
          <div className="flex-1 p-4 overflow-hidden h-full relative">
             {activeTab === 'cities' && (
                 <CityList 
                    cities={session.cities} 
                    treasury={session.treasury} 
                    queue={session.constructionQueue}
                    hasWorksSecretary={hasWorksSecretary}
                    onAction={handleCityAction} 
                    onConstruct={handleConstruct}
                 />
             )}
             {activeTab === 'laws' && (
                 <LawBook laws={session.laws} politicalCapital={session.politicalCapital} onToggleLaw={handleToggleLaw} />
             )}
             {activeTab === 'cabinet' && (
                 <CabinetScreen cabinet={session.cabinet} treasury={session.treasury} onHireFire={handleCabinetHireFire} />
             )}
             {activeTab === 'treasury' && (
                 <TreasuryScreen session={session} onLoan={handleLoan} onAmortize={handleAmortize} />
             )}
             {activeTab === 'gazette' && (
                 <GazetteScreen logs={session.decreeHistory} />
             )}
             {activeTab === 'census' && (
                 <CensusScreen session={session} />
             )}
             {activeTab === 'depts' && (
                 <div className="bg-gov-800 border border-gov-700 rounded-lg p-6 h-full overflow-auto">
                    <h2 className="text-xl font-bold mb-6">Departmental Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {session.departments.map(dept => (
                            <div key={dept.id} className="bg-gov-900 p-4 rounded border border-gov-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{dept.name}</h3>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2 py-1 rounded ${dept.satisfaction > 50 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                            Sat: {dept.satisfaction}%
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded ${dept.serviceLevel > 50 ? 'bg-blue-900 text-blue-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                            Svc: {dept.serviceLevel}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">Pop: {new Intl.NumberFormat('pt-BR').format(dept.population)}</p>
                                
                                <div className="mt-3">
                                    <div className="text-[10px] text-gray-500 mb-1">Satisfaction</div>
                                    <div className="w-full bg-gov-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-gov-accent h-full transition-all duration-500" style={{ width: `${dept.satisfaction}%` }}></div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="text-[10px] text-gray-500 mb-1">Service Level (Sec + Infra)</div>
                                    <div className="w-full bg-gov-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${dept.serviceLevel}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             )}
          </div>

          {/* Right Feed Panel (Events) */}
          <div className="w-full md:w-80 bg-gov-800 border-l border-gov-700 flex flex-col z-10 shadow-xl">
             <div className="p-4 border-b border-gov-700 font-bold text-sm uppercase tracking-wider text-gray-400">
                Official Gazette
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {session.events.map(event => (
                    <div key={event.id} className={`p-3 rounded border-l-4 text-sm ${
                        event.type === 'good' ? 'border-green-500 bg-green-900/10' : 
                        event.type === 'bad' ? 'border-red-500 bg-red-900/10' : 
                        'border-blue-500 bg-blue-900/10'
                    }`}>
                        <div className="text-xs text-gray-500 mb-1">{event.date}</div>
                        <div className="font-bold text-gray-200">{event.title}</div>
                        <div className="text-gray-400 mt-1 text-xs leading-relaxed">{event.description}</div>
                    </div>
                ))}
             </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default App;