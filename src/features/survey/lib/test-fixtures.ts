import type { Booth, District } from "../types";

export const lucknowCentralBooth: Booth = {
  id: "b-159",
  assemblyId: "lucknow-central",
  number: "159",
  name: "प्राथमिक विद्यालय, हुसैनगंज",
  voters: 864,
};

export const districtsFixture: District[] = [
  {
    id: "lucknow",
    name: "लखनऊ",
    assemblies: [
      { id: "lucknow-central", name: "लखनऊ मध्य", boothCount: 3 },
      { id: "lucknow-east", name: "लखनऊ पूर्व", boothCount: 2 },
    ],
  },
];
