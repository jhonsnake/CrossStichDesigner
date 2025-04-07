import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { processImage } from '@/utils/imageProcessor';
import ThreadCalculator from '@/components/ThreadCalculator';

interface ThreadColor {
  code: string;
  name: string;
  color: string;
  count: number;
  skeins: number;
}

interface PatternViewerProps {
  patternData: {
    imagePath: string;
    imageFileName: string;
    settings: {
      width: number;
      height: number;
      fabricType: string;
      threadType: string;
      colorCount: number;
      limitColors: boolean;
    };
    patternMatrix?: Array<Array<string>>;
    threadList?: ThreadColor[];
    difficulty?: 'Sencilla' | 'Media' | 'Difícil';
  };
  onPatternGenerated: (patternMatrix: Array<Array<string>>, threadList: ThreadColor[], difficulty: 'Sencilla' | 'Media' | 'Difícil') => void;
  onGoBack: () => void;
  onGoForward: () => void;
}

const PatternViewer: React.FC<PatternViewerProps> = ({
  patternData,
  onPatternGenerated,
  onGoBack,
  onGoForward
}) => {
  const [patternMatrix, setPatternMatrix] = useState<Array<Array<string>>>([]);
  const [threadList, setThreadList] = useState<ThreadColor[]>([]);
  const [difficulty, setDifficulty] = useState<'Sencilla' | 'Media' | 'Difícil'>('Media');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showSymbols, setShowSymbols] = useState(true);
  const [showColors, setShowColors] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generatePattern = async () => {
      setIsGenerating(true);
      try {
        // Get image data from localStorage
        const imageData = localStorage.getItem(patternData.imagePath);
        if (!imageData) {
          throw new Error('Image not found in localStorage');
        }

        const { matrix, colors, patternDifficulty } = await processImage(
          imageData,
          {
            width: patternData.settings.width,
            height: patternData.settings.height,
            limitColors: patternData.settings.limitColors,
            colorCount: patternData.settings.limitColors ? patternData.settings.colorCount : undefined,
            threadType: patternData.settings.threadType
          }
        );
        
        setPatternMatrix(matrix);
        setThreadList(colors);
        setDifficulty(patternDifficulty);
        
        // Notify parent component
        onPatternGenerated(matrix, colors, patternDifficulty);
        
        // Draw pattern on canvas
        drawPatternOnCanvas(matrix, colors);
      } catch (error) {
        console.error('Error generating pattern:', error);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generatePattern();
  }, [patternData.imagePath, patternData.settings]);

  useEffect(() => {
    if (patternMatrix.length > 0 && threadList.length > 0) {
      drawPatternOnCanvas(patternMatrix, threadList);
    }
  }, [zoom, showGrid, showSymbols, showColors, showNumbers, patternMatrix, threadList]);

  const drawPatternOnCanvas = (matrix: Array<Array<string>>, colors: ThreadColor[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cellSize = Math.max(Math.floor(zoom / 10), 5); // Adjust cell size based on zoom
    
    canvas.width = matrix[0].length * cellSize;
    canvas.height = matrix.length * cellSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pattern
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const colorCode = matrix[y][x];
        const threadColor = colors.find(c => c.code === colorCode);
        
        if (threadColor) {
          // Draw color fill
          if (showColors) {
            ctx.fillStyle = threadColor.color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
          
          // Draw symbol
          if (showSymbols) {
            ctx.fillStyle = getContrastColor(threadColor.color);
            ctx.font = `${Math.max(cellSize * 0.6, 8)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Use a simple symbol based on the color code
            const symbol = getSymbolForColor(threadColor.code);
            ctx.fillText(
              symbol, 
              x * cellSize + cellSize / 2, 
              y * cellSize + cellSize / 2
            );
          }
        }
        
        // Draw grid
        if (showGrid) {
          ctx.strokeStyle = '#dddddd';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
        
        // Draw grid numbers (every 10 cells)
        if (showNumbers && (x % 10 === 0 || y % 10 === 0)) {
          if (x % 10 === 0 && y % 10 === 0) {
            ctx.fillStyle = '#000000';
            ctx.font = `${Math.max(cellSize * 0.5, 6)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              `${x},${y}`,
              x * cellSize + cellSize / 2,
              y * cellSize + cellSize / 2
            );
          }
        }
      }
    }
  };

  const getContrastColor = (hexColor: string): string => {
    // Simple contrast algorithm - use white text on dark colors, black text on light colors
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000000' : '#ffffff';
  };

  const getSymbolForColor = (colorCode: string): string => {
    // Use a simple mapping of color codes to symbols
    const symbols = ['✓', '×', '○', '●', '□', '■', '△', '▲', '◇', '◆', '+', '-', '=', '~', '*', '#', '@', '&', '%', '$', '!', '?', ':', ';'];
    const index = parseInt(colorCode.replace(/\D/g, '')) % symbols.length;
    return symbols[index];
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 20, 300));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 20, 20));
  };

  return (
    <div id="pattern-viewer">
      <Card className="bg-white rounded-2xl p-6 shadow-soft mb-8">
        <CardContent className="p-0">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Visualizar patrón</h2>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-400 mb-4"></div>
              <p className="text-xl">Generando tu patrón...</p>
              <p className="text-neutral-600 mt-2">Esto puede tardar unos momentos</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Pattern Preview */}
              <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-xl border-2 border-neutral-200 p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">Vista previa del patrón</h3>
                    
                    {/* Zoom Controls */}
                    <div className="zoom-controls flex items-center space-x-2">
                      <Button 
                        className="bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg"
                        onClick={handleZoomOut}
                        variant="ghost"
                        size="icon"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </Button>
                      <span className="text-lg">{zoom}%</span>
                      <Button 
                        className="bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg"
                        onClick={handleZoomIn}
                        variant="ghost"
                        size="icon"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Pattern Grid Container */}
                  <div className="pattern-preview h-96 border border-neutral-300 rounded-lg bg-white overflow-auto">
                    <canvas ref={canvasRef} className="pattern-canvas"></canvas>
                  </div>
                </div>
                
                {/* View Controls */}
                <div className="bg-neutral-100 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-medium mb-3">Opciones de visualización</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-grid" 
                        checked={showGrid} 
                        onCheckedChange={(checked) => setShowGrid(checked as boolean)}
                        className="h-5 w-5 text-primary-400 focus:ring-primary-400"
                      />
                      <Label htmlFor="show-grid" className="ml-2 text-lg">Mostrar cuadrícula</Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-symbols" 
                        checked={showSymbols} 
                        onCheckedChange={(checked) => setShowSymbols(checked as boolean)}
                        className="h-5 w-5 text-primary-400 focus:ring-primary-400"
                      />
                      <Label htmlFor="show-symbols" className="ml-2 text-lg">Mostrar símbolos</Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-colors" 
                        checked={showColors} 
                        onCheckedChange={(checked) => setShowColors(checked as boolean)}
                        className="h-5 w-5 text-primary-400 focus:ring-primary-400"
                      />
                      <Label htmlFor="show-colors" className="ml-2 text-lg">Mostrar colores</Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-numbers" 
                        checked={showNumbers} 
                        onCheckedChange={(checked) => setShowNumbers(checked as boolean)}
                        className="h-5 w-5 text-primary-400 focus:ring-primary-400"
                      />
                      <Label htmlFor="show-numbers" className="ml-2 text-lg">Mostrar numeración</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thread List */}
              <ThreadCalculator 
                threadList={threadList}
                patternWidth={patternData.settings.width}
                patternHeight={patternData.settings.height}
                fabricType={patternData.settings.fabricType}
                threadType={patternData.settings.threadType}
                difficulty={difficulty}
              />
            </div>
          )}
          
          <div className="mt-8 flex flex-col md:flex-row justify-between gap-4">
            <Button 
              variant="outline"
              className="inline-flex items-center justify-center py-3 px-6 border-2 border-gray-600 bg-white text-gray-800 rounded-xl text-lg font-medium hover:bg-gray-100 shadow-lg"
              onClick={onGoBack}
              disabled={isGenerating}
              style={{ fontWeight: 'bold', opacity: 1, visibility: 'visible' }}
            >
              <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Ajustar configuración</span>
            </Button>
            
            <Button 
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-lg font-medium shadow-lg border-2 border-blue-700"
              onClick={onGoForward}
              disabled={isGenerating}
              style={{ fontWeight: 'bold', opacity: 1, visibility: 'visible' }}
            >
              <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Descargar PDF</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternViewer;
