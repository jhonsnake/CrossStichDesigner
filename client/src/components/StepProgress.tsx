import React from 'react';
import { type Step } from '@/pages/home';

interface StepProgressProps {
  currentStep: Step;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps: { id: Step; title: string; description: string }[] = [
    { id: 'upload', title: 'Subir imagen', description: 'Sube una imagen para convertir en patrón' },
    { id: 'configure', title: 'Configurar patrón', description: 'Ajusta dimensiones, tipo de tela y colores' },
    { id: 'view', title: 'Visualizar patrón', description: 'Ver el patrón generado con símbolos y colores' },
    { id: 'download', title: 'Descargar PDF', description: 'Obtén tu patrón con instrucciones detalladas' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-4 md:mb-0">Proceso de creación</h2>
          <div className="flex items-center bg-neutral-100 rounded-xl p-1">
            <div className="flex items-center bg-primary-400 text-white px-4 py-3 rounded-xl font-medium text-lg">
              <span className="mr-2">{
                currentStep === 'upload' ? '📷' : 
                currentStep === 'configure' ? '⚙️' : 
                currentStep === 'view' ? '👁️' : '📄'
              }</span>
              <span>Paso {currentStepIndex + 1}: {steps[currentStepIndex].title}</span>
            </div>
          </div>
        </div>
        
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          const stepStatus = isActive ? 'active' : isPast ? 'past' : 'future';
          
          return (
            <div 
              key={step.id} 
              className={`flex items-center relative ${index < steps.length - 1 ? 'mb-2 mt-6' : 'mt-6'} ${stepStatus === 'future' ? 'opacity-50' : ''}`}
            >
              <div 
                className={`flex items-center justify-center w-12 h-12 ${
                  stepStatus === 'active' || stepStatus === 'past' ? 'bg-primary-400' : 'bg-neutral-300'
                } text-white rounded-full text-xl font-semibold`}
              >
                {index + 1}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-neutral-600 text-lg">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`h-2 absolute left-6 top-24 bottom-0 w-0.5 ${
                    stepStatus === 'past' ? 'bg-primary-200' : 'bg-neutral-200'
                  }`} 
                  aria-hidden="true"
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
