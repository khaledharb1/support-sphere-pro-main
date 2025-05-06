
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface TicketTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  currentTag: string;
  setCurrentTag: (value: string) => void;
}

const TicketTags = ({
  tags,
  setTags,
  currentTag,
  setCurrentTag,
}: TicketTagsProps) => {
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags</Label>
      <div className="flex">
        <Input
          id="tags"
          placeholder="Add tag and press Enter"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-r-none"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="rounded-l-none bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button
                type="button"
                className="ml-1 text-gray-500 hover:text-gray-800"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove tag</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketTags;
