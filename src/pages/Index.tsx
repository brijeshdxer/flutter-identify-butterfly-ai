import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ButterflyResult } from '@/components/ButterflyResult';
import { pipeline } from '@huggingface/transformers';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ label: string; score: number } | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setLoading(true);
    setResult(null);
    
    try {
      const classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'cpu' }
      );

      const imageUrl = URL.createObjectURL(file);
      const output = await classifier(imageUrl);
      
      if (output && output.length > 0) {
        setResult(output[0]);
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
          <p className="text-lg text-textDark max-w-2xl mx-auto">
            Take a photo or upload an image of a butterfly to identify its species
          </p>
        </div>

        <div className="space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          <ButterflyResult loading={loading} result={result} />
        </div>
      </div>
    </div>
  );
};

export default Index;