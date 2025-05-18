import { FC, useState } from "react";
import DetailGallery from "./DetailGallery";
import Album from "./Album";
import { useSession } from "next-auth/react";

const AlbumsList: FC = () => {
  const [showPhotos, setShowPhotos] = useState(false);
  const { data: session } = useSession();
  const userid = session?.user?.id || "defaultUser";
  return (
    <>
      <Album setShowPhotos={setShowPhotos} showPhotos={showPhotos} lg={4} xl={3} userid={userid} />
      <DetailGallery setShowPhotos={setShowPhotos} showPhotos={showPhotos} />
    </>
  );
};

export default AlbumsList;
