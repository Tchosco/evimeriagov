import React from 'react';
import { GameSession } from '../types';
import { Button } from './Button';

interface TreasuryProps {
  session: GameSession;
  onLoan: () => void;
  onAmortize: () => void;
}

export const TreasuryScreen: React.FC<TreasuryProps> = ({ session, onLoan, onAmortize }) => {
  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
  };

  const estimatedGDP = session.gdp || (session.treasury * 12);
  const debtRatio = estimatedGDP > 0 ? (session.debt / estimatedGDP) * 100 : 0;
  
  let creditRating = "AAA";
  let ratingColor = "text-green-500";
  let barColor = "bg-green-500";

  if (debtRatio > 30) { creditRating = "A"; ratingColor = "text-green-300"; barColor = "bg-green-400"; }
  if (debtRatio > 60) { creditRating = "BBB"; ratingColor = "text-yellow-400"; barColor = "bg-yellow-500"; }
  if (debtRatio > 90) { creditRating = "CCC"; ratingColor = "text-red-400"; barColor = "bg-red-500"; }
  if (debtRatio > 120) { creditRating = "D (Default)"; ratingColor = "text-red-600"; barColor = "bg-red-700"; }

  return (
    <div className="bg-gov-800 border border-gov-700 rounded-lg p-6 h-full overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gov-700 pb-2">National Treasury & Sovereign Debt</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Indicators */}
        <div className="space-y-4">
           <div className="bg-gov-900 p-4 rounded border border-gov-700">
              <div className="text-gray-400 text-sm uppercase">Total Sovereign Debt</div>
              <div className="text-3xl font-mono text-red-400">{formatMoney(session.debt)}</div>
              <div className="text-xs text-gray-500 mt-1">Monthly Interest: {formatMoney(session.debt * (session.interestRate/12))}</div>
           </div>

           <div className="bg-gov-900 p-4 rounded border border-gov-700">
              <div className="text-gray-400 text-sm uppercase">Estimated Annual GDP</div>
              <div className="text-3xl font-mono text-blue-400">{formatMoney(estimatedGDP)}</div>
           </div>

           <div className="bg-gov-900 p-4 rounded border border-gov-700 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                  <div>
                      <div className="text-gray-400 text-sm uppercase">Debt-to-GDP Ratio</div>
                      <div className={`text-2xl font-bold ${debtRatio > 100 ? 'text-red-500' : 'text-gray-200'}`}>{debtRatio.toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                      <div className="text-gray-400 text-sm uppercase">Credit Rating</div>
                      <div className={`text-2xl font-bold ${ratingColor}`}>{creditRating}</div>
                  </div>
              </div>
              
              <div className="w-full bg-gov-800 h-4 rounded-full overflow-hidden border border-gov-600 relative">
                  <div 
                    className={`h-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${Math.min(100, debtRatio)}%` }}
                  ></div>
                  {/* Tick marks for thresholds */}
                  <div className="absolute top-0 left-[30%] h-full w-px bg-gov-600 opacity-50"></div>
                  <div className="absolute top-0 left-[60%] h-full w-px bg-gov-600 opacity-50"></div>
                  <div className="absolute top-0 left-[90%] h-full w-px bg-gov-600 opacity-50"></div>
              </div>
              
              <div className="flex justify-between text-[10px] text-gray-500 px-1">
                  <span>0%</span>
                  <span>30%</span>
                  <span>60%</span>
                  <span>90% (Critical)</span>
              </div>
           </div>

           <div className="bg-gov-900 p-4 rounded border border-gov-700">
               <div className="text-gray-400 text-sm uppercase">Interest Rate (Selic)</div>
               <div className="text-2xl font-mono text-yellow-500">{(session.interestRate * 100).toFixed(1)}% p.a.</div>
           </div>
        </div>

        {/* Actions */}
        <div className="bg-gov-900/50 p-6 rounded border border-gov-700 flex flex-col justify-center gap-6">
            <h3 className="text-lg font-bold text-gray-300">Financial Operations</h3>
            
            <div className="p-4 border border-gray-700 rounded bg-gov-800">
                <h4 className="font-bold text-white mb-2">Issue Sovereign Bonds</h4>
                <p className="text-sm text-gray-400 mb-4">Contract an emergency loan of <span className="text-white font-bold">C$ 100.000</span> from the central bank. This will increase your debt service.</p>
                <Button variant="primary" onClick={onLoan} className="w-full">
                    Issue Bonds (+C$ 100k)
                </Button>
            </div>

            <div className="p-4 border border-gray-700 rounded bg-gov-800">
                <h4 className="font-bold text-white mb-2">Amortize Debt</h4>
                <p className="text-sm text-gray-400 mb-4">Use treasury surplus to pay down <span className="text-white font-bold">C$ 50.000</span> of the principal debt, reducing future interest.</p>
                <Button variant="success" onClick={onAmortize} disabled={session.treasury < 50000 || session.debt <= 0} className="w-full">
                    Amortize Debt (-C$ 50k)
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};