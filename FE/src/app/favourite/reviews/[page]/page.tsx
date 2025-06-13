'use client'
import React, { useEffect, useState } from 'react'
import FavoriteReviewsPage from '@/components/Favorite/FavoriteReviewsPage'
import { useParams } from 'next/navigation'

export default function Page() {
    const params = useParams();
    const page = params?.page as string;

    const [MyAwesomeMap, setClient] = useState<any>();
    useEffect(() => {
        (async () => {
            if (typeof window !== "undefined") {
                const newClient = (await import("@/components/Favorite/FavoriteReviewsPage")).default;
                setClient(() => newClient);
            }
        })();
    }, []);
    return MyAwesomeMap ? <MyAwesomeMap page={page} /> : "";
}
