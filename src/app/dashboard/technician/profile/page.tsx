'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  Wrench,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Layers,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { clientRequest } from '@/lib/api/client';
import { SafeUser } from '@/types/auth';
import { Category, TechnicianProfile } from '@/types/domain';

interface AuthMeResponse extends SafeUser {
  technicianProfile?: TechnicianProfile;
}

export default function TechnicianProfileAndServicesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>('profile');

  // Profile form state
  const [bio, setBio] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState('');
  const [experienceYears, setExperienceYears] = React.useState<number>(0);
  const [location, setLocation] = React.useState('');
  const [hourlyRate, setHourlyRate] = React.useState<number>(0);
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [profileInitialized, setProfileInitialized] = React.useState(false);

  // New service form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategoryId, setNewCategoryId] = React.useState('');
  const [newPrice, setNewPrice] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [isAddingService, setIsAddingService] = React.useState(false);

  // Fetch current user & technician profile
  const { data: userRes, isLoading: isUserLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => clientRequest<AuthMeResponse>('/auth/me'),
  });

  const user = userRes?.data;
  const profileId = user?.technicianProfile?.id;

  // Fetch complete technician profile including services
  const { data: techRes, isLoading: isTechLoading } = useQuery({
    queryKey: ['technician-details', profileId],
    queryFn: () =>
      clientRequest<TechnicianProfile>(`/technicians/${profileId}`),
    enabled: Boolean(profileId),
  });

  // Fetch categories for service creation
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => clientRequest<Category[]>('/categories'),
  });

  const categories = categoriesRes?.data || [];
  const technician = techRes?.data || user?.technicianProfile;
  const services = techRes?.data?.services || [];

  // Populate form state once fetched (without cascading setState in effect)
  if (technician && !profileInitialized) {
    setBio(technician.bio || '');
    setSkills(technician.skills || []);
    setExperienceYears(technician.experienceYears || 0);
    setLocation(technician.location || '');
    setHourlyRate(Number(technician.hourlyRate || 0));
    setAvatarUrl(technician.avatarUrl || '');
    setProfileInitialized(true);
  }

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async () => {
      return clientRequest('/technician/profile', {
        method: 'PUT',
        body: JSON.stringify({
          bio: bio.trim() || undefined,
          skills,
          experienceYears: Number(experienceYears),
          location: location.trim(),
          hourlyRate: Number(hourlyRate),
        }),
      });
    },
    onSuccess: () => {
      toast.success('Technician profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['technician-details'] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Could not update profile.';
      toast.error(msg);
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async () => {
      return clientRequest('/technician/services', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          categoryId: newCategoryId,
          price: Number(newPrice),
          description: newDescription.trim() || undefined,
        }),
      });
    },
    onSuccess: () => {
      toast.success('Service created and listed on marketplace.');
      setNewTitle('');
      setNewCategoryId('');
      setNewPrice('');
      setNewDescription('');
      setIsAddingService(false);
      queryClient.invalidateQueries({ queryKey: ['technician-details'] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Could not create service.';
      toast.error(msg);
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      return clientRequest(`/technician/services/${serviceId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Service removed.');
      queryClient.invalidateQueries({ queryKey: ['technician-details'] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Could not delete service.';
      toast.error(msg);
    },
  });

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a service title.');
      return;
    }
    if (!newCategoryId) {
      toast.error('Please select a category for this service.');
      return;
    }
    if (!newPrice || Number(newPrice) < 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    createServiceMutation.mutate();
  };

  const isLoading = isUserLoading || isTechLoading;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back button and page title */}
      <div>
        <Link
          href="/dashboard/technician"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Technician Overview
        </Link>
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          Profile & Service Offerings
        </h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Keep your professional bio, skills, hourly rate, and service catalog
          updated so customers can discover and book you.
        </p>
      </div>

      {/* Tabs: Profile vs Services */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="profile" className="gap-2 px-4 text-xs">
            <User className="h-3.5 w-3.5" />
            Professional Profile
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2 px-4 text-xs">
            <Wrench className="h-3.5 w-3.5" />
            Offered Services ({services.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Technician Information
              </CardTitle>
              <CardDescription className="text-xs">
                This information appears on your public profile and search
                results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground animate-pulse p-8 text-center text-xs">
                  Loading profile...
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    profileMutation.mutate();
                  }}
                  className="space-y-6"
                >
                  {/* Avatar section */}
                  <div className="border-border/60 bg-muted/20 flex flex-col items-center gap-5 rounded-xl border p-4 sm:flex-row">
                    <div className="border-primary/20 bg-muted relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={user?.name || 'Technician avatar'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="text-muted-foreground/50 h-10 w-10" />
                      )}
                    </div>
                    <div className="w-full flex-1 space-y-1.5 text-center sm:text-left">
                      <Label
                        htmlFor="avatar-url"
                        className="text-xs font-semibold"
                      >
                        Avatar Image URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="avatar-url"
                          type="url"
                          placeholder="https://images.unsplash.com/... or avatar link"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAvatarUrl(
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Tech'}`
                            );
                            toast.info('Generated avatar preview.');
                          }}
                          className="shrink-0 text-xs"
                        >
                          <UploadCloud className="mr-1 h-3.5 w-3.5" />
                          Generate
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Provide a photo URL or click generate for a personalized
                        illustration.
                      </p>
                    </div>
                  </div>

                  {/* Location & Experience & Hourly Rate */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="location"
                        className="flex items-center gap-1 text-xs font-semibold"
                      >
                        <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                        Service Location / City
                      </Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Dhaka, Gulshan"
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="experience"
                        className="flex items-center gap-1 text-xs font-semibold"
                      >
                        <Briefcase className="text-muted-foreground h-3.5 w-3.5" />
                        Experience (Years)
                      </Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={experienceYears}
                        onChange={(e) =>
                          setExperienceYears(
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="hourly-rate"
                        className="flex items-center gap-1 text-xs font-semibold"
                      >
                        <DollarSign className="text-muted-foreground h-3.5 w-3.5" />
                        Hourly Rate ($)
                      </Label>
                      <Input
                        id="hourly-rate"
                        type="number"
                        min="0"
                        step="0.5"
                        value={hourlyRate}
                        onChange={(e) =>
                          setHourlyRate(
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Skills Tag Input */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs font-semibold">
                      <Layers className="text-muted-foreground h-3.5 w-3.5" />
                      Skills & Specializations
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. AC Repair, Plumbing, Wiring (press Enter or Add)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSkill()}
                        className="shrink-0 text-xs"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Skill
                      </Button>
                    </div>

                    {/* Skill Tags Cloud */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {skills.length === 0 ? (
                        <span className="text-muted-foreground text-xs italic">
                          No skills added yet. Add tags so clients know your
                          expertise.
                        </span>
                      ) : (
                        skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="gap-1.5 px-2.5 py-1 text-xs font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-muted-foreground hover:text-foreground focus:outline-none"
                              aria-label={`Remove skill ${skill}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bio Textarea */}
                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs font-semibold">
                      Professional Bio & Summary
                    </Label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe your certifications, background, tools, and the kind of work you excel at..."
                      className="border-input placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-lg border bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={profileMutation.isPending}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      {profileMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Services Management */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-base font-bold">
                Service Catalog
              </h2>
              <p className="text-muted-foreground text-xs">
                Manage individual services that customers can book directly from
                your profile.
              </p>
            </div>
            {!isAddingService && (
              <Button
                size="sm"
                onClick={() => setIsAddingService(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Service
              </Button>
            )}
          </div>

          {/* Add New Service Card */}
          {isAddingService && (
            <Card className="border-primary/40 bg-card/60 animate-in fade-in-50 border shadow-md duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Plus className="text-primary h-4 w-4" />
                    New Service Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAddingService(false)}
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateService} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label
                        htmlFor="service-title"
                        className="text-xs font-semibold"
                      >
                        Service Title *
                      </Label>
                      <Input
                        id="service-title"
                        placeholder="e.g. Master AC Deep Cleaning & Gas Refill"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="service-price"
                        className="text-xs font-semibold"
                      >
                        Price ($) *
                      </Label>
                      <Input
                        id="service-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="45.00"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="service-category"
                      className="text-xs font-semibold"
                    >
                      Category *
                    </Label>
                    <select
                      id="service-category"
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      required
                      className="border-input bg-card focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="service-desc"
                      className="text-xs font-semibold"
                    >
                      Description (optional)
                    </Label>
                    <textarea
                      id="service-desc"
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Explain what is included in this service..."
                      className="border-input placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-lg border bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingService(false)}
                      disabled={createServiceMutation.isPending}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createServiceMutation.isPending}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      {createServiceMutation.isPending && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      Create Service
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* List of Current Services */}
          {services.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed p-8 text-center">
              <Wrench className="text-muted-foreground/40 mx-auto h-8 w-8" />
              <h3 className="text-foreground text-sm font-semibold">
                No services added yet
              </h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs">
                Add at least one service with category and pricing so clients
                can book appointments with you.
              </p>
              {!isAddingService && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingService(true)}
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add First Service
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((svc) => (
                <Card
                  key={svc.id}
                  className="flex flex-col justify-between border"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-foreground text-sm font-bold">
                          {svc.title}
                        </CardTitle>
                        {svc.category?.name && (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {svc.category.name}
                          </Badge>
                        )}
                      </div>
                      <span className="text-foreground text-base font-extrabold">
                        ${Number(svc.price).toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground pb-3 text-xs">
                    <p className="line-clamp-2">
                      {svc.description || 'Standard service offering.'}
                    </p>
                  </CardContent>
                  <CardFooter className="border-border/40 flex justify-end border-t p-3 pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteServiceMutation.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${svc.title}"?`
                          )
                        ) {
                          deleteServiceMutation.mutate(svc.id);
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10 h-7 gap-1 px-2 text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
