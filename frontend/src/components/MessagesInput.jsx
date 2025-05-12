import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

export const MessagesInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { theme } = useThemeStore();

  // Визначаємо, чи це мобільний пристрій
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const onEmojiClick = (emojiData) => {
    setText(prevText => prevText + emojiData.emoji);
    if (isMobile) setShowEmojiPicker(false); // Закриваємо після вибору на мобільних
  };

  return (
    <div className="p-4 w-full relative">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef} 
          className={`
            absolute bottom-16 left-0 right-0 z-10 shadow-xl
            ${isMobile ? 'fixed inset-x-0 bottom-16 mx-2' : 'absolute left-4 w-[300px]'}
          `}
        >
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            width={isMobile ? '100%' : 300}
            height={isMobile ? 350 : 350}
            previewConfig={{ showPreview: false }}
            theme={theme === 'dark' ? 'dark' : 'light'}
            skinTonePickerLocation="SEARCH"
            searchPlaceholder="Search emoji..."
            suggestedEmojisMode="frequent"
            lazyLoadEmojis={true}
            emojiStyle="native"
            style={{
              '--epr-bg-color': theme === 'dark' ? 'hsl(var(--b1))' : 'hsl(var(--b2))',
              '--epr-category-label-bg-color': theme === 'dark' ? 'hsl(var(--b2))' : 'hsl(var(--b1))',
              '--epr-text-color': 'hsl(var(--bc))',
              '--epr-search-input-bg-color': theme === 'dark' ? 'hsl(var(--b3))' : 'hsl(var(--b1))',
              '--epr-search-input-text-color': 'hsl(var(--bc))',
              '--epr-search-input-border-color': theme === 'dark' ? 'hsl(var(--b3))' : 'hsl(var(--b2))',
              '--epr-search-input-placeholder-color': 'hsl(var(--bc)/0.6)',
              '--epr-emoji-size': isMobile ? '1.8rem' : '1.5rem',
            }}
          />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 items-center">
          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md ${
              showEmojiPicker ? "text-primary" : "text-zinc-400"
            } hover:text-primary transition-colors`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Toggle emoji picker"
          >
            <Smile size={20} />
          </button>

          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md ${
              imagePreview ? "text-primary" : "text-zinc-400"
            } hover:text-primary transition-colors`}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach image"
          >
            <Image size={20} />
          </button>
        </div>
        <button 
          type="submit" 
          className="btn btn-circle btn-sm sm:btn-md btn-primary hover:bg-primary/90 transition-colors"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};