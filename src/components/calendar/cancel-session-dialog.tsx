"use client";

import {useState, useTransition} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {cancelRegularSession} from "@/actions/timeblocks";
import {useRouter} from "next/navigation";
import {IconLoader2} from "@tabler/icons-react";
import {usePreferredTimezone} from "@/lib/use-preferred-timezone";
import {formatInTimeZone} from "date-fns-tz";

interface CancelSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationId: number;
  sessionDate: Date;
  studentName: string | null;
}

export function CancelSessionDialog({
  open,
  onOpenChange,
  invitationId,
  sessionDate,
  studentName,
}: CancelSessionDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const timezone = usePreferredTimezone();

  const formattedDate = formatInTimeZone(sessionDate, timezone, "EEEE, MMMM d, yyyy");

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelRegularSession(
        invitationId,
        sessionDate,
        reason || undefined
      );

      if (result.status === 200) {
        onOpenChange(false);
        setReason("");
        router.refresh();
      } else {
        console.error("Failed to cancel session:", result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel the session with{" "}
            <strong>{studentName || "this student"}</strong> on{" "}
            <strong>{formattedDate}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium">
            Reason (optional)
          </label>
          <Textarea
            id="reason"
            placeholder="Let your student know why you're cancelling..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Keep Session
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
