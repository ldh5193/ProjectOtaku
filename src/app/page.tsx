import Header from "@/components/Header";
import HomeClient from "@/components/HomeClient";
import type { Store } from "@/types/store";
import storesData from "../../public/data/stores.json";

const stores: Store[] = storesData as Store[];

export default function Home() {
  return (
    <>
      <Header />
      <HomeClient stores={stores} />
    </>
  );
}
