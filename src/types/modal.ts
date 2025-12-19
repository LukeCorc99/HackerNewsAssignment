export type AuthAction = "login" | "register";

export interface AuthModalProps {
  action: AuthAction;
  onClose: () => void;
  onSuccess: (action: AuthAction) => void;
}

export interface SubmitPostModalProps {
  onClose: () => void;
  editingPost?: {
    id: number;
    title: string;
    url?: string | null;
    text?: string | null;
  } | null;
  onEditComplete?: () => void;
  username?: string;
}
