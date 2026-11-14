import type { ReactNode } from "react";
import type { Exhibit } from "../../data/exhibits";
import { MoonDialogue } from "../moon/MoonDialogue";
import { MarsCredits } from "./MarsCredits";

type MarsDialogueProps = {
  phase: "inspect" | "hook" | "story" | "memory" | "stamp";
  exhibit: Exhibit;
  oxygen: number;
  storyIndex: number;
  memoryIndex: number;
  hookAnswer: number | null;
  memoryAnswer: number | null;
  onClose: () => void;
  onAction: () => void;
  onHookAnswer: (i: number) => void;
  onMemoryAnswer: (i: number) => void;
  onRetryMemory: () => void;
  onNextStory: () => void;
};

export function MarsDialogue(props: MarsDialogueProps) {
  const { exhibit } = props;
  const photoInfo = exhibit.referenceImage && exhibit.referenceImage !== exhibit.characterImage ? {
    localImage: exhibit.referenceImage,
    nasaId: "NASA FIELD RECORD",
    credit: exhibit.referenceImageCredit ?? "NASA",
    caption: exhibit.referenceImageAlt ?? `Historical reference photograph for ${exhibit.name}.`,
  } : undefined;
  const credits: ReactNode = <MarsCredits exhibit={exhibit} />;
  return <MoonDialogue {...props} credits={credits} photoInfo={photoInfo} />;
}
