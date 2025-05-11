import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Lock, Eye, EyeOff, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [prevFullName, setPrevFullName] = useState("");
  const [prevEmail, setPrevEmail] = useState("");
  const [saveLock, setSaveLock] = useState(false);

  useEffect(() => {
    if (authUser && initialLoad) {
      setFullName(authUser.fullName || "");
      setEmail(authUser.email || "");
      setPrevFullName(authUser.fullName || "");
      setPrevEmail(authUser.email || "");
      setSelectedImg(authUser.profilePic || null);
      setInitialLoad(false);
    }
  }, [authUser, initialLoad]);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) return false;
    
    if (/[^\w.%+-@]/.test(email)) return false;
    
    if (email.startsWith('.') || email.endsWith('.') || email.includes('..')) {
      return false;
    }
    
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return false;
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    if (localPart.length > 64) return false;
    
    if (domain.length > 253) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length > 63)) return false;
    
    return true;
  };

  const handleImageUpload = async (e) => {
    if (isUpdatingProfile) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated", { id: "avatar-success" });
      } catch (err) {
        toast.error(err.message || "Failed to update profile picture");
        setSelectedImg(authUser?.profilePic || null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (isUpdatingProfile || saveLock || !isEditingProfile) return;
    setSaveLock(true);
    toast.dismiss();

    try {
      if (fullName.trim().length < 3) {
        toast.error("Name must be at least 3 characters long", { id: "profile-error" });
        setFullName(prevFullName);
        setEmail(prevEmail);
        return;
      }

      if (!validateEmail(email)) {
        toast.error("Please enter a valid email address (e.g., example@domain.com)", { id: "profile-error" });
        setFullName(prevFullName);
        setEmail(prevEmail);
        return;
      }

      const updates = {};
      if (email !== prevEmail) updates.email = email;
      if (fullName !== prevFullName) updates.fullName = fullName;
  
      if (Object.keys(updates).length === 0) {
        toast.success("No changes detected");
        setIsEditingProfile(false);
        return;
      }
  
      console.log("Sending update request..."); 
      await updateProfile(updates);
      console.log("Update request completed"); 
  
      toast.success("Profile updated successfully");
      setPrevFullName(fullName);
      setPrevEmail(email);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update profile");
      setFullName(prevFullName);
      setEmail(prevEmail);
    } finally {
      setSaveLock(false);
    }
  };

  const handleSavePassword = async () => {
    if (isUpdatingProfile) return;
  
    toast.dismiss();
  
    try {
      if (!password && !confirmPassword) {
        toast.success("No changes detected");
        setPassword("");
        setConfirmPassword("");
        setIsEditingPassword(false);
        return;
      }
  
      if (!password || !confirmPassword) {
        toast.error("Please fill both password fields");
        return;
      }
  
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
  
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
  
      await updateProfile({ password });
      toast.success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
      setIsEditingPassword(false);
    } catch (err) {
      if (err.message === "NEW_PASSWORD_SAME_AS_CURRENT") {
        toast.error("New password must be different from current one");
      } else {
        toast.error(err.message || "Failed to update password");
      }
    }
  };

  const handleCancelProfileEdit = () => {
    setFullName(prevFullName);
    setEmail(prevEmail);
    setIsEditingProfile(false);
  };

  const handleCancelPasswordEdit = () => {
    setPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);
  };

  return (
    <div className="h-screen pt-20 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the icon to change photo"}
            </p>
          </div>

          {/* Profile Info Section */}
          <div className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Full name</label>
              <div className="relative">
                <User className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditingProfile || isUpdatingProfile}
                />
            </div>
          </div>


            {/* Email Input */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                className="input input-bordered w-full pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditingProfile || isUpdatingProfile}
              />
            </div>
            
            {!validateEmail(email) && email.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Please enter a valid email address (e.g., example@domain.com)
              </p>
            )}
            </div>


            {/* Profile Edit Buttons */}
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn btn-outline w-full hover:bg-primary hover:border-primary hover:text-zinc-900"
              >
                <Pencil className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleCancelProfileEdit}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                   onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveProfile();
                  }}
                  className="btn btn-primary flex-1"
                  disabled={isUpdatingProfile || saveLock}
                >
                  {isUpdatingProfile || saveLock ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Change Password</h3>

          {/* New Password Input */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isEditingPassword || isUpdatingProfile}
                  placeholder="Enter new password"
                />
              
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >

              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!isEditingPassword || isUpdatingProfile}
                  placeholder="Confirm new password"
                />
                
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >

                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>


            {/* Password Edit Buttons */}
            {!isEditingPassword ? (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="btn btn-outline w-full hover:bg-primary hover:border-primary hover:text-zinc-900"
              >
                <Pencil className="w-5 h-5 mr-2" />
                Change Password
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleCancelPasswordEdit}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePassword}
                  className="btn btn-primary flex-1"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving..." : "Save Password"}
                </button>
              </div>
            )}
          </div>

          {/* Account Info Section */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0] || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">{authUser?.status || "Active"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;