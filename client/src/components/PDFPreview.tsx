import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface ThreadColor {
  code: string;
  name: string;
  color: string;
  count: number;
  skeins: number;
}

interface PDFPreviewProps {
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
  onGoBack: () => void;
  onNewPattern: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  patternData,
  onGoBack,
  onNewPattern
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!patternData.patternMatrix || !patternData.threadList) {
      toast({
        title: "Error",
        description: "No hay datos de patrón disponibles para generar el PDF",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(patternData);
      toast({
        title: "PDF generado",
        description: "Tu PDF ha sido generado y descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al generar el PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getFileName = () => {
    const baseName = patternData.imageFileName.split('.')[0];
    return `patron_${baseName}.pdf`;
  };

  return (
    <div id="pdf-preview">
      <Card className="bg-white rounded-2xl p-6 shadow-soft mb-8">
        <CardContent className="p-0">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Descargar patrón completo</h2>
          
          <div className="bg-neutral-100 rounded-xl p-5 mb-8">
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <svg className="text-red-500 mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Tu PDF incluye:</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="text-green-500 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Patrón completo con símbolos y colores</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="text-green-500 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Lista detallada de materiales necesarios</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="text-green-500 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Guías de corte para patrones grandes</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="text-green-500 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Leyenda de símbolos y códigos de color</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="text-green-500 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Instrucciones detalladas para principiantes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="text-green-500 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Información sobre cómo unir secciones</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 w-full max-w-md text-center">
              <svg className="text-red-500 text-6xl mb-4 mx-auto h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">{getFileName()}</h3>
              <p className="text-neutral-600 mb-6">Información completa del patrón</p>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg flex items-center justify-center border-2 border-red-700"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                style={{ fontWeight: 'bold', opacity: 1, visibility: 'visible' }}
              >
                <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
              </Button>
            </div>
          </div>
          
          <div className="bg-neutral-100 rounded-xl p-5">
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <svg className="text-amber-500 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Consejos para bordar:</span>
            </h3>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="text-primary-400 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>Comienza siempre desde el centro del patrón y trabaja hacia afuera</span>
              </li>
              <li className="flex items-start">
                <svg className="text-primary-400 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>Utiliza un bastidor para mantener la tela tensa y obtener mejores resultados</span>
              </li>
              <li className="flex items-start">
                <svg className="text-primary-400 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>Marca cada 10 puntos en tu tela para facilitar el conteo</span>
              </li>
              <li className="flex items-start">
                <svg className="text-primary-400 mr-2 mt-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>Completa un color a la vez para reducir el cambio de hilos</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button 
              variant="outline"
              className="inline-flex items-center justify-center py-3 px-6 border-2 border-gray-600 bg-white text-gray-800 rounded-xl text-lg font-medium hover:bg-gray-100 shadow-lg"
              onClick={onGoBack}
              style={{ fontWeight: 'bold', opacity: 1, visibility: 'visible' }}
            >
              <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Volver al patrón</span>
            </Button>
            
            <Button 
              className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl text-lg font-medium shadow-lg border-2 border-green-700"
              onClick={onNewPattern}
              style={{ fontWeight: 'bold', opacity: 1, visibility: 'visible' }}
            >
              <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Crear nuevo patrón</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFPreview;
