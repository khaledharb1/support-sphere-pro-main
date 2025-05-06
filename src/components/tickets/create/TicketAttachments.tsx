
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PaperclipIcon, X, FileIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";

interface TicketAttachmentsProps {
  files: File[];
  setFiles: (files: File[]) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const TicketAttachments = ({
  files,
  setFiles,
  onCancel,
  onSubmit,
  isSubmitting,
}: TicketAttachmentsProps) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_FILES = 10;
  const [previews, setPreviews] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Clean up old previews
    return () => {
      Object.values(previews).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    // Generate previews for image files
    const newPreviews: Record<string, string> = {};

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (!previews[file.name]) {
          newPreviews[file.name] = URL.createObjectURL(file);
        } else {
          newPreviews[file.name] = previews[file.name];
        }
      }
    });
    
    // Revoke URLs for removed files
    Object.entries(previews).forEach(([name, url]) => {
      if (!files.some(f => f.name === name)) {
        URL.revokeObjectURL(url);
      }
    });
    
    setPreviews(prevPreviews => {
      return {...prevPreviews, ...newPreviews};
    });
  }, [files]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Check file count limit
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} files`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the 5MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      
      // Only add files that are within size limits
      const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE);
      setFiles([...files, ...validFiles]);
      return;
    }
    
    // All files are valid
    setFiles([...files, ...newFiles]);
    
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleRemoveFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));
    
    // If this file has a preview, revoke its object URL
    if (previews[file.name]) {
      URL.revokeObjectURL(previews[file.name]);
      setPreviews(prev => {
        const newPreviews = {...prev};
        delete newPreviews[file.name];
        return newPreviews;
      });
    }
    
    toast.info(`Removed ${file.name}`);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  // Helper function to get the appropriate icon for a file
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileTextIcon className="h-6 w-6 text-red-500" />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return <FileTextIcon className="h-6 w-6 text-green-500" />;
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return <FileTextIcon className="h-6 w-6 text-blue-700" />;
    } else {
      return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
        <CardDescription>Upload any relevant files or screenshots</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button type="button" variant="outline" className="mr-2">
                <PaperclipIcon className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </Label>
            <span className="text-sm text-gray-500">
              Max {MAX_FILES} files, 5MB each
            </span>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-medium">
                Selected files ({files.length}/{MAX_FILES})
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-md border overflow-hidden"
                  >
                    {file.type.startsWith('image/') && previews[file.name] ? (
                      <div className="relative h-32 bg-gray-100">
                        <img 
                          src={previews[file.name]}
                          alt={file.name}
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => handleRemoveFile(file)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center bg-gray-50 relative">
                        {getFileIcon(file)}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => handleRemoveFile(file)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    )}
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="button" 
          disabled={isSubmitting} 
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          ) : (
            "Create Ticket"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketAttachments;
