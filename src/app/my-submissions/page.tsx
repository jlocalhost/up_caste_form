import type { Metadata } from "next";
import MySubmissions from "@/features/survey/components/MySubmissions";

export const metadata: Metadata = {
  title: "मेरे सबमिशन | सामाजिक संरचना सर्वेक्षण",
};

export default function MySubmissionsPage() {
  return <MySubmissions />;
}
