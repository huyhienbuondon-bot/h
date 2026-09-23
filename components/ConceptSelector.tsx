
import React from 'react';
import { CONCEPTS } from '../constants';

interface ConceptSelectorProps {
  selectedConcept: string | null;
  onSelectConcept: (conceptKey: string) => void;
}

const ConceptSelector: React.FC<ConceptSelectorProps> = ({ selectedConcept, onSelectConcept }) => {
  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl border-amber-200/60">
      <h2 className="text-xl font-playfair font-bold text-[#0f1f38] mb-4">2. Concept nàng muốn nhập vai</h2>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {CONCEPTS.map((concept) => (
          <button
            key={concept.key}
            onClick={() => onSelectConcept(concept.key)}
            className={`px-4 py-2 text-xs font-bold rounded-full border-2 transition-all duration-300
              ${selectedConcept === concept.key 
                ? 'bg-[#0f1f38] border-amber-400 text-amber-300 shadow-amber-900/10 shadow-lg scale-105' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-800'
              }`}
          >
            {concept.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConceptSelector;
