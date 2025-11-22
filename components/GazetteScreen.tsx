import React from 'react';
import { Button } from './Button';

interface GazetteProps {
  logs: string[];
}

export const GazetteScreen: React.FC<GazetteProps> = ({ logs }) => {
  
  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([logs.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "evimeria_mandate_history.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-gov-800 border border-gov-700 rounded-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-white font-serif tracking-wide">Diário Oficial da União</h2>
            <p className="text-sm text-gray-400 uppercase tracking-widest">Official Acts & Decrees Registry</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
            📥 Export Mandate (.txt)
        </Button>
      </div>

      <div className="flex-1 bg-[#fdfbf7] text-black font-serif p-8 rounded shadow-inner overflow-y-auto border-4 border-double border-gov-900">
         <div className="text-center mb-8 border-b-2 border-black pb-4">
             <h1 className="text-3xl font-bold uppercase mb-2">Atos do Poder Executivo</h1>
             <p className="text-sm italic">Republic of Eviméria</p>
         </div>
         
         <div className="space-y-4">
             {logs.length === 0 ? (
                 <p className="text-center text-gray-500 italic">No decrees issued yet.</p>
             ) : (
                 logs.map((log, idx) => (
                     <div key={idx} className="text-sm leading-relaxed border-b border-gray-300 pb-2">
                         {log}
                     </div>
                 ))
             )}
         </div>
         
         <div className="mt-12 pt-8 border-t border-black text-center">
             <p className="text-xs uppercase">Document signed electronically • Official Validity</p>
         </div>
      </div>
    </div>
  );
};