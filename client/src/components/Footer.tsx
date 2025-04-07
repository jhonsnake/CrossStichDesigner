import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-8">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-neutral-600 text-lg">© 2023 Generador de Patrones de Punto de Cruz</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-600 hover:text-primary-400 text-lg">
              <span>Ayuda</span>
            </a>
            <a href="#" className="text-neutral-600 hover:text-primary-400 text-lg">
              <span>Contacto</span>
            </a>
            <a href="#" className="text-neutral-600 hover:text-primary-400 text-lg">
              <span>Privacidad</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
