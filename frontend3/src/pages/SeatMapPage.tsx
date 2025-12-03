import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { mockEvents } from '@/data/mockEvents';

export default function SeatMapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl mb-4">Event not found</h2>
          <Button onClick={() => navigate('/organize')}>
            Back to Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const handleSave = () => {
    // Mock save
    alert('Seat map saved successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <OrganizerPanel />

        <div className="flex-1 py-8 px-8">
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/organize')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Seat Map</h1>
            <p className="text-muted-foreground">Upload seat map image for {event.title}</p>
          </div>

          <div>
            {/* Upload Section */}
            <div className="glass glass-border rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Upload Seat Map</h2>
              
              {!uploadedImage ? (
                <label className="block border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Click to upload seat map image</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, or PDF up to 10MB</p>
                </label>
              ) : (
                <div className="relative">
                  <Button
                    onClick={removeImage}
                    size="icon"
                    variant="destructive"
                    className="absolute top-4 right-4 z-10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <img
                    src={uploadedImage}
                    alt="Seat map"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="glass glass-border rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Guidelines</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Upload a clear, high-resolution image of your venue's seat map</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Make sure seat sections and rows are clearly labeled</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Include emergency exits and facilities for attendee reference</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Recommended formats: PNG or JPG with minimum 1920x1080 resolution</span>
                </li>
              </ul>
            </div>

            {/* Current Seat Map (if exists) */}
            {!uploadedImage && (
              <div className="glass glass-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Current Seat Map</h2>
                <div className="flex items-center justify-center h-64 bg-accent rounded-lg border border-border">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>No seat map uploaded yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {uploadedImage && (
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  onClick={removeImage}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="cta"
                >
                  Save Seat Map
                </Button>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
