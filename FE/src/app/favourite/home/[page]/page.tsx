'use client'
import FavoriteHomePage from '@/components/Favorite/FavoriteHomePage'
import React from 'react'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const page = params?.page as string

  return <FavoriteHomePage page={page} />
}
