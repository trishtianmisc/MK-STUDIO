import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "#c9ad73",
"--normal-text": "#000000",
"--success-bg": "#c9ad73",
"--success-text": "#000000",
"--error-bg": "#c9ad73",
"--error-text": "#000000",


        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
