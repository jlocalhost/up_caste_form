"use client";

import { formatBoothLabel, type ResolvedArea } from "../lib/survey-math";
import type { Booth, District } from "../types";
import type { PickerKind } from "./AreaSection";
import PickerSheet from "./PickerSheet";

type BoothList = { booths: Booth[]; loading: boolean; failed: boolean; retry: () => void };

type Props = {
  kind: PickerKind;
  districts: District[];
  area: ResolvedArea;
  boothList: BoothList;
  onSelectDistrict: (districtId: string) => void;
  onSelectAssembly: (assemblyId: string) => void;
  onSelectBooth: (booth: Booth) => void;
  onClose: () => void;
};

/** Renders the bottom sheet for whichever area level (district → assembly → booth) is being picked. */
export default function AreaPicker({
  kind,
  districts,
  area,
  boothList,
  onSelectDistrict,
  onSelectAssembly,
  onSelectBooth,
  onClose,
}: Props) {
  if (kind === "district") {
    return (
      <PickerSheet
        title="जिला चुनें"
        subtitle="उत्तर प्रदेश"
        searchPlaceholder="जिला खोजें"
        emptyText="कोई जिला नहीं मिला"
        options={districts.map((d) => ({ id: d.id, label: d.name, detail: `${d.assemblies.length} विधानसभा` }))}
        selectedId={area.district?.id ?? ""}
        onSelect={onSelectDistrict}
        onClose={onClose}
      />
    );
  }

  if (kind === "assembly") {
    if (!area.district) return null;
    const assemblies = districts.find((d) => d.id === area.district?.id)?.assemblies ?? [];
    return (
      <PickerSheet
        title="विधानसभा चुनें"
        subtitle={area.district.name}
        searchPlaceholder="विधानसभा खोजें"
        emptyText="कोई विधानसभा नहीं मिली"
        options={assemblies.map((a) => ({ id: a.id, label: a.name, detail: `${a.boothCount} बूथ` }))}
        selectedId={area.assembly?.id ?? ""}
        onSelect={onSelectAssembly}
        onClose={onClose}
      />
    );
  }

  if (!area.district || !area.assembly) return null;
  return (
    <PickerSheet
      title="बूथ चुनें"
      subtitle={`${area.district.name} · ${area.assembly.name}`}
      searchPlaceholder="बूथ नंबर या स्थान खोजें"
      emptyText="कोई बूथ नहीं मिला"
      options={boothList.booths.map((b) => ({
        id: b.id,
        label: formatBoothLabel(b),
        detail: `सूचीबद्ध मतदाता: ${b.voters}`,
      }))}
      selectedId={area.booth?.id ?? ""}
      onSelect={(id) => {
        const booth = boothList.booths.find((b) => b.id === id);
        if (booth) onSelectBooth(booth);
      }}
      onClose={onClose}
      loading={boothList.loading}
      failedText={boothList.failed ? "बूथ सूची लोड नहीं हो सकी" : undefined}
      onRetry={boothList.retry}
    />
  );
}
