import { FC, ReactNode } from "react";
import { ThemeProvider } from "next-themes";

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

const ThemeProviderWrapper: FC<ThemeProviderWrapperProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
