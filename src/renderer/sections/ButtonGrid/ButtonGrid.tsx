import { GlassButton } from '../../components';
import { useAssetPath } from '../../hooks';
import { ButtonData } from '../../../shared/types';
import './ButtonGrid.css';

interface ButtonGridProps {
  buttons: ButtonData[];
  onButtonClick: (button: ButtonData, index: number) => void;
}

const ButtonGrid: React.FC<ButtonGridProps> = ({
  buttons,
  onButtonClick,
}) => {
  const { img } = useAssetPath();

  // Lógica para calcular distribución de botones
  const calculateButtonDistribution = (totalButtons: number): number[] => {
    const distributions: Record<number, number[]> = {
      1: [1],
      2: [2],
      3: [3],
      4: [2, 2],
      5: [3, 2],
      6: [3, 3]
    };

    if (distributions[totalButtons]) {
      return distributions[totalButtons];
    }

    const buttonsPerRow = Math.ceil(Math.sqrt(totalButtons));
    const distribution: number[] = [];
    let remaining = totalButtons;

    while (remaining > 0) {
      const currentRow = Math.min(buttonsPerRow, remaining);
      distribution.push(currentRow);
      remaining -= currentRow;
    }

    return distribution;
  };

  // Procesar y filtrar botones
  const processedButtons = buttons
    .filter(button => button?.title && button?.icon)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 6)
    .map(button => ({
      ...button,
      title: button.title.trim(),
      icon: button.icon.trim()
    }));

  if (processedButtons.length === 0) {
    return (
      <div className={`button-grid`}>
        <div className="button-grid__error">
          <p>No se encontraron botones válidos</p>
          <p className="button-grid__error-subtitle">Verifica la configuración</p>
        </div>
      </div>
    );
  }

  // Crear filas de botones
  const distribution = calculateButtonDistribution(processedButtons.length);
  const rows: ButtonData[][] = [];
  let buttonIndex = 0;

  for (const buttonsInRow of distribution) {
    const row: ButtonData[] = [];
    for (let i = 0; i < buttonsInRow && buttonIndex < processedButtons.length; i++) {
      row.push(processedButtons[buttonIndex]);
      buttonIndex++;
    }
    rows.push(row);
  }

  const handleButtonClick = (button: ButtonData, globalIndex: number) => {
    onButtonClick(button, globalIndex);
  };

  return (
    <div className={`button-grid`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="button-grid__row">
          {row.map((button, buttonIndex) => {
            const globalIndex = rows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + buttonIndex;
            const iconPath = img(button.icon);

            return (
              <GlassButton
                key={button.id}
                title={button.title}
                icon={iconPath}
                onClick={() => handleButtonClick(button, globalIndex)}
                index={globalIndex}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ButtonGrid;
