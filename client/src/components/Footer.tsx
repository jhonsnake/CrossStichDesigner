import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-8">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-muted-foreground text-lg">© 2025 Generador de Patrones de Punto de Cruz por John Prada</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="link text-lg transition-colors">
              <span>Ayuda</span>
            </a>
            <a href="#" className="link text-lg transition-colors">
              <span>Contacto</span>
            </a>
            <a href="#" className="link text-lg transition-colors">
              <span>Privacidad</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
