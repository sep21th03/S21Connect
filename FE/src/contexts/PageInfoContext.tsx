"use client";
import { createContext, useContext, useEffect, useState } from "react";
import fanpageService from "@/service/fanpageService";

interface PageInfo {
  slug: string;
  name: string;
  avatar: string;
  cover_image: string;
  followers_count: number;
  posts_count: number;
  type: string;
  email: string;
  phone: string;
  link: string;
}

const PageInfoContext = createContext<PageInfo | null>(null);

export const usePageInfo = () => useContext(PageInfoContext);

export const PageInfoProvider = ({
  page,
  children
}: {
  page: string;
  children: React.ReactNode;
}) => {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  useEffect(() => {
    fanpageService.getPageBySlug(page).then((res) => {
      setPageInfo(res as any);
    });
  }, [page]);

  return (
    <PageInfoContext.Provider value={pageInfo}>
      {children}
    </PageInfoContext.Provider>
  );
};
