import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/api/users.api";
import { profilesApi } from "@/api/profiles.api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2, Save, Calendar, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ParticipantProfile = () => {
  const navigate = useNavigate();
  const { authData, updateAuthData } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  // Fetch participant profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('[ParticipantProfile] Fetching profile...');
      try {
        const data = await usersApi.getParticipantProfile();
        console.log('[ParticipantProfile] Profile fetched successfully:', data);
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth || "",
        });
        // If profile is empty, enable edit mode by default
        if (!data.fullName) {
          console.log('[ParticipantProfile] Profile empty, enabling edit mode');
          setIsEditing(true);
        } else {
          console.log('[ParticipantProfile] Profile has data, showing view mode');
        }
      } catch (err: any) {
        console.error('[ParticipantProfile] Error fetching profile:', err);
        console.error('[ParticipantProfile] Error response:', err.response);
        // Profile needs completion - enable edit mode
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to profile data
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        dateOfBirth: profile.dateOfBirth || "",
      });
    }
    setIsEditing(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    console.log('[ParticipantProfile] Submitting form...');
    console.log('[ParticipantProfile] Form data:', formData);
    console.log('[ParticipantProfile] Is new profile:', !profile || !profile.fullName);

    try {
      // Check if this is first time completing profile or updating
      if (!profile || !profile.fullName) {
        // Complete profile (first time)
        console.log('[ParticipantProfile] Completing profile for first time...');
        const response = await profilesApi.completeParticipantProfile({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          dateOfBirth: formData.dateOfBirth,
        });
        console.log('[ParticipantProfile] Profile completed, response:', response);

        // Update auth context with new token
        updateAuthData(response);

        toast({
          title: "Profile Completed!",
          description: "Your participant profile has been set up successfully.",
        });
      } else {
        // Update existing profile
        console.log('[ParticipantProfile] Updating existing profile...');
        const updateResponse = await profilesApi.updateParticipantProfile({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          dateOfBirth: formData.dateOfBirth,
        });
        console.log('[ParticipantProfile] Update response:', updateResponse);

        toast({
          title: "Profile Updated!",
          description: "Your changes have been saved successfully.",
        });
      }

      // Refresh profile data
      console.log('[ParticipantProfile] Fetching updated profile...');
      const updatedProfile = await usersApi.getParticipantProfile();
      console.log('[ParticipantProfile] Updated profile fetched:', updatedProfile);

      setProfile(updatedProfile);

      // Update form data to match the refreshed profile
      const newFormData = {
        fullName: updatedProfile.fullName || "",
        phoneNumber: updatedProfile.phoneNumber || "",
        dateOfBirth: updatedProfile.dateOfBirth || "",
      };
      console.log('[ParticipantProfile] Setting new form data:', newFormData);
      setFormData(newFormData);

      console.log('[ParticipantProfile] Switching to view mode...');
      setIsEditing(false);

      console.log('[ParticipantProfile] Profile state updated successfully!');

    } catch (err: any) {
      console.error('[ParticipantProfile] Error saving profile:', err);
      console.error('[ParticipantProfile] Error response:', err.response);
      setError(err.response?.data?.message || "Failed to save profile");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const isNewProfile = !profile || !profile.fullName;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/my-tickets")}
              className="mb-4"
            >
              ← Back to My Tickets
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {isNewProfile ? "Complete Your Profile" : "Participant Profile"}
                </h1>
                <p className="text-muted-foreground">
                  {isNewProfile
                    ? "Help us personalize your event experience"
                    : "Manage your personal information"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form/View */}
          <Card className="glass glass-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Update your personal information"
                      : "Your participant profile details"}
                  </CardDescription>
                </div>
                {!isEditing && profile && profile.fullName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing && profile && profile.fullName ? (
                // View Mode - Display current data
                <div className="space-y-6">
                  {/* Account Status */}
                  {profile.userStatus && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Account Status</Label>
                      <StatusBadge status={profile.userStatus} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="text-lg font-medium">{profile.fullName}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone Number</Label>
                    <p className="text-lg font-medium">
                      {profile.phoneNumber || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <p className="text-lg font-medium">
                      {profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "Not provided"}
                    </p>
                  </div>

                  {profile.age && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">Age: {profile.age} years old</p>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode - Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={isSaving}
                      className="h-11"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      For event updates and ticket notifications
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      Date of Birth <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        disabled={isSaving}
                        className="h-11"
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Required for age-restricted events
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="cta"
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isNewProfile ? "Complete Profile" : "Save Changes"}
                        </>
                      )}
                    </Button>
                    {!isNewProfile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Your information is secure and will only be used for event-related purposes.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ParticipantProfile;

