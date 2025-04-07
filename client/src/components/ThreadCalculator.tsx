import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { fabricTypes, threadTypes, Thread, Fabric } from '@/data/schema';

interface ThreadColor {
  code: string;
  name: string;
  color: string;
  count: number;
  skeins: number;
}

interface ThreadCalculatorProps {
  threadList: ThreadColor[];
  patternWidth: number;
  patternHeight: number;
  fabricType: string;
  threadType: string;
  difficulty: 'Sencilla' | 'Media' | 'Difícil';
}

const ThreadCalculator: React.FC<ThreadCalculatorProps> = ({
  threadList,
  patternWidth,
  patternHeight,
  fabricType,
  threadType,
  difficulty
}) => {
  const getFabricName = (id: string): string => {
    const fabric = fabricTypes.find((f: Fabric) => f.id === id);
    return fabric ? fabric.name : id;
  };

  const getThreadName = (id: string): string => {
    const thread = threadTypes.find((t: Thread) => t.id === id);
    return thread ? thread.name : id;
  };

  return (
    <div className="w-full lg:w-1/3">
      <Card className="bg-white rounded-xl border-2 border-neutral-200 p-4">
        <CardContent className="p-0">
          <h3 className="text-xl font-medium mb-4">Lista de hilos necesarios</h3>
          
          <div className="bg-neutral-100 rounded-xl p-4 mb-4">
            <p className="text-lg mb-2">Información del patrón:</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="text-neutral-700 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
                <span>Dimensiones: {patternWidth} x {patternHeight} puntos</span>
              </li>
              <li className="flex items-center">
                <svg className="text-neutral-700 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r="2.5" />
                  <circle cx="19" cy="17" r="2" />
                  <circle cx="5" cy="17" r="2" />
                  <path d="M13.5 9a5 5 0 0 1 5 5" />
                  <line x1="6.5" y1="12" x2="13.5" y2="12" />
                  <path d="M16 17a2 2 0 0 0 0-4" />
                  <path d="M8 17a2 2 0 0 1 0-4" />
                </svg>
                <span>Colores: {threadList.length} colores {getThreadName(threadType)}</span>
              </li>
              <li className="flex items-center">
                <svg className="text-neutral-700 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                  <path d="M12 6v6l3 3" />
                </svg>
                <span>Tela: {getFabricName(fabricType)}</span>
              </li>
              <li className="flex items-center">
                <svg className="text-neutral-700 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
                <span>Dificultad: {difficulty}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {threadList.map((thread, index) => (
              <div key={index} className="thread-item flex items-center p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div 
                  className="thread-color-sample mr-3" 
                  style={{ backgroundColor: thread.color }}
                ></div>
                <div className="flex-1">
                  <div className="font-medium">{getThreadName(threadType)} {thread.code}</div>
                  <div className="text-sm text-neutral-600">{thread.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{thread.count} pts</div>
                  <div className="text-sm text-neutral-600">{thread.skeins} madeja{thread.skeins !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreadCalculator;
