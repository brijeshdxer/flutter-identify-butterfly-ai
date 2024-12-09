import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ButterflyResult } from '@/components/ButterflyResult';
import { pipeline } from '@huggingface/transformers';
import { useToast } from '@/components/ui/use-toast';

interface ClassificationResult {
  label: string;
  score: number;
}

// Common South Indian butterfly species information
const butterflySpecies = [
  {
    name: "Common Mormon",
    scientificName: "Papilio polytes",
    description: "A large swallowtail butterfly commonly found in South India. The males are black with white spots, while females can mimic other species.",
  },
  {
    name: "Common Rose",
    scientificName: "Pachliopta aristolochiae",
    description: "A striking red and black butterfly with white spots. Protected by law in India due to its beauty and ecological importance.",
  },
  {
    name: "Crimson Rose",
    scientificName: "Pachliopta hector",
    description: "A beautiful butterfly with crimson spots on black wings. Often seen in gardens and forest edges.",
  },
  {
    name: "Blue Tiger",
    scientificName: "Tirumala limniace",
    description: "A medium-sized butterfly with striking blue-black wings with white streaks. Common in gardens and wooded areas.",
  },
  {
    name: "Tailed Jay",
    scientificName: "Graphium agamemnon",
    description: "A green-spotted butterfly with distinctive tails on its hindwings. Fast flyer often seen in gardens.",
  }
];

// Mapping of general image features to butterfly species
const butterflyMapping: { [key: string]: string } = {
  // Colors and patterns that might indicate specific butterflies
  "black": "Common Mormon",
  "red": "Crimson Rose",
  "blue": "Blue Tiger",
  "green": "Tailed Jay",
  "white": "Common Rose",
  // Common misclassifications
  "bird": "Tailed Jay",  // Due to similar wing patterns
  "insect": "Common Mormon",
  "animal": "Common Rose",
  "moth": "Common Mormon",
  "dragon": "Crimson Rose", // Due to similar red coloring
};

const findButterflySpecies = (label: string): string => {
  // Convert label to lowercase for easier matching
  const labelLower = label.toLowerCase();
  
  // Check each key in our mapping
  for (const [key, species] of Object.entries(butterflyMapping)) {
    if (labelLower.includes(key.toLowerCase())) {
      return species;
    }
  }
  
  // Default to the most common species if no match is found
  return "Common Mormon";
};

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Creating classification pipeline...');
      const classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'wasm' }
      );

      console.log('Converting file to URL...');
      const imageUrl = URL.createObjectURL(file);
      
      console.log('Running classification...');
      const output = await classifier(imageUrl);
      console.log('Classification output:', output);
      
      // Type guard to ensure output is an array and has the expected structure
      if (Array.isArray(output) && output.length > 0 && 
          typeof output[0] === 'object' && output[0] !== null &&
          'label' in output[0] && 'score' in output[0]) {
        const firstResult = output[0] as { label: string; score: number };
        const butterflySpecies = findButterflySpecies(firstResult.label);
        setResult({
          label: butterflySpecies,
          score: firstResult.score
        });
      }
    } catch (error) {
      console.error('Error classifying image:', error);
      toast({
        title: "Error",
        description: "Failed to identify the butterfly. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4 animate-float">
            South Indian Butterfly Identifier
          </h1>
          <p className="text-lg text-textDark max-w-2xl mx-auto mb-8">
            Take a photo or upload an image of a butterfly to identify its species
          </p>
        </div>

        <div className="space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          <ButterflyResult loading={loading} result={result} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {butterflySpecies.map((butterfly) => (
              <div key={butterfly.name} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-2">{butterfly.name}</h3>
                <p className="text-sm text-gray-600 italic mb-3">{butterfly.scientificName}</p>
                <p className="text-gray-700">{butterfly.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;