import React, { useCallback } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
    }
  }, [onImageSelect, toast]);

  const openCamera = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={openCamera}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          <Camera className="w-8 h-8 mb-2 text-primary" />
          <span className="text-sm font-medium text-textDark">Take Photo</span>
        </button>
        
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 mb-2 text-primary" />
          <span className="text-sm font-medium text-textDark">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};