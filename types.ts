export interface RawStateRow {
  ID: string;
  ESTADO: string;
  CAPITAL: string;
  CIDADES: string;
  "AREA KM²": string;
  "POPULAÇÃO": string;
  [key: string]: string;
}

export interface RawDeptRow {
  ID: string;
  DEPARTAMENTO: string;
  ESTADO: string;
  CAPITAL: string;
  "POPULAÇÃO": string;
  [key: string]: string;
}

export interface RawCityRow {
  ID: string;
  CIDADE: string;
  DEPARTAMENTO: string;
  ESTADO: string;
  CULTURA: string;
  POUP: string; // Note: CSV header says POUP sometimes or POP
  CAPITAL: string;
  AEROPORTO: string;
  "EST. FERROV": string;
  PORTO: string;
  ESTÁDIO: string;
  UNIVERSID: string;
  QUARTEL: string;
  [key: string]: string;
}

export interface GameStateEntity {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  popRural: number;
  popUrban: number;
}

export interface GameDeptEntity {
  id: number;
  name: string;
  stateName: string;
  population: number;
  satisfaction: number; // 0-100
  serviceLevel: number; // 0-100 (New Stat)
}

export interface Infrastructure {
  hasAirport: boolean;
  hasRail: boolean;
  hasPort: boolean;
  hasStadium: boolean;
  hasUniversity: boolean;
  hasBarracks: boolean;
  isCapital: boolean;
}

export interface GameCityEntity {
  id: number;
  name: string;
  deptName: string;
  stateName: string;
  culture: string;
  population: number;
  infrastructure: Infrastructure;
  approval: number; // Derived from factions
  security: number; // 0-100
  tourism: number; // 0-100
}

export interface Law {
  id: string;
  name: string;
  description: string;
  costPerTurn: number;
  isActive: boolean;
  effects: {
    elite?: number;
    people?: number;
    servants?: number;
    revenueMultiplier?: number;
    security?: number;
    growth?: number;
  };
}

export interface GameEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  type: 'info' | 'good' | 'bad' | 'alert';
}

export interface Factions {
  elite: number;
  people: number;
  servants: number;
}

export interface CabinetMember {
  id: 'finance' | 'works' | 'security' | 'growth' | 'labor';
  name: string;
  title: string;
  salary: number;
  hired: boolean;
  description: string;
  bonusText: string;
}

export interface ConstructionTask {
  id: number;
  cityId: number;
  type: keyof Infrastructure;
  turnsLeft: number;
  name: string;
}

export interface GameSession {
  turn: number;
  year: number;
  month: number;
  treasury: number;
  politicalCapital: number;
  playerState: string | null;
  
  states: GameStateEntity[];
  departments: GameDeptEntity[];
  cities: GameCityEntity[];
  allCities: GameCityEntity[]; // For census
  laws: Law[];
  events: GameEvent[];
  
  // New Systems
  factions: Factions;
  cabinet: CabinetMember[];
  constructionQueue: ConstructionTask[];
  
  // Financial / Admin
  debt: number;
  interestRate: number; // Annual
  idr: number; // 0.000 to 1.000
  decreeCount: number;
  decreeHistory: string[];
  
  // Calculated Stats
  totalPopulation: number;
  avgApproval: number;
  gdp: number;
  stability: number;
}