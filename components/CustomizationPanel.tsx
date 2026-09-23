import React from 'react';
import type { AspectRatio, Quality, NumberOfImages } from '../types';

interface CustomizationPanelProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  quality: Quality;
  onQualityChange: (value: Quality) => void;
  numberOfImages: NumberOfImages;
  onNumberOfImagesChange: (value: NumberOfImages) => void;
}

const aspectRatios: { value: AspectRatio, label: string }[] = [
  { value: '1:1', label: '1:1 Vuông' },
  { value: '3:4', label: '3:4 Đứng' },
  { value: '9:16', label: '9:16 Story' },
];

const qualities: { value: Quality, label: string }[] = [
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'high', label: 'Cao' },
  { value: 'very_high', label: 'Rất cao' },
];

const imageCounts: { value: NumberOfImages, label: string }[] = [
    { value: 1, label: '1 ảnh' },
    { value: 2, label: '2 ảnh' },
    { value: 4, label: '4 ảnh' },
];

const SegmentedControl = <T extends string | number,>({ options, selectedValue, onChange, label }: {
    options: { value: T, label: string }[],
    selectedValue: T,
    onChange: (value: T) => void,
    label: string
}) => (
    <div>
        <h3 className="text-md font-semibold text-[#0f1f38] mb-3">{label}</h3>
        <div className="flex w-full bg-slate-100 border border-slate-200 p-1 rounded-xl">
            {options.map((option) => (
                <button
                    key={option.value.toString()}
                    onClick={() => onChange(option.value)}
                    className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-amber-400
                        ${selectedValue === option.value
                            ? 'bg-[#0f1f38] text-amber-300 shadow-sm border border-amber-400/40'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);


const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  aspectRatio, onAspectRatioChange, quality, onQualityChange, numberOfImages, onNumberOfImagesChange
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-md border border-amber-200/60">
      <h2 className="text-lg font-bold text-[#0f1f38] mb-4">4. Tuỳ chỉnh</h2>
      <div className="space-y-6">
        <SegmentedControl
            label="Số lượng ảnh"
            options={imageCounts}
            selectedValue={numberOfImages}
            onChange={onNumberOfImagesChange}
        />
        <SegmentedControl
            label="Tỷ lệ khung hình"
            options={aspectRatios}
            selectedValue={aspectRatio}
            onChange={onAspectRatioChange}
        />
        <SegmentedControl
            label="Chất lượng ảnh"
            options={qualities}
            selectedValue={quality}
            onChange={onQualityChange}
        />
      </div>
    </div>
  );
};

export default CustomizationPanel;