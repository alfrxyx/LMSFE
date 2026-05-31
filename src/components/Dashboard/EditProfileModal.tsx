import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Camera,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar || null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("email", formData.email);
      data.append("phone", formData.phone);

      if (formData.password) {
        data.append("current_password", formData.current_password);
        data.append("password", formData.password);
        data.append("password_confirmation", formData.password_confirmation);
      }

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      data.append("bio", formData.bio);

      const response = await api.post("/user/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        updateUser(response.data.data);
        toast.success("Profil berhasil diperbarui!");
        onClose();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Gagal memperbarui profil";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-500 font-medium">
              Update your account information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shadow-inner">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all border-2 border-white"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
              <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-wider">
                Formal Photo (Max 2MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Short Bio / Slogan"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    maxLength={150}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="University Email"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder="WhatsApp Number"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Change Password (Optional)
                </p>

                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                  value={formData.current_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_password: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder="Confirm"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
