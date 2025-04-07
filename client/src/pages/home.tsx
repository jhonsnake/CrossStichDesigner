import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepProgress from '@/components/StepProgress';
import ImageUploader from '@/components/ImageUploader';
import PatternConfig from '@/components/PatternConfig';
import PatternViewer from '@/components/PatternViewer';
import PDFPreview from '@/components/PDFPreview';
import { useToast } from '@/hooks/use-toast';

export type Step = 'upload' | 'configure' | 'view' | 'download';

interface PatternSettings {
  width: number;
  height: number;
  fabricType: string;
  threadType: string;
  colorCount: number;
  limitColors: boolean;
}

interface ThreadColor {
  code: string;
  name: string;
  color: string;
  count: number;
  skeins: number;
}

interface PatternData {
  imagePath: string;
  imageFileName: string;
  settings?: PatternSettings;
  patternMatrix?: Array<Array<string>>;
  threadList?: ThreadColor[];
  difficulty?: 'Sencilla' | 'Media' | 'Difícil';
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const { toast } = useToast();

  const handleImageUploaded = (imagePath: string, fileName: string) => {
    setPatternData({
      imagePath,
      imageFileName: fileName
    });
    setCurrentStep('configure');
    toast({
      title: "Imagen subida con éxito",
      description: "Ahora puedes configurar tu patrón",
    });
  };

  const handlePatternConfigured = (settings: PatternSettings) => {
    if (!patternData) return;
    
    setPatternData({
      ...patternData,
      settings
    });
    setCurrentStep('view');
    toast({
      title: "Patrón generado",
      description: "Tu patrón ha sido generado correctamente",
    });
  };

  const handlePatternGenerated = (patternMatrix: Array<Array<string>>, threadList: ThreadColor[], difficulty: 'Sencilla' | 'Media' | 'Difícil') => {
    if (!patternData) return;
    
    setPatternData({
      ...patternData,
      patternMatrix,
      threadList,
      difficulty
    });
  };

  const goToDownload = () => {
    setCurrentStep('download');
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const resetPattern = () => {
    setPatternData(null);
    setCurrentStep('upload');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <StepProgress currentStep={currentStep} />
          
          {currentStep === 'upload' && (
            <ImageUploader onImageUploaded={handleImageUploaded} />
          )}
          
          {currentStep === 'configure' && patternData && (
            <PatternConfig 
              imagePath={patternData.imagePath} 
              imageFileName={patternData.imageFileName}
              onPatternConfigured={handlePatternConfigured}
              onGoBack={() => goToStep('upload')}
            />
          )}
          
          {currentStep === 'view' && patternData && patternData.settings && (
            <PatternViewer 
              patternData={patternData}
              onPatternGenerated={handlePatternGenerated}
              onGoBack={() => goToStep('configure')}
              onGoForward={goToDownload}
            />
          )}
          
          {currentStep === 'download' && patternData && patternData.settings && (
            <PDFPreview 
              patternData={patternData}
              onGoBack={() => goToStep('view')}
              onNewPattern={resetPattern}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
