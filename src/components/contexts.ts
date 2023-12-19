import React from "react";

export type ContentContext = {
  id: string;
};

export const ContentContext = React.createContext<ContentContext | null>(null);
