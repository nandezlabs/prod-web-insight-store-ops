import { useState } from "react";
import { Send } from "lucide-react";
import type { AdminNote } from "../types";
import { format } from "date-fns";

interface AdminNotesProps {
  notes: AdminNote[];
  onAddNote: (note: string) => Promise<void>;
  isLoading: boolean;
}

export function AdminNotes({ notes, onAddNote, isLoading }: AdminNotesProps) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an admin note (visible to store users)..."
          className="flex-1 min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting || isLoading}
        />
        <button
          type="submit"
          disabled={!newNote.trim() || isSubmitting || isLoading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No admin notes yet
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{note.createdBy}</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(note.createdAt), "PPp")}
                </span>
              </div>
              <p className="text-sm">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
