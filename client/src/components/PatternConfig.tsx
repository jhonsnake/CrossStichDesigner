import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fabricTypes, threadTypes } from '@shared/schema';

interface PatternConfigProps {
  imagePath: string;
  imageFileName: string;
  onPatternConfigured: (settings: {
    width: number;
    height: number;
    fabricType: string;
    threadType: string;
    colorCount: number;
    limitColors: boolean;
  }) => void;
  onGoBack: () => void;
}

const PatternConfig: React.FC<PatternConfigProps> = ({
  imagePath,
  imageFileName,
  onPatternConfigured,
  onGoBack
}) => {
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);
  const [fabricType, setFabricType] = useState('aida14');
  const [threadType, setThreadType] = useState('dmc');
  const [colorManagement, setColorManagement] = useState<'auto' | 'specific'>('auto');
  const [colorCount, setColorCount] = useState(15);

  const handleGeneratePattern = () => {
    onPatternConfigured({
      width,
      height,
      fabricType,
      threadType,
      colorCount,
      limitColors: colorManagement === 'specific'
    });
  };

  return (
    <div id="pattern-configuration">
      <Card className="bg-white rounded-2xl p-6 shadow-soft mb-8">
        <CardContent className="p-0">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Configurar patrón</h2>
          
          {/* Preview Image & Configuration */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-full md:w-1/3">
              <div className="bg-neutral-100 rounded-xl p-4 text-center">
                <div className="bg-white rounded-lg p-2 mb-4">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={imagePath} 
                      alt="Preview" 
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-medium">Tu imagen</h3>
                <p className="text-neutral-600">{imageFileName}</p>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="mb-6">
                <Label className="block text-xl font-medium mb-2">Dimensiones del patrón</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-neutral-700 mb-1">Ancho (puntos)</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        id="pattern-width" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 text-lg focus:ring-primary-400"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        min={10}
                        max={300}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="block text-neutral-700 mb-1">Alto (puntos)</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        id="pattern-height" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 text-lg focus:ring-primary-400"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value))}
                        min={10}
                        max={300}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="block text-xl font-medium mb-2">Tipo de tela</Label>
                <Select
                  value={fabricType}
                  onValueChange={setFabricType}
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 text-lg">
                    <SelectValue placeholder="Seleccionar tipo de tela" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricTypes.map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <Label className="block text-xl font-medium mb-2">Tipo de hilo</Label>
                <Select
                  value={threadType}
                  onValueChange={setThreadType}
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 text-lg">
                    <SelectValue placeholder="Seleccionar tipo de hilo" />
                  </SelectTrigger>
                  <SelectContent>
                    {threadTypes.map((thread) => (
                      <SelectItem key={thread.id} value={thread.id}>
                        {thread.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Color management options */}
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">Gestión de colores</h3>
            <div className="bg-neutral-100 rounded-xl p-5">
              <RadioGroup 
                value={colorManagement} 
                onValueChange={(value) => setColorManagement(value as 'auto' | 'specific')}
              >
                <div className="flex items-center mb-4">
                  <RadioGroupItem value="auto" id="color-auto" className="h-5 w-5 text-primary-400" />
                  <Label htmlFor="color-auto" className="ml-2 text-lg">Selección automática de colores</Label>
                  <div className="help-tooltip ml-2">
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="tooltip-text">La aplicación seleccionará automáticamente los colores óptimos para tu patrón</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <RadioGroupItem value="specific" id="color-specific" className="h-5 w-5 text-primary-400" />
                  <Label htmlFor="color-specific" className="ml-2 text-lg">Limitar número de colores</Label>
                  <div className="help-tooltip ml-2">
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="tooltip-text">Selecciona un número específico de colores para simplificar tu patrón</span>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="mt-4 pl-7">
                <Label className="block text-neutral-700 mb-1">Número de colores</Label>
                <Input 
                  type="number" 
                  id="color-count" 
                  className="w-full md:w-1/3 px-4 py-3 rounded-xl border-2 border-neutral-300 text-lg focus:ring-primary-400"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                  min={3}
                  max={50}
                  disabled={colorManagement === 'auto'}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Button 
              variant="outline"
              className="inline-flex items-center justify-center py-3 px-6 border-2 border-neutral-300 text-neutral-800 rounded-xl text-lg font-medium hover:bg-neutral-100"
              onClick={onGoBack}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Volver</span>
            </Button>
            
            <Button 
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-lg font-medium shadow-lg border-2 border-blue-700"
              onClick={handleGeneratePattern}
              style={{ fontWeight: 'bold' }}
            >
              <span>Generar patrón</span>
              <svg className="ml-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternConfig;
