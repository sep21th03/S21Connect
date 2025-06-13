'use client'
import FavoritePhotosPage from '@/components/Favorite/FavoritePhotosPage'
import React from 'react'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams();
  const page = params?.page as string;

  return <FavoritePhotosPage page={page} />;
}
