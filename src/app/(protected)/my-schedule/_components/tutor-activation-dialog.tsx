"use client";

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Sparkles, Shield} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {LocalizedBioInput, localizedBioSchema, EMPTY_LOCALIZED} from "@/components/ui/localized-bio-input";
import {IconPhone, IconFileText, IconCamera, IconCheck} from "@tabler/icons-react";
import {useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";

const MAX_FILE_SIZE_MB = 2;

const activationFormSchema = z.object({
  phone: z.string().optional(),
  bio: localizedBioSchema,
  imageUrl: z.string().optional(),
});

interface TutorActivationDialogProps {
  open: boolean;
  onActivate: (formData: FormData) => Promise<void>;
}

export function TutorActivationDialog({open, onActivate}: TutorActivationDialogProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const {user} = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof activationFormSchema>>({
    resolver: zodResolver(activationFormSchema),
    defaultValues: {
      phone: "",
      bio: EMPTY_LOCALIZED,
      imageUrl: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 2MB.",
      });
      return;
    }

    // Stage the file for upload on submit, with an instant local preview
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSelectedFile(file);
    setUploadedFileName(file.name);
    setUploaded(false);
  };

  const handleActivate = async (values: z.infer<typeof activationFormSchema>) => {
    setIsActivating(true);
    try {
      // Upload the staged avatar first, now that the form is submitted
      let imageUrl = values.imageUrl?.trim() || "";
      if (selectedFile && user) {
        setIsUploadingImage(true);
        try {
          await user.setProfileImage({file: selectedFile});
          imageUrl = user.imageUrl;
          setUploaded(true);
        } catch (err) {
          console.error(err);
          toast.error("Upload failed", {
            description: "Something went wrong while uploading your avatar.",
          });
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const formData = new FormData();

      if (values.phone?.trim()) {
        formData.append("phone", values.phone);
      }

      formData.append("bio", JSON.stringify(values.bio));

      if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      await onActivate(formData);
      toast.success("Account activated successfully!");
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("Failed to activate account. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden border-none shadow-2xl sm:max-w-xl"
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          router.push("/dashboard");
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          router.push("/dashboard");
        }}
      >
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 p-4 pb-6 sm:p-8 sm:pb-12">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700/50 via-transparent to-blue-700/50"/>

          {/* Animated sparkles background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 animate-pulse">
              <Sparkles className="w-6 h-6 text-white/30"/>
            </div>
            <div className="absolute top-20 right-16 animate-pulse" style={{animationDelay: "0.3s"}}>
              <Sparkles className="w-4 h-4 text-white/20"/>
            </div>
            <div className="absolute bottom-16 left-20 animate-pulse" style={{animationDelay: "0.7s"}}>
              <Sparkles className="w-5 h-5 text-white/25"/>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-2 sm:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"/>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-4 border border-white/20">
                <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-white"/>
              </div>
            </div>
            <DialogHeader className="space-y-1 sm:space-y-2">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-white">
                Activate Your Tutor Account
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm sm:text-base">
                Get started by activating your account to access all tutor features
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-background p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete your profile to unlock full schedule management and session booking features.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleActivate)} className="space-y-3 sm:space-y-5">
              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconPhone className="h-4 w-4"/>
                      Phone Number
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., +386 40 123 456"
                        type="tel"
                        className="h-10 sm:h-12"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Students may contact you via this number for session coordination.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {/* Bio Field */}
              <FormField
                control={form.control}
                name="bio"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconFileText className="h-4 w-4"/>
                      Bio
                    </FormLabel>
                    <FormControl>
                      <LocalizedBioInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Tell students about your teaching experience and approach..."
                        textareaClassName="resize-none overflow-y-auto h-[4.5rem] max-h-[4.5rem] sm:h-[5.5rem] sm:max-h-[5.5rem] [field-sizing:fixed]"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Share your teaching philosophy, experience, or specializations in each language.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {/* Profile Photo Field */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconCamera className="h-4 w-4"/>
                      Profile Photo
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex w-full items-center gap-3 rounded-md border border-input p-2">
                        <label
                          aria-disabled={isUploadingImage || isActivating}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        >
                          <IconCamera className="h-4 w-4"/>
                          Choose photo
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingImage || isActivating}
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>

                        {previewUrl ? (
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt="Selected photo preview"
                              className="h-9 w-9 shrink-0 rounded-md object-cover"
                            />
                            <span className="truncate text-sm text-muted-foreground">
                              {uploadedFileName}
                            </span>
                            {isUploadingImage ? (
                              <div
                                className="ml-auto h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-purple-600/30 border-t-purple-600"/>
                            ) : uploaded ? (
                              <IconCheck className="ml-auto h-4 w-4 shrink-0 text-green-600"/>
                            ) : null}
                          </div>
                        ) : (
                          <span className="truncate text-sm text-muted-foreground">
                            No file chosen
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Upload a professional photo (max 2MB). Image will be uploaded immediately after selection.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4">
                <Button
                  type="submit"
                  disabled={isActivating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isActivating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Activating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5"/>
                      Activate Account
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

