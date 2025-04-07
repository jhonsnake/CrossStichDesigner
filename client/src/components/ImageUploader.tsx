import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUploaded: (imagePath: string, fileName: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      setIsDragging(true);
    }
  }, []);

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos JPG o PNG",
        variant: "destructive"
      });
      return false;
    }

    // 5MB max size
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo es de 5MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        uploadImage(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        uploadImage(file);
      }
    }
  }, []);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        const imageKey = 'cross-stitch-current-image';
        // Limpiar imagen anterior si existe
        localStorage.removeItem(imageKey);
        localStorage.setItem(imageKey, base64Image);
        onImageUploaded(imageKey, file.name);
        setIsUploading(false);
      };
      reader.onerror = () => {
        throw new Error('Error reading file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      let message = 'Error al procesar la imagen';
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <div id="image-uploader">
      <Card className="bg-white rounded-2xl p-6 shadow-soft mb-8">
        <CardContent className="p-0">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Subir imagen</h2>
          
          <div 
            className={`border-2 border-dashed ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'} rounded-xl p-8 text-center transition-all cursor-pointer`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="flex flex-col items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="text-7xl text-primary-400 mb-4 h-20 w-20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Arrastra tu imagen aquí</h3>
              <p className="text-neutral-600 text-lg mb-6">o haz clic para seleccionar</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-lg font-medium shadow-lg inline-flex items-center border-2 border-blue-700"
                disabled={isUploading}
                style={{ fontWeight: 'bold' }}
              >
                <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{isUploading ? 'Subiendo...' : 'Seleccionar imagen'}</span>
              </Button>
              <input 
                id="file-input" 
                type="file" 
                accept=".jpg,.jpeg,.png" 
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="mt-4 text-neutral-500">Formatos permitidos: JPG, PNG</p>
            </div>
          </div>
          
          <div className="mt-8 bg-neutral-100 p-4 rounded-xl">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <svg className="text-amber-500 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Consejos para mejores resultados:</span>
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Utiliza imágenes con buena resolución y contraste</li>
              <li>Las imágenes más simples generan patrones más fáciles de seguir</li>
              <li>Evita imágenes con muchos detalles pequeños</li>
              <li>Las imágenes con fondos sencillos suelen dar mejores resultados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploader;
