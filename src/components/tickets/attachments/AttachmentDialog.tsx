
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";

interface AttachmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAttachments: (attachments: { name: string; size: number; type: string; url: string; }[]) => void; // Added this prop to match usage
}

export function AttachmentDialog({ isOpen, onClose, onAddAttachments }: AttachmentDialogProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    // Mock file upload - convert Files to attachment objects
    const attachments = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // In a real app, this would be the URL from the server
    }));

    onAddAttachments(attachments);
    setFiles([]);
    onClose();
    toast.success(`${attachments.length} file(s) uploaded successfully`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Attachments</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button type="button" variant="secondary" size="icon" onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          
          {files.length > 0 && (
            <div className="border rounded-md p-2">
              <p className="text-sm font-medium mb-2">Selected files ({files.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <PaperclipIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0}>
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AttachmentDialog;
