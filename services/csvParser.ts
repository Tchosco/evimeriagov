import { RawCityRow, RawDeptRow, RawStateRow } from "../types";

// Helper to parse a CSV line considering quotes
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const parseCSV = <T>(text: string): T[] => {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj: any = {};
    headers.forEach((header, index) => {
      let val = values[index] || '';
      val = val.replace(/^"|"$/g, ''); 
      obj[header] = val;
    });
    return obj as T;
  });
};

// Brazilian Number Parser: 314.938 -> 314938 | 4,92 -> 4.92
export const parseNumber = (val: string): number => {
  if (!val) return 0;
  let clean = val.replace(/\./g, '');
  clean = clean.replace(',', '.');
  clean = clean.replace(/[^0-9.-]/g, '');
  return parseFloat(clean) || 0;
};

export const processStates = (csvText: string) => {
  const raw = parseCSV<RawStateRow>(csvText);
  return raw.map(r => ({
    id: parseInt(r.ID) || 0,
    name: r.ESTADO,
    capital: r.CAPITAL,
    area: parseNumber(r["AREA KM²"]),
    population: parseNumber(r["POPULAÇÃO"] || r["POP."]),
    popRural: parseNumber(r["POP. RURAL"]),
    popUrban: parseNumber(r["POP. URBAN."])
  }));
};

export const processDepts = (csvText: string) => {
  const raw = parseCSV<RawDeptRow>(csvText);
  return raw.map(r => ({
    id: parseInt(r.ID) || 0,
    name: r.DEPARTAMENTO,
    stateName: r.ESTADO,
    population: parseNumber(r["POPULAÇÃO"]),
    satisfaction: 50 + Math.floor(Math.random() * 30),
    serviceLevel: 50 // Default init
  }));
};

export const processCities = (csvText: string) => {
  const raw = parseCSV<RawCityRow>(csvText);
  return raw.map(r => ({
    id: parseInt(r.ID) || 0,
    name: r.CIDADE,
    deptName: r.DEPARTAMENTO,
    stateName: r.ESTADO,
    culture: r.CULTURA,
    population: parseNumber(r["POUP"] || r["POPULAÇÃO"]),
    infrastructure: {
      hasAirport: !!r.AEROPORTO,
      hasRail: !!r["EST. FERROV"],
      hasPort: !!r.PORTO,
      hasStadium: !!r.ESTÁDIO,
      hasUniversity: !!r.UNIVERSID,
      hasBarracks: !!r.QUARTEL,
      isCapital: !!r.CAPITAL
    },
    approval: 50, // Will be overwritten by faction logic
    security: 60,
    tourism: 10
  }));
};

export const DEMO_ESTADOS = `ID,ESTADO,CAPITAL,CIDADES,AREA KM²,POPULAÇÃO,POP. RURAL,POP. URBAN.,HAB/AREA,,,
12,Freicalhalin,Freicalhalin,30,103.095,507.023,327.872,179.151,"4,92",,"64,67%","35,33%"
16,Chamaoleiros,Chamaoleiros,27,115.812,1.009.160,438.021,571.139,"8,71",,"43,40%","56,60%"
15,Hrafjor,Hrafjor,51,141.021,2.425.334,599.435,1.825.899,"17,20",,"24,72%","75,28%"`;

export const DEMO_DEPARTAMENTOS = `ID,DEPARTAMENTO,ESTADO,CAPITAL,AREA KM²,POPULAÇÃO,POP. RURAL,POP. URBAN.,HAB/AREA
128,Arban,Chamaoleiros,Arban,19.170,406.132,67.549,338.583,"21,19"
50,Busbar,Chamaoleiros,Schuttenberg,19.953,100.533,76.076,24.457,"5,04"
65,Estanbachtal,Hrafjor,Estanbachtal,35.325,275.413,166.213,109.200,"7,80"
35,Freiro,Hrafjor,Freiro,12.492,52.997,47.235,5.762,"4,24"`;

export const DEMO_CIDADES = `ID,CIDADE,DEPARTAMENTO,ESTADO,CULTURA,POUP,CAPITAL,AEROPORTO,EST. FERROV,PORTO,ESTÁDIO,UNIVERSID,QUARTEL
315,Ciudad de Senia,Arban,Chamaoleiros,Espanhóis,314.938,,,,,,,
398,Ritatillada,Arban,Chamaoleiros,Espanhóis,12.108,,,,,,,
176,Chamaoleiros,Chamaoleiros,Chamaoleiros,Portugueses,2.771,★,,,,,,
2,Magricea,Estanbachtal,Hrafjor,Germânicos,38.762,,,,,,,
83,Ebruck,Estanbachtal,Hrafjor,Germânicos,13.759,,,,⚓,,,
39,Freiro,Freiro,Hrafjor,Portugueses,2.478,,,,⚓,,,`;