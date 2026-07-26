"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Banknote,
  Camera,
  CheckCircle2,
  ImageIcon,
  KeyRound,
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SingleImageUpload } from "@/components/common/single-image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials } from "@/screens/users/types";

type SettingsTab = "profile" | "security" | "exchange" | "banners";

type SettingsUser = {
  id: number;
  slug: string;
  name: string;
  email: string;
  profilePicture: string;
  roleId: number;
  role: string | null;
  roleSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = {
  success: boolean;
  data: SettingsUser;
  message?: string;
};

type BannerItem = {
  id: number;
  slug: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type StoreSettingsResponse = {
  success: boolean;
  data: {
    exchangeRate: number;
    banners: BannerItem[];
  };
  message?: string;
};

type SettingsScreenProps = {
  defaultTab?: SettingsTab;
};

const emptyProfile = {
  name: "",
  email: "",
  profilePicture: "",
};

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const emptyBanner = {
  name: "",
  image: "",
};

export default function SettingsScreen({ defaultTab = "profile" }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [exchangeRate, setExchangeRate] = useState("4000");
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [newBanner, setNewBanner] = useState(emptyBanner);
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingExchange, setSavingExchange] = useState(false);
  const [savingBanner, setSavingBanner] = useState<number | "new" | null>(null);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [exchangeError, setExchangeError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [notice, setNotice] = useState("");

  const displayInitials = useMemo(() => initials(user?.name || profileForm.name || "User"), [
    profileForm.name,
    user?.name,
  ]);
  const profilePreview = profileForm.profilePicture.trim();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setProfileError("");
      const res = await fetch("/api/settings/profile", { cache: "no-store" });
      const json = (await res.json()) as ProfileResponse;
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load profile");

      setUser(json.data);
      setProfileForm({
        name: json.data.name,
        email: json.data.email,
        profilePicture: json.data.profilePicture || "",
      });
    } catch (err) {
      console.error(err);
      setProfileError(err instanceof Error ? err.message : "Failed to load profile settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadStoreSettings = useCallback(async () => {
    try {
      setStoreLoading(true);
      setExchangeError("");
      setBannerError("");
      const res = await fetch("/api/settings/store", { cache: "no-store" });
      const json = (await res.json()) as StoreSettingsResponse;
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load store settings");
      setExchangeRate(String(json.data.exchangeRate || 4000));
      setBanners(json.data.banners || []);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to load store settings.";
      setExchangeError(message);
      setBannerError(message);
    } finally {
      setStoreLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoreSettings();
  }, [loadStoreSettings]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError("");
      setNotice("");
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSlug: user?.slug,
          name: profileForm.name,
          email: profileForm.email,
          profilePicture: profileForm.profilePicture,
        }),
      });
      const json = (await res.json()) as ProfileResponse;
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to update profile");

      setUser(json.data);
      setNotice("Profile updated.");
    } catch (err) {
      console.error(err);
      setProfileError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Current password and new password are required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Confirm password must match the new password.");
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError("");
      setNotice("");
      const res = await fetch("/api/settings/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSlug: user?.slug,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to change password");
      }

      setPasswordForm(emptyPassword);
      setNotice("Password changed.");
    } catch (err) {
      console.error(err);
      setPasswordError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const saveExchangeRate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!Number(exchangeRate) || Number(exchangeRate) <= 0) {
      setExchangeError("Exchange rate must be greater than 0.");
      return;
    }

    try {
      setSavingExchange(true);
      setExchangeError("");
      setNotice("");
      const res = await fetch("/api/settings/exchange-rate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchangeRate: Number(exchangeRate) }),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save exchange rate");
      setNotice("Exchange rate updated.");
    } catch (err) {
      console.error(err);
      setExchangeError(err instanceof Error ? err.message : "Failed to update exchange rate.");
    } finally {
      setSavingExchange(false);
    }
  };

  const updateBannerForm = (id: number, field: "name" | "image", value: string) => {
    setBanners((current) =>
      current.map((banner) => (banner.id === id ? { ...banner, [field]: value } : banner)),
    );
  };

  const saveBanner = async (banner: BannerItem) => {
    if (!banner.name?.trim() || !banner.image?.trim()) {
      setBannerError("Banner name and image are required.");
      return;
    }

    try {
      setSavingBanner(banner.id);
      setBannerError("");
      setNotice("");
      const res = await fetch(`/api/settings/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: banner.name, image: banner.image }),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save banner");
      setNotice("Banner updated.");
      await loadStoreSettings();
    } catch (err) {
      console.error(err);
      setBannerError(err instanceof Error ? err.message : "Failed to update banner.");
    } finally {
      setSavingBanner(null);
    }
  };

  const deleteBanner = async (banner: BannerItem) => {
    if (!window.confirm(`Delete banner "${banner.name}"?`)) return;

    try {
      setSavingBanner(banner.id);
      setBannerError("");
      setNotice("");
      const res = await fetch(`/api/settings/banners/${banner.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to delete banner");
      setNotice("Banner deleted.");
      await loadStoreSettings();
    } catch (err) {
      console.error(err);
      setBannerError(err instanceof Error ? err.message : "Failed to delete banner.");
    } finally {
      setSavingBanner(null);
    }
  };

  const createBanner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newBanner.name.trim() || !newBanner.image.trim()) {
      setBannerError("Banner name and image are required.");
      return;
    }

    try {
      setSavingBanner("new");
      setBannerError("");
      setNotice("");
      const res = await fetch("/api/settings/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to create banner");
      setNewBanner(emptyBanner);
      setNotice("Banner created.");
      await loadStoreSettings();
    } catch (err) {
      console.error(err);
      setBannerError(err instanceof Error ? err.message : "Failed to create banner.");
    } finally {
      setSavingBanner(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage profile, security, exchange rate, and homepage banners.
          </p>
        </div>
        {user?.role ? (
          <Badge variant="outline" className="w-fit px-3 py-1">
            <Shield className="mr-1 h-3.5 w-3.5" />
            {user.role}
          </Badge>
        ) : null}
      </div>

      {notice ? (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
        <TabsList className="grid h-auto w-full grid-cols-2 border bg-white p-1 sm:w-fit sm:grid-cols-4">
          <TabsTrigger value="profile" className="gap-2 px-4">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-4">
            <KeyRound className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="exchange" className="gap-2 px-4">
            <Banknote className="h-4 w-4" />
            Exchange
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2 px-4">
            <ImageIcon className="h-4 w-4" />
            Banners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xl font-semibold text-primary-foreground">
                    {profilePreview ? (
                      <Image
                        src={profilePreview}
                        alt={profileForm.name || "Profile picture"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-primary text-primary-foreground">
                        <Camera className="h-5 w-5" />
                        <span className="text-lg font-semibold">{displayInitials}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                      {profileForm.name || "Admin User"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {profileForm.email || "No email"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add an image URL to preview and use it as your profile picture.
                    </p>
                  </div>
                </div>

                <Separator />

                {profileError ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {profileError}
                  </p>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name">
                    <Input
                      value={profileForm.name}
                      disabled={loading}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Admin name"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={profileForm.email}
                      disabled={loading}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="admin@example.com"
                    />
                  </Field>
                </div>

                <Field label="Profile picture URL">
                  <div>
                    <SingleImageUpload
                      value={profileForm.profilePicture}
                      onChange={(url) =>
                        setProfileForm((current) => ({
                          ...current,
                          profilePicture: url,
                        }))
                      }
                      width={160}
                      height={160}
                      label=""
                    />
                  </div>
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading || savingProfile}>
                    {savingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-6">
                {passwordError ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {passwordError}
                  </p>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Current password">
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          currentPassword: event.target.value,
                        }))
                      }
                      placeholder="Current password"
                    />
                  </Field>
                  <div className="hidden md:block" />
                  <Field label="New password">
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          newPassword: event.target.value,
                        }))
                      }
                      placeholder="New password"
                    />
                  </Field>
                  <Field label="Confirm password">
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Confirm password"
                    />
                  </Field>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingPassword || loading}>
                    {savingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Exchange Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveExchangeRate} className="space-y-6">
                {exchangeError ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {exchangeError}
                  </p>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={`Exchange rate 1 USD = ${exchangeRate || "0"} KHR`}>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={exchangeRate}
                      disabled={storeLoading}
                      onChange={(event) => setExchangeRate(event.target.value)}
                      placeholder="4000"
                    />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={storeLoading || savingExchange}>
                    {savingExchange ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Exchange Rate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="mt-4 space-y-4">
          {bannerError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {bannerError}
            </p>
          ) : null}

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Create Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createBanner} className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto] lg:items-end">
                <Field label="Name">
                  <Input
                    value={newBanner.name}
                    onChange={(event) => setNewBanner((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Homepage banner"
                  />
                </Field>
                <Field label="Image URL">
                  <Input
                    value={newBanner.image}
                    onChange={(event) => setNewBanner((current) => ({ ...current, image: event.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                  />
                </Field>
                <Button type="submit" disabled={savingBanner === "new"}>
                  {savingBanner === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Banner
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {storeLoading ? (
              <Card className="p-6 text-center text-muted-foreground">Loading banners...</Card>
            ) : banners.length ? (
              banners.map((banner) => (
                <Card key={banner.id} className="rounded-lg">
                  <CardContent className="grid gap-4 pt-6 lg:grid-cols-[260px_1fr_auto] lg:items-end">
                    <div
                      className="aspect-[16/7] rounded-md border bg-muted bg-cover bg-center"
                      style={{ backgroundImage: banner.image ? `url(${banner.image})` : undefined }}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name">
                        <Input
                          value={banner.name || ""}
                          onChange={(event) => updateBannerForm(banner.id, "name", event.target.value)}
                        />
                      </Field>
                      <Field label="Image URL">
                        <Input
                          value={banner.image || ""}
                          onChange={(event) => updateBannerForm(banner.id, "image", event.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveBanner(banner)} disabled={savingBanner === banner.id}>
                        {savingBanner === banner.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteBanner(banner)}
                        disabled={savingBanner === banner.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-muted-foreground">No banners found.</Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
