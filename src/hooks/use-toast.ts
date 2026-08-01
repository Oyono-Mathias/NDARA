import { toast as sonnerToast } from "sonner";

export const toast = (props: { variant?: "default" | "destructive", title?: string, description?: string }) => {
  if (props.variant === "destructive") {
    sonnerToast.error(props.title || "Erreur", { description: props.description });
  } else {
    sonnerToast.success(props.title || "Succès", { description: props.description });
  }
};

export const useToast = () => {
  return { toast };
};
