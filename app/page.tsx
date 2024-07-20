import MainPage from "@/component/MainPage";
import { Metadata } from "next";

export default function Home() {
  return <MainPage></MainPage>;
}

export const metadata: Metadata = {
  title: "Настольный теннис на Европейском Берегу",
};
