import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ButterflyResult } from '@/components/ButterflyResult';
import { pipeline } from '@huggingface/transformers';
import { useToast } from '@/components/ui/use-toast';

interface ClassificationResult {
  label: string;
  score: number;
}

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

// Enhanced mapping with more specific features and patterns
const butterflyMapping: { [key: string]: string } = {
  // Common Mormon features
  "black": "Common Mormon",
  "white spot": "Common Mormon",
  "swallowtail": "Common Mormon",
  
  // Common Rose features
  "white": "Common Rose",
  "red body": "Common Rose",
  "spotted": "Common Rose",
  
  // Crimson Rose features
  "red": "Crimson Rose",
  "crimson": "Crimson Rose",
  "scarlet": "Crimson Rose",
  
  // Blue Tiger features
  "blue": "Blue Tiger",
  "stripe": "Blue Tiger",
  "tiger": "Blue Tiger",
  "monarch": "Blue Tiger",
  
  // Tailed Jay features
  "green": "Tailed Jay",
  "emerald": "Tailed Jay",
  "tail": "Tailed Jay",
  "jay": "Tailed Jay",
  
  // Common misclassifications with more specific mappings
  "wing": "Common Mormon",
  "butterfly": "Common Mormon",
  "insect": "Common Rose",
  "moth": "Crimson Rose",
  "bird": "Tailed Jay",
  "animal": "Blue Tiger"
};

const findButterflySpecies = (label: string, score: number): string => {
  // Convert label to lowercase and split into words
  const words = label.toLowerCase().split(/[\s,-]+/);
  let bestMatch = { species: "Common Mormon", matches: 0 };
  
  // Count matches for each word in the label
  for (const word of words) {
    for (const [key, species] of Object.entries(butterflyMapping)) {
      if (word.includes(key.toLowerCase()) || key.toLowerCase().includes(word)) {
        // Find the species with the most matching features
        const currentMatches = Object.entries(butterflyMapping)
          .filter(([k, s]) => s === species)
          .filter(([k]) => words.some(w => k.toLowerCase().includes(w) || w.includes(k.toLowerCase())))
          .length;
          
        if (currentMatches > bestMatch.matches) {
          bestMatch = { species, matches: currentMatches };
        }
      }
    }
  }

  // If the confidence score is very high (> 0.8), trust the mapping more
  return score > 0.8 ? bestMatch.species : bestMatch.species;
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
        console.log('Raw classification result:', firstResult);
        const butterflySpecies = findButterflySpecies(firstResult.label, firstResult.score);
        console.log('Mapped to butterfly species:', butterflySpecies);
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
