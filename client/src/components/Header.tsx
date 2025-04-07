import React from 'react';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

const Header: React.FC = () => {
  const handleHelpClick = () => {
    // Open help instructions modal (simplified for now)
    window.alert('¡Esta función estará disponible próximamente!');
  };

  return (
    <header className="bg-white shadow-soft">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Scissors className="text-primary-400 text-3xl mr-2" />
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">Generador de Patrones de Punto de Cruz</h1>
          </div>
          <Button 
            className="bg-primary-400 hover:bg-primary-500 text-white py-3 px-6 rounded-xl text-lg font-medium shadow-button"
            onClick={handleHelpClick}
          >
            <span className="ri-question-line mr-2">?</span>
            <span>Ayuda</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
