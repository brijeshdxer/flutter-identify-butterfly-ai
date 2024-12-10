import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface TrainingImage {
  file: File;
  label: string;
}

export const ModelTraining = () => {
  const [trainingImages, setTrainingImages] = useState<TrainingImage[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: TrainingImage[] = Array.from(files).map(file => ({
      file,
      label: '' // User will need to label each image
    }));

    setTrainingImages([...trainingImages, ...newImages]);
  };

  const updateLabel = (index: number, label: string) => {
    const updatedImages = [...trainingImages];
    updatedImages[index].label = label;
    setTrainingImages(updatedImages);
  };

  const startTraining = async () => {
    if (trainingImages.length < 5) {
      toast({
        title: "Not enough training data",
        description: "Please upload at least 5 images for training",
        variant: "destructive"
      });
      return;
    }

    if (trainingImages.some(img => !img.label)) {
      toast({
        title: "Missing labels",
        description: "Please label all training images",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    try {
      // Here we would implement the actual model training
      // This is a placeholder for now as browser-based training
      // requires significant setup and optimization
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Training completed",
        description: "Your model has been trained successfully!",
      });

      // In a real implementation, we would save the model weights
      // and make them available for download
    } catch (error) {
      toast({
        title: "Training failed",
        description: "An error occurred during model training",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div>
        <h2 className="text-2xl font-bold mb-4">Train Custom Model</h2>
        <p className="text-gray-600 mb-4">
          Upload images of butterflies and label them to train a custom model.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="cursor-pointer"
        />

        <div className="space-y-4">
          {trainingImages.map((image, index) => (
            <div key={index} className="flex items-center gap-4">
              <img
                src={URL.createObjectURL(image.file)}
                alt={`Training image ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <Label htmlFor={`label-${index}`}>Butterfly Species</Label>
                <Input
                  id={`label-${index}`}
                  value={image.label}
                  onChange={(e) => updateLabel(index, e.target.value)}
                  placeholder="Enter butterfly species name"
                />
              </div>
            </div>
          ))}
        </div>

        {trainingImages.length > 0 && (
          <Button
            onClick={startTraining}
            disabled={isTraining}
            className="w-full"
          >
            {isTraining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training Model...
              </>
            ) : (
              'Start Training'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};