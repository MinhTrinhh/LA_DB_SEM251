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
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, Save, Upload, ShieldCheck, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrganizerProfile = () => {
  const navigate = useNavigate();
  const { authData, updateAuthData } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [hasOrganizerRole, setHasOrganizerRole] = useState(false);

  const [formData, setFormData] = useState({
    officialName: "",
    taxId: "",
    logoUrl: "",
  });

  // Check if user has organizer role
  useEffect(() => {
    if (authData?.roles) {
      const isOrganizer = authData.roles.includes('ROLE_ORGANIZER' as any);
      setHasOrganizerRole(isOrganizer);
    }
  }, [authData]);

  // Fetch organizer profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!hasOrganizerRole && authData) {
        // User is not an organizer yet - show registration form
        setIsEditing(true);
        setIsLoading(false);
        return;
      }

      try {
        const data = await usersApi.getOrganizerProfile();
        setProfile(data);
        setFormData({
          officialName: data.officialName || "",
          taxId: data.taxId || "",
          logoUrl: data.logoUrl || "",
        });
        // If profile is complete, show view mode; otherwise show edit mode
        if (!data.officialName) {
          setIsEditing(true);
        } else {
          setIsEditing(false); // ✅ Explicitly set to false when profile exists
        }
      } catch (err: any) {
        console.log("Organizer profile not found");
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authData) {
      fetchProfile();
    }
  }, [hasOrganizerRole, authData]);

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
        officialName: profile.officialName || "",
        taxId: profile.taxId || "",
        logoUrl: profile.logoUrl || "",
      });
    }
    setIsEditing(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    console.log('[OrganizerProfile] Submitting form...');
    console.log('[OrganizerProfile] Form data:', formData);
    console.log('[OrganizerProfile] Is new organizer:', !hasOrganizerRole);

    try {
      if (!hasOrganizerRole) {
        // Become an organizer (first time)
        console.log('[OrganizerProfile] Creating new organizer profile...');
        const response = await profilesApi.completeOrganizerProfile({
          officialName: formData.officialName,
          taxId: formData.taxId,
          logoUrl: formData.logoUrl || undefined,
        });
        console.log('[OrganizerProfile] Profile created, response:', response);

        // Update auth context with new token (now has ROLE_ORGANIZER)
        updateAuthData(response);

        toast({
          title: "Welcome, Organizer!",
          description: "Your organizer profile has been created successfully.",
        });

        // Redirect to organizer dashboard
        navigate("/organizer");
      } else {
        // Update existing organizer profile
        console.log('[OrganizerProfile] Updating existing profile...');
        const updateResponse = await profilesApi.updateOrganizerProfile({
          officialName: formData.officialName,
          taxId: formData.taxId,
          logoUrl: formData.logoUrl || undefined,
        });
        console.log('[OrganizerProfile] Update response:', updateResponse);

        toast({
          title: "Profile Updated!",
          description: "Your organizer profile has been updated successfully.",
        });

        // Refresh profile data
        console.log('[OrganizerProfile] Fetching updated profile...');
        const updatedProfile = await usersApi.getOrganizerProfile();
        console.log('[OrganizerProfile] Updated profile fetched:', updatedProfile);

        setProfile(updatedProfile);

        // Update form data to match the refreshed profile
        const newFormData = {
          officialName: updatedProfile.officialName || "",
          taxId: updatedProfile.taxId || "",
          logoUrl: updatedProfile.logoUrl || "",
        };
        console.log('[OrganizerProfile] Setting new form data:', newFormData);
        setFormData(newFormData);

        console.log('[OrganizerProfile] Switching to view mode...');
        setIsEditing(false);

        console.log('[OrganizerProfile] Profile state updated successfully!');
      }
    } catch (err: any) {
      console.error('[OrganizerProfile] Error saving profile:', err);
      console.error('[OrganizerProfile] Error response:', err.response);
      setError(err.response?.data?.message || "Failed to save organizer profile");
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

  const isNewOrganizer = !hasOrganizerRole;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {hasOrganizerRole && (
              <Button
                variant="ghost"
                onClick={() => navigate("/organizer")}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cta to-cta/60 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {isNewOrganizer ? "Become an Organizer" : "Organizer Profile"}
                </h1>
                <p className="text-muted-foreground">
                  {isNewOrganizer
                    ? "Create events and manage ticket sales"
                    : "Manage your organization information"}
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner for New Organizers */}
          {isNewOrganizer && (
            <Card className="mb-6 border-cta/20 bg-cta/5">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-cta flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Why become an organizer?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Create and manage unlimited events</li>
                      <li>• Sell tickets and track sales in real-time</li>
                      <li>• Access detailed analytics and reports</li>
                      <li>• Manage attendees and check-ins</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Form/View */}
          <Card className="glass glass-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? (isNewOrganizer
                          ? "Provide your organization information to start creating events"
                          : "Update your organization information")
                      : "Your organization profile details"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {profile && (
                    <Badge
                      variant={profile.status === 'VERIFIED' ? 'default' : 'secondary'}
                    >
                      {profile.status === 'VERIFIED' ? '✓ Verified' : 'Pending Review'}
                    </Badge>
                  )}
                  {!isEditing && profile && profile.officialName && (
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
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing && profile && profile.officialName ? (
                // View Mode - Display current data
                <div className="space-y-6">
                  {/* Verification Status */}
                  {profile.status && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Verification Status</Label>
                      <StatusBadge
                        status={profile.status}
                        label={profile.status === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Organization Name</Label>
                    <p className="text-lg font-medium">{profile.officialName}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Tax ID</Label>
                    <p className="text-lg font-medium">{profile.taxId}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Logo URL</Label>
                    <p className="text-lg font-medium break-all">
                      {profile.logoUrl || "No logo uploaded"}
                    </p>
                  </div>

                  {profile.logoUrl && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Logo Preview</Label>
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <img
                          src={profile.logoUrl}
                          alt="Organization Logo"
                          className="max-h-32 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode - Form
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Official Name */}
                <div className="space-y-2">
                  <Label htmlFor="officialName">
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="officialName"
                    name="officialName"
                    type="text"
                    placeholder="Your Company Name LLC"
                    value={formData.officialName}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Official registered business name
                  </p>
                </div>

                {/* Tax ID */}
                <div className="space-y-2">
                  <Label htmlFor="taxId">
                    Tax ID / Business Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    type="text"
                    placeholder="123456789"
                    value={formData.taxId}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                    className="h-11"
                    pattern="[0-9]{9,15}"
                    title="Tax ID must be 9-15 digits"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for verification and tax purposes
                  </p>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Organization Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="h-11"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      disabled={isSaving}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Will be displayed on your event pages
                  </p>
                </div>

                {/* Preview Logo */}
                {formData.logoUrl && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Logo Preview:</p>
                    <img
                      src={formData.logoUrl}
                      alt="Organization Logo"
                      className="w-24 h-24 object-contain rounded-lg bg-background"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
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
                        {isNewOrganizer ? "Become an Organizer" : "Save Changes"}
                      </>
                    )}
                  </Button>
                  {!isNewOrganizer && (
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
            {isNewOrganizer
              ? "Your profile will be reviewed by our team. You'll be notified once verified."
              : "Contact support if you need to update verified information."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrganizerProfile;

