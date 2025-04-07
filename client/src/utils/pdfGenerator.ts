import { jsPDF } from 'jspdf';
import 'jspdf/dist/polyfills.es';
import { fabricTypes, threadTypes } from '@shared/schema';

// Define types for parameters
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
}

// Function to generate symbols for colors
const getSymbolForColor = (colorCode: string): string => {
  const symbols = ['✓', '×', '○', '●', '□', '■', '△', '▲', '◇', '◆', '+', '-', '=', '~', '*', '#', '@', '&', '%', '$', '!', '?', ':', ';'];
  const index = parseInt(colorCode.replace(/\D/g, '')) % symbols.length;
  return symbols[index];
};

// Function to get contrasting color for text over a background color
const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? '#000000' : '#ffffff';
};

// Function to draw pattern grid on PDF
const drawPatternGrid = (
  doc: jsPDF, 
  matrix: Array<Array<string>>, 
  colors: ThreadColor[], 
  startX: number, 
  startY: number, 
  cellSize: number, 
  maxWidth: number, 
  maxHeight: number,
  showGrid: boolean = true,
  showSymbols: boolean = true,
  showColors: boolean = true,
  showGridNumbers: boolean = true
) => {
  try {
    console.log('Dibujando cuadrícula del patrón...');
    
    if (!matrix || matrix.length === 0 || !matrix[0] || matrix[0].length === 0) {
      console.error('Matriz de patrón inválida:', matrix);
      return 0;
    }
    
    const pagesNeeded = Math.ceil((matrix.length * cellSize) / maxHeight) * 
                        Math.ceil((matrix[0].length * cellSize) / maxWidth);
    
    console.log(`El patrón ocupará ${pagesNeeded} páginas en el PDF.`);
    
    let currentPage = 0;
    
    // Calculate number of rows and columns per page
    const colsPerPage = Math.floor(maxWidth / cellSize);
    const rowsPerPage = Math.floor(maxHeight / cellSize);
    
    // Calculate total pages in X and Y direction
    const pagesX = Math.ceil(matrix[0].length / colsPerPage);
    const pagesY = Math.ceil(matrix.length / rowsPerPage);
    
    // Draw pattern page by page
    for (let pageY = 0; pageY < pagesY; pageY++) {
      for (let pageX = 0; pageX < pagesX; pageX++) {
        // Add new page if needed (skip for first page)
        if (currentPage > 0) {
          doc.addPage();
        }
        
        console.log(`Dibujando sección ${pageY + 1}-${pageX + 1} del patrón`);
        
        // Calculate start and end indices for this page
        const startCol = pageX * colsPerPage;
        const endCol = Math.min(startCol + colsPerPage, matrix[0].length);
        const startRow = pageY * rowsPerPage;
        const endRow = Math.min(startRow + rowsPerPage, matrix.length);
        
        // Add page title and section indicators
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Patrón - Sección ${pageY + 1}-${pageX + 1} (de ${pagesY} x ${pagesX})`, startX, startY - 10);
        
        // Add guides for stitching multiple pages
        if (pagesNeeded > 1) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const connectText = `Conecta con: ${pageY > 0 ? `Arriba: Sección ${pageY}-${pageX + 1}` : ''} ${pageX > 0 ? `Izquierda: Sección ${pageY + 1}-${pageX}` : ''} ${pageX < pagesX - 1 ? `Derecha: Sección ${pageY + 1}-${pageX + 2}` : ''} ${pageY < pagesY - 1 ? `Abajo: Sección ${pageY + 2}-${pageX + 1}` : ''}`;
          doc.text(connectText, startX, startY - 5);
        }
        
        // Draw grid for this section
        for (let y = startRow; y < endRow; y++) {
          for (let x = startCol; x < endCol; x++) {
            try {
              // Ensure the matrix position exists
              if (!matrix[y] || matrix[y][x] === undefined) continue;
              
              const colorCode = matrix[y][x];
              if (!colorCode) continue; // Skip empty cells
              
              const threadColor = colors.find(c => c.code === colorCode);
              if (!threadColor) continue;
              
              const xPos = startX + (x - startCol) * cellSize;
              const yPos = startY + (y - startRow) * cellSize;
              
              // Draw color fill
              if (showColors) {
                // Validate color format
                let fillColor = threadColor.color;
                if (!fillColor.startsWith('#') || fillColor.length !== 7) {
                  fillColor = '#000000'; // Default to black if invalid color
                }
                
                doc.setFillColor(fillColor);
                doc.rect(xPos, yPos, cellSize, cellSize, 'F');
              }
              
              // Draw grid
              if (showGrid) {
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.1);
                doc.rect(xPos, yPos, cellSize, cellSize, 'S');
              }
              
              // Draw symbol
              if (showSymbols) {
                const symbol = String(getSymbolForColor(threadColor.code));
                const contrastColor = getContrastColor(threadColor.color);
                
                doc.setTextColor(contrastColor);
                doc.setFontSize(cellSize * 0.7);
                doc.text(symbol, xPos + cellSize / 2, yPos + cellSize / 2, { align: 'center', baseline: 'middle' });
              }
              
              // Draw grid numbers (every 10 cells)
              if (showGridNumbers && (x % 10 === 0 || y % 10 === 0)) {
                if (x % 10 === 0 && y % 10 === 0) {
                  doc.setTextColor(0, 0, 0);
                  doc.setFontSize(cellSize * 0.4);
                  doc.text(`${x},${y}`, xPos + cellSize / 2, yPos + cellSize / 2, { align: 'center', baseline: 'middle' });
                }
              }
            } catch (cellError) {
              console.error(`Error dibujando celda en (${x},${y}):`, cellError);
              // Continue with next cell
              continue;
            }
          }
        }
        
        currentPage++;
      }
    }
    
    console.log('Cuadrícula del patrón dibujada correctamente.');
    return pagesNeeded;
  } catch (error) {
    console.error('Error en drawPatternGrid:', error);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    return 1; // Return at least 1 page on error
  }
};

// Function to draw thread color legend
const drawThreadLegend = (
  doc: jsPDF, 
  colors: ThreadColor[], 
  threadType: string, 
  startX: number, 
  startY: number
) => {
  try {
    console.log('Dibujando lista de hilos necesarios...');
    
    // Add title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Hilos Necesarios', startX, startY);
    
    startY += 10;
    
    // Get thread type name
    const getThreadName = (id: string): string => {
      const thread = threadTypes.find(t => t.id === id);
      return thread ? thread.name : id;
    };
    
    const threadName = getThreadName(threadType);
    
    // Draw header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Color', startX, startY);
    doc.text('Código', startX + 15, startY);
    doc.text('Nombre', startX + 35, startY);
    doc.text('Puntos', startX + 90, startY);
    doc.text('Madejas', startX + 115, startY);
    
    startY += 5;
    doc.setLineWidth(0.2);
    doc.line(startX, startY, startX + 140, startY);
    
    startY += 5;
    
    // Draw color entries
    doc.setFont('helvetica', 'normal');
    
    console.log(`Procesando ${colors.length} hilos en la lista...`);
    
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      
      try {
        // Attempt to parse color for setFillColor
        let fillColor = color.color;
        // Default to black if color is invalid
        if (!fillColor.startsWith('#') || fillColor.length !== 7) {
          fillColor = '#000000';
        }
        
        // Draw color sample
        doc.setFillColor(fillColor);
        doc.rect(startX, startY - 4, 10, 6, 'F');
        
        // Draw color code - ensure it's a string
        const codeText = `${threadName} ${color.code}`;
        doc.text(codeText, startX + 15, startY);
        
        // Draw color name (truncate if too long) - ensure it's a string
        let colorName = String(color.name || '');
        if (colorName.length > 25) {
          colorName = colorName.substring(0, 22) + '...';
        }
        doc.text(colorName, startX + 35, startY);
        
        // Draw count - ensure it's a string
        const countText = String(color.count || 0);
        doc.text(countText, startX + 90, startY);
        
        // Draw skeins - ensure it's a string
        const skeinsText = String(color.skeins || 0);
        doc.text(skeinsText, startX + 115, startY);
        
        // Move to next line
        startY += 8;
        
        // Check if we need a new page
        if (startY > 280) {
          doc.addPage();
          startY = 20;
          
          // Redraw header on new page
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Lista de Hilos Necesarios (continuación)', startX, startY);
          
          startY += 10;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Color', startX, startY);
          doc.text('Código', startX + 15, startY);
          doc.text('Nombre', startX + 35, startY);
          doc.text('Puntos', startX + 90, startY);
          doc.text('Madejas', startX + 115, startY);
          
          startY += 5;
          doc.setLineWidth(0.2);
          doc.line(startX, startY, startX + 140, startY);
          
          startY += 5;
          doc.setFont('helvetica', 'normal');
        }
      } catch (err) {
        console.error(`Error al procesar el hilo #${i}:`, err);
        // Continue with the next color
        continue;
      }
    }
    
    console.log('Lista de hilos completada.');
    return startY;
  } catch (error) {
    console.error('Error en drawThreadLegend:', error);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    // Return a valid Y position even on error
    return startY + 30;
  }
};

// Function to add symbol legend
const drawSymbolLegend = (
  doc: jsPDF, 
  colors: ThreadColor[], 
  threadType: string, 
  startX: number, 
  startY: number
) => {
  try {
    console.log('Dibujando leyenda de símbolos...');
    
    // Add title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Leyenda de Símbolos', startX, startY);
    
    startY += 10;
    
    // Get thread type name
    const getThreadName = (id: string): string => {
      const thread = threadTypes.find(t => t.id === id);
      return thread ? thread.name : id;
    };
    
    const threadName = getThreadName(threadType);
    
    // Draw header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Símbolo', startX, startY);
    doc.text('Código', startX + 20, startY);
    doc.text('Color', startX + 50, startY);
    
    startY += 5;
    doc.setLineWidth(0.2);
    doc.line(startX, startY, startX + 100, startY);
    
    startY += 5;
    
    // Draw symbol entries
    doc.setFont('helvetica', 'normal');
    
    // Calculate columns for symbols (2 columns)
    const itemsPerColumn = Math.ceil(colors.length / 2);
    let currentColumn = 0;
    let itemsInCurrentColumn = 0;
    
    console.log(`Procesando ${colors.length} colores en la leyenda...`);
    
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const xOffset = currentColumn * 110;
      
      // Draw symbol - sanitize and ensure it's a string
      const symbol = String(getSymbolForColor(color.code));
      doc.setFontSize(12);
      doc.text(symbol, startX + xOffset + 5, startY);
      
      // Draw color code - ensure it's a string
      doc.setFontSize(10);
      const codeText = `${threadName} ${color.code}`;
      doc.text(codeText, startX + xOffset + 20, startY);
      
      // Draw color name (truncate if too long) - ensure it's a string
      let colorName = String(color.name || '');
      if (colorName.length > 20) {
        colorName = colorName.substring(0, 17) + '...';
      }
      doc.text(colorName, startX + xOffset + 50, startY);
      
      // Move to next line or column
      itemsInCurrentColumn++;
      if (itemsInCurrentColumn >= itemsPerColumn) {
        currentColumn++;
        itemsInCurrentColumn = 0;
        if (currentColumn < 2) {
          startY -= itemsPerColumn * 8; // Reset Y position for the next column
        }
      } else {
        startY += 8;
      }
      
      // Check if we need a new page
      if (itemsInCurrentColumn === 0 && currentColumn === 2) {
        doc.addPage();
        startY = 20;
        currentColumn = 0;
        
        // Redraw header on new page
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Leyenda de Símbolos (continuación)', startX, startY);
        
        startY += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Símbolo', startX, startY);
        doc.text('Código', startX + 20, startY);
        doc.text('Color', startX + 50, startY);
        
        startY += 5;
        doc.setLineWidth(0.2);
        doc.line(startX, startY, startX + 100, startY);
        
        startY += 5;
        doc.setFont('helvetica', 'normal');
      }
    }
    
    console.log('Leyenda de símbolos completada.');
    return startY;
  } catch (error) {
    console.error('Error en drawSymbolLegend:', error);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    // Return a valid Y position even on error
    return startY + 30;
  }
};

// Function to add instructions page
const addInstructionsPage = (
  doc: jsPDF, 
  patternData: PatternData
) => {
  doc.addPage();
  
  // Set title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Instrucciones para el Punto de Cruz', 20, 20);
  
  doc.setFontSize(14);
  doc.text('Información del Patrón', 20, 35);
  
  // Add pattern information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const getFabricName = (id: string): string => {
    const fabric = fabricTypes.find(f => f.id === id);
    return fabric ? fabric.name : id;
  };
  
  const getThreadName = (id: string): string => {
    const thread = threadTypes.find(t => t.id === id);
    return thread ? thread.name : id;
  };
  
  const fabricName = getFabricName(patternData.settings.fabricType);
  const threadName = getThreadName(patternData.settings.threadType);
  
  // Add pattern details
  doc.setFont('helvetica', 'bold');
  doc.text('Dimensiones:', 20, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patternData.settings.width} x ${patternData.settings.height} puntos`, 70, 45);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tela:', 20, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(fabricName, 70, 53);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo de hilo:', 20, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(threadName, 70, 61);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Número de colores:', 20, 69);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patternData.threadList?.length || 0}`, 70, 69);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Dificultad:', 20, 77);
  doc.setFont('helvetica', 'normal');
  doc.text(patternData.difficulty || 'Media', 70, 77);
  
  // Add basic instructions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Consejos para Principiantes', 20, 90);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const instructions = [
    '1. Comienza siempre desde el centro del patrón y trabaja hacia afuera.',
    '2. Marca cada 10 puntos en tu tela para facilitar el conteo.',
    '3. Utiliza un bastidor para mantener la tela tensa durante el bordado.',
    '4. Completa un color a la vez para reducir el cambio de hilos.',
    '5. No hagas nudos en el reverso de tu trabajo, asegura los hilos pasando',
    '   por debajo de otras puntadas ya realizadas.',
    '6. Para patrones grandes divididos en secciones, completa una sección antes',
    '   de pasar a la siguiente.',
    '7. Guarda tu trabajo protegido del polvo y la luz cuando no estés bordando.',
    '8. Si el patrón tiene muchos símbolos similares, usa un resaltador para',
    '   marcar las áreas ya completadas en la guía impresa.'
  ];
  
  let yPos = 100;
  for (const line of instructions) {
    doc.text(line, 20, yPos);
    yPos += 8;
  }
  
  // Add information about connecting sections
  if ((patternData.settings.width > 50 || patternData.settings.height > 50)) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Uniendo las Secciones del Patrón', 20, 175);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const sectionInstructions = [
      '1. Este patrón está dividido en secciones para facilitar su impresión y uso.',
      '2. Cada sección está numerada en formato "Fila-Columna" (por ejemplo, 1-2).',
      '3. Las secciones se conectan siguiendo la numeración: las secciones de la misma',
      '   fila se colocan una junto a otra de izquierda a derecha.',
      '4. Las filas se colocan una debajo de otra, de arriba hacia abajo.',
      '5. Use las coordenadas en las esquinas para asegurarse de alinear correctamente',
      '   las secciones al bordar.'
    ];
    
    yPos = 185;
    for (const line of sectionInstructions) {
      doc.text(line, 20, yPos);
      yPos += 8;
    }
  }
  
  // Add finishing note
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('¡Disfruta creando tu bordado de punto de cruz!', 20, 240);
  
  // Add image info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patrón generado a partir de la imagen: ${patternData.imageFileName}`, 20, 280);
};

// Main function to generate PDF
export const generatePDF = async (patternData: PatternData): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Validate pattern data
      if (!patternData.patternMatrix || !patternData.threadList) {
        throw new Error('Datos de patrón incompletos. Por favor, genera el patrón primero.');
      }

      // Get image data from localStorage
      const imageData = localStorage.getItem(patternData.imagePath);
      if (!imageData) {
        throw new Error('Imagen no encontrada en localStorage');
      }

      // Create new PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log('PDF inicializado, añadiendo título');
      
      // Add title page
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Patrón de Punto de Cruz', 105, 30, { align: 'center' });
      
      // Add image name as pattern name
      const patternName = patternData.imageFileName.split('.')[0];
      doc.setFontSize(18);
      doc.text(patternName, 105, 45, { align: 'center' });
      
      // Add creation date
      const date = new Date().toLocaleDateString('es-ES');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Creado el: ${date}`, 105, 55, { align: 'center' });

      // Add original image
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageData;
        });
        
        // Calculate image dimensions to fit in PDF
        const maxWidth = 160; // mm
        const maxHeight = 100; // mm
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        if (imgWidth > maxWidth) {
          const ratio = maxWidth / imgWidth;
          imgWidth = maxWidth;
          imgHeight = imgHeight * ratio;
        }
        
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          imgWidth = imgWidth * ratio;
        }
        
        const x = (210 - imgWidth) / 2; // center horizontally (A4 width = 210mm)
        doc.addImage(imageData, 'JPEG', x, 70, imgWidth, imgHeight);
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
      
      console.log('Añadiendo información del patrón');
      
      // Add pattern summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalles del Patrón', 20, 75);
      
      // Add pattern details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const getFabricName = (id: string): string => {
        const fabric = fabricTypes.find(f => f.id === id);
        return fabric ? fabric.name : id;
      };
      
      const getThreadName = (id: string): string => {
        const thread = threadTypes.find(t => t.id === id);
        return thread ? thread.name : id;
      };
      
      const fabricName = getFabricName(patternData.settings.fabricType);
      const threadName = getThreadName(patternData.settings.threadType);
      
      doc.text(`Dimensiones: ${patternData.settings.width} x ${patternData.settings.height} puntos`, 20, 85);
      doc.text(`Tela: ${fabricName}`, 20, 95);
      doc.text(`Tipo de hilo: ${threadName}`, 20, 105);
      doc.text(`Número de colores: ${patternData.threadList.length}`, 20, 115);
      doc.text(`Dificultad: ${patternData.difficulty || 'Media'}`, 20, 125);
      
      console.log('Añadiendo leyenda de símbolos');
      
      // Add symbol legend on second page
      doc.addPage();
      const legendYPos = drawSymbolLegend(
        doc,
        patternData.threadList,
        patternData.settings.threadType,
        20,  // start X
        20   // start Y
      );
      
      console.log('Añadiendo lista de hilos');
      
      // Add thread list
      const threadListYPos = drawThreadLegend(
        doc,
        patternData.threadList,
        patternData.settings.threadType,
        20,  // start X
        legendYPos + 20
      );
      
      console.log('Añadiendo instrucciones');
      
      // Add instructions page
      addInstructionsPage(doc, patternData);
      
      // Set cell size based on pattern dimensions
      let cellSize = 2;  // default cell size in mm
      if (patternData.settings.width <= 50 && patternData.settings.height <= 50) {
        cellSize = 3;
      } else if (patternData.settings.width > 100 || patternData.settings.height > 100) {
        cellSize = 1.5;
      }
      
      console.log('Dibujando cuadrícula del patrón');
      
      // Add pattern pages
      doc.addPage();
      drawPatternGrid(
        doc, 
        patternData.patternMatrix, 
        patternData.threadList, 
        10,  // start X
        20,  // start Y
        cellSize,
        190,  // max width
        250   // max height
      );
      
      console.log('Guardando PDF');
      
      // Save PDF with pattern name
      const fileName = `patron_${patternName}.pdf`;
      doc.save(fileName);
      
      console.log('PDF generado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
      reject(error);
    }
  });
};