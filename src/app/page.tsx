import Header from "@/components/Header";
import MapSection from "@/components/map/MapSection";
import type { Store } from "@/types/store";
import storesData from "../../public/data/stores.json";

const stores: Store[] = storesData as Store[];

export default function Home() {
  return (
    <>
      <Header />
      <MapSection stores={stores} />
    </>
  );
}
