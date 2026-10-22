declare global {
   interface Layout {
      params: Promise<{ locale: Locale }>;
      children: ReactNode;
   }

   type Router_Layout = (properties: Layout) => Promise<ReactNode> | ReactNode;
   type Router_Page = (...parameters: unknown[]) => JSXElement;
}

export {};
