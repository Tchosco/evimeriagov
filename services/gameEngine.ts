import { GameSession, Law, GameEvent, GameCityEntity, CabinetMember, ConstructionTask, Infrastructure } from "../types";

// Dynamic Action Costs based on Population and Approval
export const getActionCosts = (population: number, approval: number) => {
  // Base costs adjusted by population density
  let propaganda = 500 + (population * 0.05);
  let festival = 2000 + (population * 0.15);
  let police = 800 + (population * 0.08);

  // Dynamic Modifiers based on Approval Rating
  // If approval is low, propaganda is less efficient (costs more to reach same effect)
  if (approval < 40) propaganda *= 1.5;
  else if (approval > 80) propaganda *= 0.8;

  // If approval is critically low, festivals require expensive security
  if (approval < 30) festival *= 1.3;

  // If approval is low, policing meets resistance, increasing operational costs
  if (approval < 30) police *= 1.5;

  return {
    propaganda: Math.floor(propaganda),
    festival: Math.floor(festival),
    police: Math.floor(police)
  };
};

export const getConstructionCost = (type: keyof Infrastructure, hasWorksSecretary: boolean): number => {
  const baseCosts: Record<string, number> = {
    hasAirport: 150000,
    hasPort: 100000,
    hasUniversity: 50000,
    hasRail: 75000,
    hasStadium: 40000,
    hasBarracks: 30000
  };
  
  let cost = baseCosts[type] || 100000;
  if (hasWorksSecretary) {
    cost = Math.floor(cost * 0.8); // 20% discount
  }
  return cost;
};

export const getConstructionDuration = (type: keyof Infrastructure): number => {
  const durations: Record<string, number> = {
    hasAirport: 6,
    hasPort: 5,
    hasUniversity: 4,
    hasRail: 4,
    hasStadium: 3,
    hasBarracks: 2
  };
  return durations[type] || 3;
};

export const INITIAL_CABINET: CabinetMember[] = [
  {
    id: 'finance',
    name: 'Dr. Valerius',
    title: 'Secretary of Finance',
    salary: 2000,
    hired: false,
    description: 'Expert economist.',
    bonusText: '+10% Tax Revenue'
  },
  {
    id: 'works',
    name: 'Eng. Helena',
    title: 'Secretary of Public Works',
    salary: 1500,
    hired: false,
    description: 'Former construction magnate.',
    bonusText: '-20% Construction Costs'
  },
  {
    id: 'security',
    name: 'Gen. Marcus',
    title: 'Secretary of Security',
    salary: 1800,
    hired: false,
    description: 'Retired general.',
    bonusText: '+5 Monthly Stability'
  },
  {
    id: 'growth',
    name: 'Dr. Alara',
    title: 'Ministry of Growth',
    salary: 2200,
    hired: false,
    description: 'Sociologist and urban planner.',
    bonusText: '+0.3% Pop. Growth & +5% IDR'
  },
  {
    id: 'labor',
    name: 'Union Leader J.',
    title: 'Ministry of Labor',
    salary: 1600,
    hired: false,
    description: 'Veteran syndicate organizer.',
    bonusText: '+2 Servant Sat. & -10% City Costs'
  }
];

export const INITIAL_LAWS: Law[] = [
  { 
    id: 'agr', 
    name: 'Agricultural Subsidy', 
    description: 'Boosts rural economy but costs treasury.', 
    costPerTurn: 5000, 
    isActive: false, 
    effects: { elite: 0, people: 5, revenueMultiplier: 1.02 } 
  },
  { 
    id: 'sec', 
    name: 'Martial Order Act', 
    description: 'Increases security greatly, reduces civil liberties.', 
    costPerTurn: 8000, 
    isActive: false, 
    effects: { security: 15, people: -10, elite: 5 } 
  },
  { 
    id: 'tour', 
    name: 'Tourism Board', 
    description: 'Invests in promoting the state globally.', 
    costPerTurn: 3000, 
    isActive: false, 
    effects: { revenueMultiplier: 1.05, elite: 2, people: 2 } 
  },
  {
    id: 'austerity',
    name: 'Fiscal Austerity',
    description: 'Cuts spending to save money. Unpopular with servants.',
    costPerTurn: 0,
    isActive: false, 
    effects: { revenueMultiplier: 1.10, servants: -15, people: -5 }
  }
];

export const calculateTurn = (prevState: GameSession): GameSession => {
  const newState = { ...prevState };
  
  // Advance Time
  newState.month += 1;
  if (newState.month > 12) {
    newState.month = 1;
    newState.year += 1;
  }
  newState.turn += 1;

  // Cabinet Bonuses
  const financeSec = newState.cabinet.find(c => c.id === 'finance')?.hired;
  const worksSec = newState.cabinet.find(c => c.id === 'works')?.hired;
  const securitySec = newState.cabinet.find(c => c.id === 'security')?.hired;
  const growthSec = newState.cabinet.find(c => c.id === 'growth')?.hired;
  const laborSec = newState.cabinet.find(c => c.id === 'labor')?.hired;

  let revenueMod = financeSec ? 1.10 : 1.0;
  
  // Cabinet Salaries
  let salaryCosts = 0;
  newState.cabinet.forEach(c => {
    if (c.hired) salaryCosts += c.salary;
  });

  // Law Effects
  let lawCosts = 0;
  let activeLawEffects = { elite: 0, people: 0, servants: 0, security: 0, growth: 0 };
  
  newState.laws.forEach(law => {
    if (law.isActive) {
      lawCosts += law.costPerTurn;
      if (law.effects.revenueMultiplier) revenueMod += (law.effects.revenueMultiplier - 1);
      if (law.effects.security) activeLawEffects.security += law.effects.security;
      if (law.effects.elite) activeLawEffects.elite += law.effects.elite;
      if (law.effects.people) activeLawEffects.people += law.effects.people;
      if (law.effects.servants) activeLawEffects.servants += law.effects.servants;
    }
  });

  // Labor Secretary Bonus to Servants
  if (laborSec) {
      activeLawEffects.servants += 2;
  }

  // Debt Service
  const monthlyInterest = (newState.debt * (newState.interestRate / 12));
  newState.treasury -= monthlyInterest;
  
  // Country Risk (Debt to GDP Ratio approx)
  const estimatedAnnualGDP = newState.gdp || (newState.treasury * 12); // Fallback
  const debtToGDP = estimatedAnnualGDP > 0 ? newState.debt / estimatedAnnualGDP : 0;
  
  if (debtToGDP > 1.0) {
      newState.interestRate = 0.15; // High risk
      newState.factions.elite -= 1; // Investors hate risk
  } else if (debtToGDP > 0.5) {
      newState.interestRate = 0.08;
  } else {
      newState.interestRate = 0.05;
  }

  // Process Construction Queue
  const completedConstructions: ConstructionTask[] = [];
  newState.constructionQueue = newState.constructionQueue.map(task => {
    const newTask = { ...task, turnsLeft: task.turnsLeft - 1 };
    if (newTask.turnsLeft <= 0) {
      completedConstructions.push(newTask);
    }
    return newTask;
  }).filter(t => t.turnsLeft > 0);

  // Apply Completed Constructions
  if (completedConstructions.length > 0) {
    newState.cities = newState.cities.map(city => {
      const completedForCity = completedConstructions.filter(c => c.cityId === city.id);
      if (completedForCity.length === 0) return city;

      const newInfra = { ...city.infrastructure };
      completedForCity.forEach(c => {
        newInfra[c.type] = true;
        newState.events.unshift({
            id: Date.now() + Math.random(),
            date: `${newState.month}/${newState.year}`,
            type: 'good',
            title: 'Project Complete',
            description: `Construction of ${c.name} finished in ${city.name}.`
        });
        // Decree Log for completion (optional, usually logged on start)
      });
      return { ...city, infrastructure: newInfra };
    });
  }

  // Process Cities
  let totalRevenue = 0;
  let totalPop = 0;
  let totalStability = 0;
  let totalCities = newState.cities.length;

  // Population Growth Factor: Base (1.001) + Secretary Bonus (0.003) = ~0.4% max monthly
  const baseGrowthRate = 1.001; 
  const growthBonus = growthSec ? 0.003 : 0;
  const totalGrowthRate = baseGrowthRate + growthBonus;

  newState.cities = newState.cities.map(city => {
    // Apply Population Growth
    const newPopulation = Math.floor(city.population * totalGrowthRate);

    // Revenue
    let baseTax = (newPopulation * 0.1);
    let cityRevenue = baseTax * revenueMod;
    
    // Infra Bonuses
    if (city.infrastructure.hasPort) { cityRevenue += 5000; }
    if (city.infrastructure.hasAirport) { cityRevenue += 8000; }
    if (city.infrastructure.hasRail) cityRevenue += 2000;
    if (city.infrastructure.hasUniversity) { cityRevenue += 1000; }
    if (city.infrastructure.hasStadium) cityRevenue += 500;
    
    // Costs
    let cityCost = 1000 + (newPopulation * 0.02);
    // Labor Secretary Discount on Maintenance
    if (laborSec) {
        cityCost *= 0.9;
    }
    
    totalRevenue += (cityRevenue - cityCost);

    // Stats
    let baseApp = (newState.factions.elite + newState.factions.people + newState.factions.servants) / 3;
    // Local variation
    let cityApproval = baseApp + (Math.random() * 4 - 2);
    
    let citySecurity = city.security + activeLawEffects.security + (securitySec ? 5 : 0);
    if (city.infrastructure.hasBarracks) citySecurity += 5;
    
    // Normalize
    cityApproval = Math.min(100, Math.max(0, cityApproval));
    citySecurity = Math.min(100, Math.max(0, citySecurity));

    totalPop += newPopulation;
    totalStability += citySecurity;

    return {
      ...city,
      population: newPopulation,
      approval: cityApproval,
      security: citySecurity
    };
  });

  // Department Service Level & Satisfaction Calculation
  let avgServiceLevel = 0;
  
  newState.departments = newState.departments.map(dept => {
    const deptCities = newState.cities.filter(c => c.deptName === dept.name);
    
    let deptServiceLevel = 0;
    
    if (deptCities.length > 0) {
        const totalSec = deptCities.reduce((sum, c) => sum + c.security, 0);
        const avgSec = totalSec / deptCities.length;
        
        // Calculate Infra Score per city then average
        const infraScoreSum = deptCities.reduce((sum, c) => {
             let score = 0;
             if(c.infrastructure.hasAirport) score++;
             if(c.infrastructure.hasPort) score++;
             if(c.infrastructure.hasRail) score++;
             if(c.infrastructure.hasUniversity) score++;
             if(c.infrastructure.hasBarracks) score++;
             if(c.infrastructure.hasStadium) score++;
             // Max 6 infra types, scaled to 0-100
             return sum + ((score / 6) * 100);
        }, 0);
        const avgInfra = infraScoreSum / deptCities.length;
        
        // Weighted: 40% Security, 60% Infrastructure
        deptServiceLevel = Math.floor((avgSec * 0.4) + (avgInfra * 0.6));
    } else {
        deptServiceLevel = 0;
    }

    avgServiceLevel += deptServiceLevel;

    // Satisfaction tracks with overall approval but buffered by Service Level
    const targetSat = (newState.avgApproval * 0.6) + (deptServiceLevel * 0.4);
    const diff = targetSat - dept.satisfaction;
    
    return { 
        ...dept, 
        satisfaction: Math.floor(dept.satisfaction + diff * 0.1),
        serviceLevel: deptServiceLevel
    };
  });
  
  avgServiceLevel = newState.departments.length > 0 ? avgServiceLevel / newState.departments.length : 0;

  // Expenses
  newState.treasury += (totalRevenue - lawCosts - salaryCosts);
  
  // Political Capital
  newState.politicalCapital += 5 + (newState.factions.elite > 60 ? 2 : 0) + (newState.factions.servants > 60 ? 2 : 0);

  // Faction Drift update (Impacted by Service Level now)
  // High Service Level pleases the People
  if (avgServiceLevel > 70) newState.factions.people += 1;
  if (avgServiceLevel < 30) newState.factions.people -= 1;

  newState.factions = {
    elite: Math.min(100, Math.max(0, newState.factions.elite + activeLawEffects.elite + (Math.random() * 2 - 1))),
    people: Math.min(100, Math.max(0, newState.factions.people + activeLawEffects.people + (Math.random() * 2 - 1))),
    servants: Math.min(100, Math.max(0, newState.factions.servants + activeLawEffects.servants + (Math.random() * 2 - 1)))
  };

  // Aggregates
  newState.totalPopulation = totalPop;
  newState.avgApproval = (newState.factions.elite + newState.factions.people + newState.factions.servants) / 3;
  newState.gdp = totalRevenue * 12;
  newState.stability = newState.cities.length ? totalStability / newState.cities.length : 0;
  
  // IDR Calculation (Index of Regional Development)
  // Refined Formula: Weighted Average of Infrastructure (40%), Education/Social (30%), and Stability (30%)
  
  let infraScoreSum = 0;
  let socialScoreSum = 0;

  newState.cities.forEach(c => {
      // Infrastructure Sub-Index (0 to 1 per city)
      // Weighted importance: Airport (3), Port (3), Rail (2).
      // Score normalized to max 5 points.
      let iScore = 0;
      if (c.infrastructure.hasAirport) iScore += 3;
      if (c.infrastructure.hasPort) iScore += 3;
      if (c.infrastructure.hasRail) iScore += 2;
      // A city with Port+Rail (5pts) or Airport+Rail (5pts) is considered fully connected.
      infraScoreSum += Math.min(1, iScore / 5);

      // Social/Education Sub-Index (0 to 1 per city)
      // University (1.0), Stadium (0.5 - Culture boost).
      // University is critical for development.
      let sScore = 0;
      if (c.infrastructure.hasUniversity) sScore += 1.0;
      if (c.infrastructure.hasStadium) sScore += 0.5;
      socialScoreSum += Math.min(1, sScore);
  });

  const idrInfra = totalCities > 0 ? infraScoreSum / totalCities : 0;
  const idrSocial = totalCities > 0 ? socialScoreSum / totalCities : 0;
  const idrStability = newState.stability / 100;

  // Composite IDR
  newState.idr = (idrInfra * 0.4) + (idrSocial * 0.3) + (idrStability * 0.3);
  
  // Cabinet Bonus: Growth Secretary adds flat 5% to IDR perception
  if (growthSec) {
      newState.idr *= 1.05;
  }

  newState.idr = parseFloat(Math.max(0, Math.min(1, newState.idr)).toFixed(3));

  // Random Events (Service Level Events)
  if (Math.random() > 0.75) {
    const events: GameEvent[] = [
      { id: Date.now(), date: `${newState.month}/${newState.year}`, type: 'bad', title: 'Protest', description: 'People are demanding better services.' },
      { id: Date.now(), date: `${newState.month}/${newState.year}`, type: 'good', title: 'Market Boom', description: 'Elite investors are happy with returns.' },
      { id: Date.now(), date: `${newState.month}/${newState.year}`, type: 'alert', title: 'Scandal', description: 'A minor corruption scandal involving civil servants.' },
    ];
    
    // New Service Events
    const lowServiceDept = newState.departments.find(d => d.serviceLevel < 20);
    if (lowServiceDept) {
        events.push({
            id: Date.now(),
            date: `${newState.month}/${newState.year}`,
            type: 'bad',
            title: 'Service Collapse',
            description: `Infrastructure failure in ${lowServiceDept.name} is causing unrest!`
        });
    }
    const highServiceDept = newState.departments.find(d => d.serviceLevel > 85);
    if (highServiceDept) {
        events.push({
            id: Date.now(),
            date: `${newState.month}/${newState.year}`,
            type: 'good',
            title: 'Model Region',
            description: `${highServiceDept.name} is praised as a model of efficiency.`
        });
    }

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    if (randomEvent.title === 'Protest') newState.factions.people -= 5;
    if (randomEvent.title === 'Market Boom') { newState.treasury += 15000; newState.factions.elite += 5; }
    if (randomEvent.title === 'Scandal') newState.factions.servants -= 5;
    if (randomEvent.title === 'Service Collapse') { newState.factions.people -= 8; newState.stability -= 5; }
    if (randomEvent.title === 'Model Region') { newState.factions.people += 5; newState.politicalCapital += 10; }

    newState.events = [randomEvent, ...newState.events];
  }

  return newState;
};