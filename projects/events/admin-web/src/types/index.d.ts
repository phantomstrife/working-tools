declare global {
   interface Layout {
      children: ReactNode;
   }

   type Router_Layout = (properties: Layout) => Promise<ReactNode> | ReactNode;
   type Router_Page = (...parameters: unknown[]) => JSXElement;
}

export {};
