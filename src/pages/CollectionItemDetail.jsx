import { useParams } from "react-router-dom";
import { mainCollections } from "../data/collections";
import SeriesDetail from "./SeriesDetail";
import TcgSetDetail from "./TcgSetDetail";

const CollectionItemDetail = () => {
  const { collectionId } = useParams();

  const collectionData = mainCollections.find((collection) => {
    return collection.id === collectionId;
  });

  if (collectionData?.provider === "italian-brainrot") {
    return <SeriesDetail />;
  }

  return <TcgSetDetail />;
};

export default CollectionItemDetail;
